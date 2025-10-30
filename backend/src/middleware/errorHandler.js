// backend/src/middleware/errorHandler.js
import fs from 'fs';
import path from 'path';

// Enhanced error handler with more features
export const errorHandler = (err, req, res, _next) => {
    // Enhanced error logging with more details
    const errorLog = {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        timestamp: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        headers: {
            'content-type': req.get('Content-Type'),
            authorization: req.get('Authorization') ? '***REDACTED***' : undefined,
        },
        body: req.body ? sanitizeRequestBody(req.body) : undefined,
        query: req.query,
        params: req.params,
        userId: req.user?.id || 'anonymous',
        sessionId: req.sessionID || 'no-session',
    };

    // Log to console with different levels
    if (err.status >= 500) {
        console.error('🚨 SERVER ERROR:', errorLog);
    } else if (err.status >= 400) {
        console.warn('⚠️  CLIENT ERROR:', errorLog);
    } else {
        console.info('ℹ️  INFO:', errorLog);
    }

    // Log to file in production
    if (process.env.NODE_ENV === 'production') {
        logErrorToFile(errorLog);
    }

    // Default error values
    let status = 500;
    let message = 'Internal Server Error';
    let details = null;
    let errorCode = 'INTERNAL_ERROR';

    // Handle specific error types with more comprehensive coverage
    if (err.name === 'ValidationError') {
        status = 400;
        message = 'Validation Error';
        details = err.details || err.message;
        errorCode = 'VALIDATION_ERROR';
    } else if (err.name === 'UnauthorizedError') {
        status = 401;
        message = 'Unauthorized';
        details = 'Authentication required';
        errorCode = 'UNAUTHORIZED';
    } else if (err.name === 'ForbiddenError') {
        status = 403;
        message = 'Forbidden';
        details = 'Insufficient permissions';
        errorCode = 'FORBIDDEN';
    } else if (err.name === 'NotFoundError') {
        status = 404;
        message = 'Not Found';
        details = err.message || 'The requested resource was not found';
        errorCode = 'NOT_FOUND';
    } else if (err.name === 'ConflictError') {
        status = 409;
        message = 'Conflict';
        details = err.message || 'Resource conflict occurred';
        errorCode = 'CONFLICT';
    } else if (err.name === 'TooManyRequestsError') {
        status = 429;
        message = 'Too Many Requests';
        details = 'Rate limit exceeded';
        errorCode = 'RATE_LIMIT_EXCEEDED';
    } else if (err.name === 'DatabaseError') {
        status = 500;
        message = 'Database Error';
        details =
            process.env.NODE_ENV === 'development' ? err.message : 'Database operation failed';
        errorCode = 'DATABASE_ERROR';
    } else if (err.name === 'ExternalServiceError') {
        status = 502;
        message = 'External Service Error';
        details = 'External service is unavailable';
        errorCode = 'EXTERNAL_SERVICE_ERROR';
    } else if (err.name === 'TimeoutError') {
        status = 504;
        message = 'Request Timeout';
        details = 'The request took too long to process';
        errorCode = 'TIMEOUT';
    } else if (err.name === 'SyntaxError' && err.status === 400) {
        status = 400;
        message = 'Bad Request';
        details = 'Invalid JSON syntax';
        errorCode = 'INVALID_JSON';
    } else if (err.name === 'MulterError') {
        status = 400;
        message = 'File Upload Error';
        details = handleMulterError(err);
        errorCode = 'FILE_UPLOAD_ERROR';
    } else if (err.name === 'JWTError') {
        status = 401;
        message = 'Invalid Token';
        details = 'Authentication token is invalid or expired';
        errorCode = 'INVALID_TOKEN';
    } else if (err.status) {
        status = err.status;
        message = err.message;
        errorCode = err.errorCode || 'CUSTOM_ERROR';
    }

    // Create response object
    const response = {
        error: message,
        errorCode,
        timestamp: new Date().toISOString(),
        path: req.path,
        requestId: req.requestId || generateRequestId(),
    };

    // Include additional details based on environment
    if (process.env.NODE_ENV === 'development') {
        response.details = details || err.message;
        response.stack = err.stack;
        response.debug = {
            originalError: err.name,
            statusCode: status,
            method: req.method,
            url: req.url,
        };
    } else if (process.env.NODE_ENV === 'production' && status < 500) {
        // In production, only show details for client errors (4xx)
        response.details = details;
    }

    // Add retry information for certain errors
    if (status === 429 || status === 502 || status === 503 || status === 504) {
        response.retryAfter = getRetryAfter(status);
    }

    // Send response
    res.status(status).json(response);
};

// Enhanced custom error classes
export class ValidationError extends Error {
    constructor(message, details = null, field = null) {
        super(message);
        this.name = 'ValidationError';
        this.status = 400;
        this.errorCode = 'VALIDATION_ERROR';
        this.details = details;
        this.field = field;
    }
}

