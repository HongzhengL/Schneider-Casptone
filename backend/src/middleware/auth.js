import { config } from '../config/environment.js';
import { getSupabaseClient } from '../utils/supabaseClient.js';
import { ExternalServiceError, UnauthorizedError } from './errorHandler.js';

const ACCESS_COOKIE = 'sb_access_token';
const REFRESH_COOKIE = 'sb_refresh_token';
const PERSISTENCE_COOKIE = 'sb_persistent';

const getBearerToken = (headerValue) => {
    if (!headerValue || typeof headerValue !== 'string') {
        return null;
    }

    const [scheme, token] = headerValue.split(' ');
    if (!token || scheme.toLowerCase() !== 'bearer') {
        return null;
    }

    return token.trim();
};

const frontendHostname = (() => {
    try {
        const url = new URL(config.frontendUrl);
        return url.hostname;
    } catch {
        return '';
    }
})();

const isLocalFrontend =
    frontendHostname === 'localhost' ||
    frontendHostname === '127.0.0.1' ||
    frontendHostname === '[::1]';

const cookieSameSite = isLocalFrontend ? 'lax' : 'none';
const cookieSecure = !isLocalFrontend;

const cookieOptions = (maxAge) => ({
    httpOnly: true,
    sameSite: cookieSameSite,
    secure: cookieSecure,
    ...(typeof maxAge === 'number' ? { maxAge } : {}),
});

const setSessionCookies = (res, session, persistent = false) => {
    const accessTtlMs = (session.expires_in ?? 3600) * 1000;
    res.cookie(ACCESS_COOKIE, session.access_token, cookieOptions(accessTtlMs));

    const refreshOptions = persistent ? cookieOptions(1000 * 60 * 60 * 24 * 30) : cookieOptions();
    res.cookie(REFRESH_COOKIE, session.refresh_token, refreshOptions);

    const persistenceOptions = persistent
        ? cookieOptions(1000 * 60 * 60 * 24 * 30)
        : cookieOptions();
    res.cookie(PERSISTENCE_COOKIE, persistent ? '1' : '0', persistenceOptions);
};

const clearSessionCookies = (res) => {
    const baseOptions = {
        httpOnly: true,
        sameSite: cookieSameSite,
        secure: cookieSecure,
    };

    res.clearCookie(ACCESS_COOKIE, baseOptions);
    res.clearCookie(REFRESH_COOKIE, baseOptions);
    res.clearCookie(PERSISTENCE_COOKIE, baseOptions);
};

const extractAccessToken = (req) => {
    const headerToken = getBearerToken(req.get('Authorization'));
    if (headerToken) {
        return headerToken;
    }

    return req.cookies?.[ACCESS_COOKIE] ?? null;
};

export const requireAuth = async (req, res, next) => {
    try {
        const accessToken = extractAccessToken(req);
        if (!accessToken) {
            throw new UnauthorizedError('Authentication required');
        }

        let supabase;

        try {
            supabase = getSupabaseClient();
        } catch (cause) {
            const error = new ExternalServiceError(
                'Authentication service is not configured. Set SUPABASE_URL and SUPABASE_KEY to enable auth routes.',
                'supabase'
            );
            error.status = 503;
            error.cause = cause;
            throw error;
        }

        const { data, error } = await supabase.auth.getUser(accessToken);

        if (error || !data?.user) {
            const refreshToken = req.cookies?.[REFRESH_COOKIE];

            if (!refreshToken) {
                throw new UnauthorizedError('Invalid or expired access token');
            }

            const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession({
                refresh_token: refreshToken,
            });

            if (refreshError || !refreshed?.session?.access_token) {
                clearSessionCookies(res);
                throw new UnauthorizedError('Invalid or expired access token');
            }

            const persistent = req.cookies?.[PERSISTENCE_COOKIE] === '1';
            setSessionCookies(res, refreshed.session, persistent);
            req.user = refreshed.session.user;
            return next();
        }

        req.user = data.user;
        next();
    } catch (error) {
        next(error);
    }
};

const normalizeAllowList = (allowList) =>
    allowList.map((entry) => {
        if (entry instanceof RegExp) {
            return (req) => entry.test(req.path);
        }

        if (typeof entry === 'function') {
            return entry;
        }

        if (typeof entry === 'string') {
            return (req) => req.path === entry;
        }

        return () => false;
    });

export const buildAuthGuard = ({ allowList = [], supabaseConfigured = false } = {}) => {
    const matchers = normalizeAllowList(allowList);

    return (req, res, next) => {
        if (req.method === 'OPTIONS') {
            return next();
        }

        if (matchers.some((matcher) => matcher(req))) {
            return next();
        }

        if (!supabaseConfigured) {
            const error = new ExternalServiceError(
                'Authentication service is not configured. Set SUPABASE_URL and SUPABASE_KEY to enable protected routes.',
                'supabase'
            );
            error.status = 503;
            return next(error);
        }

        return requireAuth(req, res, next);
    };
};

export const sessionCookieHelpers = {
    setSessionCookies,
    clearSessionCookies,
};
