import express from 'express';
import { body } from 'express-validator';
import { CoverageService } from '../utils/coverageService.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { handleValidationErrors } from '../middleware/validation.js';

export const coverageRouter = express.Router();

const parseReferenceDate = (value) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return undefined;
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        const error = new Error('Invalid referenceDate. Expected an ISO-8601 string or timestamp.');
        error.status = 400;
        throw error;
    }
    return parsed;
};

const recordRunValidation = [
    body('amount')
        .isNumeric()
        .withMessage('amount must be a number')
        .custom((value) => Number(value) >= 0)
        .withMessage('amount must not be negative'),
    body('distance')
        .optional()
        .isNumeric()
        .withMessage('distance must be a number')
        .custom((value) => Number(value) >= 0)
        .withMessage('distance must not be negative'),
    body('loadId').optional().isString().trim().isLength({ max: 200 }),
    body('completionDate')
        .optional()
        .isISO8601()
        .withMessage('completionDate must be a valid ISO-8601 date string'),
    handleValidationErrors,
];

coverageRouter.get(
    '/',
    asyncHandler(async (req, res) => {
        const referenceDate = parseReferenceDate(req.query.referenceDate) ?? new Date();
        const coverage = await CoverageService.getWeeklyCoverage(req.user.id, referenceDate);

        res.json({
            coveredAmount: coverage.coveredAmount,
            startOfWeek: coverage.startOfWeek.toISOString(),
            endOfWeek: coverage.endOfWeek.toISOString(),
            runCount: coverage.runCount,
            referenceDate: referenceDate.toISOString(),
        });
    })
);

coverageRouter.post(
    '/',
    recordRunValidation,
    asyncHandler(async (req, res) => {
        const referenceDate = parseReferenceDate(req.body.referenceDate) ?? new Date();
        const completionDate =
            typeof req.body.completionDate === 'string' && req.body.completionDate.trim().length > 0
                ? req.body.completionDate
                : referenceDate.toISOString();

        const coverage = await CoverageService.recordRunAndAggregate(req.user.id, {
            loadId: req.body.loadId,
            amount: Number(req.body.amount),
            distance:
                req.body.distance !== undefined && req.body.distance !== null
                    ? Number(req.body.distance)
                    : undefined,
            completionDate,
            metadata: req.body.metadata,
        });

        res.status(201).json({
            coveredAmount: coverage.coveredAmount,
            startOfWeek: coverage.startOfWeek.toISOString(),
            endOfWeek: coverage.endOfWeek.toISOString(),
            runCount: coverage.runCount,
            referenceDate: new Date(completionDate).toISOString(),
        });
    })
);