export class NotFoundError extends Error {
    constructor(message = 'Resource not found', resource = null) {
        super(message);
        this.name = 'NotFoundError';
        this.status = 404;
        this.errorCode = 'NOT_FOUND';
        this.resource = resource;
    }
}

export class UnauthorizedError extends Error {
    constructor(message = 'Authentication required') {
        super(message);
        this.name = 'UnauthorizedError';
        this.status = 401;
        this.errorCode = 'UNAUTHORIZED';
    }
}

export class ForbiddenError extends Error {
    constructor(message = 'Insufficient permissions') {
        super(message);
        this.name = 'ForbiddenError';
        this.status = 403;
        this.errorCode = 'FORBIDDEN';
    }
}

export class ConflictError extends Error {
    constructor(message = 'Resource conflict occurred', conflictingField = null) {
        super(message);
        this.name = 'ConflictError';
        this.status = 409;
        this.errorCode = 'CONFLICT';
        this.conflictingField = conflictingField;
    }
}

export class TooManyRequestsError extends Error {
    constructor(message = 'Rate limit exceeded', retryAfter = 60) {
        super(message);
        this.name = 'TooManyRequestsError';
        this.status = 429;
        this.errorCode = 'RATE_LIMIT_EXCEEDED';
        this.retryAfter = retryAfter;
    }
}

export class DatabaseError extends Error {
    constructor(message = 'Database operation failed', operation = null) {
        super(message);
        this.name = 'DatabaseError';
        this.status = 500;
        this.errorCode = 'DATABASE_ERROR';
        this.operation = operation;
    }
}

export class ExternalServiceError extends Error {
    constructor(message = 'External service error', service = null) {
        super(message);
        this.name = 'ExternalServiceError';
        this.status = 502;
        this.errorCode = 'EXTERNAL_SERVICE_ERROR';
        this.service = service;
    }
}

export class TimeoutError extends Error {
    constructor(message = 'Request timeout', timeout = null) {
        super(message);
        this.name = 'TimeoutError';
        this.status = 504;
        this.errorCode = 'TIMEOUT';
        this.timeout = timeout;
    }
}

export class JWTError extends Error {
    constructor(message = 'Invalid token', tokenType = 'access') {
        super(message);
        this.name = 'JWTError';
        this.status = 401;
        this.errorCode = 'INVALID_TOKEN';
        this.tokenType = tokenType;
    }
}

// Utility functions
function sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    sensitiveFields.forEach((field) => {
        if (sanitized[field]) {
            sanitized[field] = '***REDACTED***';
        }
    });

    return sanitized;
}

function logErrorToFile(errorLog) {
    const logDir = path.join(process.cwd(), 'logs');
    const logFile = path.join(logDir, `errors-${new Date().toISOString().split('T')[0]}.log`);

    // Create logs directory if it doesn't exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry =
        JSON.stringify({
            ...errorLog,
            timestamp: new Date().toISOString(),
        }) + '\n';

    fs.appendFileSync(logFile, logEntry);
}

function generateRequestId() {
    return (
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    );
}

function getRetryAfter(status) {
    switch (status) {
        case 429:
            return 60; // 1 minute for rate limiting
        case 502:
            return 30; // 30 seconds for bad gateway
        case 503:
            return 60; // 1 minute for service unavailable
        case 504:
            return 30; // 30 seconds for gateway timeout
        default:
            return null;
    }
}

function handleMulterError(err) {
    switch (err.code) {
        case 'LIMIT_FILE_SIZE':
            return 'File too large';
        case 'LIMIT_FILE_COUNT':
            return 'Too many files';
        case 'LIMIT_UNEXPECTED_FILE':
            return 'Unexpected file field';
        case 'LIMIT_PART_COUNT':
            return 'Too many parts';
        default:
            return 'File upload error';
    }
}

// Async error wrapper for route handlers
export const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Request ID middleware
export const requestIdMiddleware = (req, res, next) => {
    req.requestId = generateRequestId();
    res.setHeader('X-Request-ID', req.requestId);
    next();
};

// Error rate limiting middleware
export const errorRateLimit = (maxErrors = 10, windowMs = 15 * 60 * 1000) => {
    const errorCounts = new Map();

    return (req, res, next) => {
        const key = req.ip || 'unknown';
        const now = Date.now();
        const windowStart = now - windowMs;

        // Clean old entries
        for (const [ip, data] of errorCounts.entries()) {
            if (data.timestamp < windowStart) {
                errorCounts.delete(ip);
            }
        }

        const current = errorCounts.get(key) || { count: 0, timestamp: now };

        if (current.count >= maxErrors) {
            return next(new TooManyRequestsError('Too many errors from this IP'));
        }

        errorCounts.set(key, current);
        next();
    };
};
