import express from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { ProfitabilitySettingsService } from '../utils/profitabilitySettingsService.js';

const router = express.Router();

router.use(requireAuth);

const saveSettingsValidation = [
    body('mpg')
        .isNumeric().withMessage('MPG must be a number')
        .custom((value) => value >= 0).withMessage('MPG must not be negative'),
    body('fuelPrice')
        .isNumeric().withMessage('Fuel price must be a number')
        .custom((value) => value >= 0).withMessage('Fuel price must not be negative'),
    body('useProMode')
        .isBoolean().withMessage('useProMode must be a boolean'),
    body('periodValue')
        .isInt({ min: 1 }).withMessage('Period value must be a positive integer'),
    body('periodUnit')
        .isIn(['week', 'month', 'year']).withMessage('Period unit must be one of: week, month, year'),
    body('otherNumericField')
        .optional()
        .isNumeric().withMessage('Other numeric field must be a number')
        .custom((value) => value >= 0).withMessage('Other numeric field must not be negative'),
    // Add more fields as needed, following the same pattern
    handleValidationErrors,
];

router.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const settings = await ProfitabilitySettingsService.getSettings(userId);
        res.json(settings);
    })
);

router.put(
    '/',
    saveSettingsValidation,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const settings = await ProfitabilitySettingsService.saveSettings(userId, req.body);
        res.json(settings);
    })
);

router.post(
    '/',
    saveSettingsValidation,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const settings = await ProfitabilitySettingsService.saveSettings(userId, req.body);
        res.json(settings);
    })
);

export const profitabilitySettingsRouter = router;
