import express from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { ProfitabilitySettingsService } from '../utils/profitabilitySettingsService.js';
import { averageProfitabilitySettings } from '../data/profitabilityAverages.js';

const router = express.Router();

router.use(requireAuth);

const numericRequirements = [
    'mpg',
    'fuelPrice',
    'maintenanceDollars',
    'maintenanceMiles',
    'monthlyFixedBundle',
    'marginCents',
    'marginPercent',
];

const saveSettingsValidation = [
    ...numericRequirements.map((field) =>
        body(field)
            .isNumeric()
            .withMessage(`${field} must be a number`)
            .custom((value) => Number(value) >= 0)
            .withMessage(`${field} must not be negative`)
    ),
    body('useWhicheverGreater').isBoolean().withMessage('useWhicheverGreater must be a boolean'),
    body('useRealTimeFuel').isBoolean().withMessage('useRealTimeFuel must be a boolean'),
    body('useProMode').isBoolean().withMessage('useProMode must be a boolean'),
    body('otherFixed')
        .isArray()
        .withMessage('otherFixed must be an array')
        .custom((value) =>
            value.every(
                (item) =>
                    typeof item.name === 'string' &&
                    item.name.length <= 100 &&
                    typeof item.amount === 'number' &&
                    item.amount >= 0 &&
                    typeof item.period === 'number' &&
                    item.period > 0 &&
                    ['week', 'month', 'year'].includes(item.unit)
            )
        )
        .withMessage('otherFixed items must include name, amount, period, and valid unit'),
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

router.get(
    '/averages',
    asyncHandler(async (_req, res) => {
        res.json(averageProfitabilitySettings);
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
