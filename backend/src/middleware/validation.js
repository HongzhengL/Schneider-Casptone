// backend/src/middleware/validation.js
import { body, query, validationResult } from 'express-validator';

export const validateLoadSearch = [
    query('minLoadedRpm')
        .optional()
        .isFloat({ min: 0, max: 10 })
        .withMessage('minLoadedRpm must be between 0 and 10'),

    query('minDistance')
        .optional()
        .isFloat({ min: 0, max: 5000 })
        .withMessage('minDistance must be between 0 and 5000'),

    query('maxDistance')
        .optional()
        .isFloat({ min: 0, max: 5000 })
        .withMessage('maxDistance must be between 0 and 5000'),

    query('confirmedOnly').optional().isBoolean().withMessage('confirmedOnly must be a boolean'),

    query('standardNetworkOnly')
        .optional()
        .isBoolean()
        .withMessage('standardNetworkOnly must be a boolean'),

    query('destination')
        .optional()
        .isLength({ min: 1, max: 100 })
        .withMessage('destination must be between 1 and 100 characters'),

    query('destinationState')
        .optional()
        .isLength({ min: 2, max: 2 })
        .withMessage('destinationState must be exactly 2 characters'),

    query('serviceExclusions')
        .optional()
        .custom((value) => {
            if (typeof value === 'string') {
                const exclusions = value.split(',');
                return exclusions.every(
                    (exclusion) => typeof exclusion === 'string' && exclusion.length > 0
                );
            }
            return Array.isArray(value);
        })
        .withMessage('serviceExclusions must be a comma-separated string or array'),
];

export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            error: 'Validation failed',
            details: errors.array().map((err) => ({
                field: err.path,
                message: err.msg,
                value: err.value,
            })),
        });
    }
    next();
};
