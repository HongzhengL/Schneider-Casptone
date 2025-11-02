import express from 'express';
import { body } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { ProfitabilitySettingsService } from '../utils/profitabilitySettingsService.js';

const router = express.Router();

router.use(requireAuth);

const saveSettingsValidation = [
    body('mpg').isNumeric().withMessage('MPG must be a number'),
    body('fuelPrice').isNumeric().withMessage('Fuel price must be a number'),
    body('useProMode').isBoolean().withMessage('useProMode must be a boolean'),
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
