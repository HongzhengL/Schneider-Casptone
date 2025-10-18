import express from 'express';
import { body } from 'express-validator';
import { getSupabaseClient } from '../utils/supabaseClient.js';
import {
    asyncHandler,
    ExternalServiceError,
    UnauthorizedError,
    ValidationError,
} from '../middleware/errorHandler.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { requireAuth, sessionCookieHelpers } from '../middleware/auth.js';

const router = express.Router();

const getSupabaseOrThrow = () => {
    try {
        return getSupabaseClient();
    } catch (cause) {
        const error = new ExternalServiceError(
            'Authentication service is not configured. Set SUPABASE_URL and SUPABASE_KEY to enable auth routes.',
            'supabase'
        );
        error.status = 503;
        error.cause = cause;
        throw error;
    }
};

const signupValidation = [
    body('email').isEmail().withMessage('A valid email address is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('metadata')
        .optional()
        .isObject()
        .withMessage('Metadata, when provided, must be an object'),
    handleValidationErrors,
];

const loginValidation = [
    body('email').isEmail().withMessage('A valid email address is required'),
    body('password')
        .isString()
        .notEmpty()
        .withMessage('Password is required'),
    body('rememberMe').optional().isBoolean().withMessage('rememberMe must be a boolean'),
    handleValidationErrors,
];

const extractBearerToken = (headerValue) => {
    if (!headerValue || typeof headerValue !== 'string') {
        return null;
    }
    const [scheme, token] = headerValue.split(' ');
    if (!token || scheme.toLowerCase() !== 'bearer') {
        return null;
    }
    return token.trim();
};

const normalizeSupabaseError = (error) => {
    const message = error?.message ?? '';
    return message.toLowerCase();
};

router.post(
    '/signup',
    signupValidation,
    asyncHandler(async (req, res) => {
        const { email, password, metadata = {} } = req.body;
        const supabase = getSupabaseOrThrow();

        const attemptAdminCreate = async () =>
            supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: metadata,
            });

        const attemptSelfService = async () =>
            supabase.auth.signUp({
                email,
                password,
                options: {
                    data: metadata,
                    emailRedirectTo: process.env.SUPABASE_EMAIL_REDIRECT ?? undefined,
                },
            });

        let response = await attemptAdminCreate();
        let requiresConfirmation = false;

        if (response.error) {
            if (normalizeSupabaseError(response.error) === 'user not allowed') {
                response = await attemptSelfService();
                requiresConfirmation = true;
            } else {
                throw new ValidationError(response.error.message);
            }
        }

        if (response.error) {
            throw new ValidationError(response.error.message);
        }

        const createdUser = response.data?.user;

        if (!createdUser) {
            throw new ValidationError('Unable to create user');
        }

        res.status(201).json({
            user: createdUser,
            requiresConfirmation:
                requiresConfirmation || !createdUser.email_confirmed_at || !createdUser.email_confirmed,
        });
    })
);

router.post(
    '/login',
    loginValidation,
    asyncHandler(async (req, res) => {
        const { email, password, rememberMe = false } = req.body;
        const supabase = getSupabaseOrThrow();

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.session) {
            throw new UnauthorizedError(error?.message ?? 'Invalid email or password');
        }

        sessionCookieHelpers.setSessionCookies(res, data.session, rememberMe === true);

        res.json({
            user: data.user,
            expiresIn: data.session.expires_in,
        });
    })
);

router.post(
    '/logout',
    asyncHandler(async (req, res) => {
        const supabase = getSupabaseOrThrow();

        const headerToken = extractBearerToken(req.get('Authorization'));
        const cookieAccess = req.cookies?.sb_access_token ?? null;
        const cookieRefresh = req.cookies?.sb_refresh_token ?? null;
        const bodyAccess = typeof req.body?.accessToken === 'string' ? req.body.accessToken : null;
        const bodyRefresh = typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : null;

        const accessToken = headerToken ?? cookieAccess ?? bodyAccess;
        const refreshToken = cookieRefresh ?? bodyRefresh;

        if (accessToken && refreshToken) {
            const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
            });

            if (!sessionError) {
                await supabase.auth.signOut({ scope: 'local' });
            }
        }

        sessionCookieHelpers.clearSessionCookies(res);
        res.status(200).json({ success: true });
    })
);

router.get(
    '/me',
    requireAuth,
    (req, res) => {
        res.json({ user: req.user });
    }
);

export const authRouter = router;
