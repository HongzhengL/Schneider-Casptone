import express from 'express';
import { body, param } from 'express-validator';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler, ValidationError, NotFoundError } from '../middleware/errorHandler.js';
import { handleValidationErrors } from '../middleware/validation.js';
import { ProfilesService } from '../utils/profilesService.js';

const router = express.Router();

router.use(requireAuth);

const createProfileValidation = [
    body('name')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Profile name is required'),
    body('filters')
        .optional()
        .isObject()
        .withMessage('Filters must be an object'),
    handleValidationErrors,
];

const updateProfileValidation = [
    param('id')
        .isUUID()
        .withMessage('Invalid profile ID'),
    body('name')
        .isString()
        .trim()
        .notEmpty()
        .withMessage('Profile name is required'),
    body('filters')
        .optional()
        .isObject()
        .withMessage('Filters must be an object'),
    handleValidationErrors,
];

const deleteProfileValidation = [
    param('id')
        .isUUID()
        .withMessage('Invalid profile ID'),
    handleValidationErrors,
];

router.get(
    '/',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const profiles = await ProfilesService.getProfiles(userId);
        res.json(profiles);
    })
);

router.get(
    '/:id',
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const profileId = req.params.id;

        const profile = await ProfilesService.getProfile(userId, profileId);

        if (!profile) {
            throw new NotFoundError(`Profile with ID ${profileId} not found`);
        }

        res.json(profile);
    })
);

router.post(
    '/',
    createProfileValidation,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const { name, filters } = req.body;

        const profile = await ProfilesService.createProfile(userId, {
            name,
            filters,
        });

        res.status(201).json(profile);
    })
);

router.put(
    '/:id',
    updateProfileValidation,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const profileId = req.params.id;
        const { name, filters } = req.body;

        const profile = await ProfilesService.updateProfile(userId, profileId, {
            name,
            filters,
        });

        if (!profile) {
            throw new NotFoundError(`Profile with ID ${profileId} not found`);
        }

        res.json(profile);
    })
);

router.delete(
    '/:id',
    deleteProfileValidation,
    asyncHandler(async (req, res) => {
        const userId = req.user.id;
        const profileId = req.params.id;

        await ProfilesService.deleteProfile(userId, profileId);

        res.status(204).send();
    })
);

export const profilesRouter = router;
