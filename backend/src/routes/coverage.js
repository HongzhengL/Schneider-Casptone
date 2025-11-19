import express from 'express';
import { completedRuns } from '../data/completedRuns.js';
import { calculateWeeklyCoverage } from '../utils/coverage.js';

export const coverageRouter = express.Router();

coverageRouter.get('/', (req, res) => {
    let referenceDate;
    const referenceDateParam = req.query.referenceDate;

    if (typeof referenceDateParam === 'string' && referenceDateParam.trim().length > 0) {
        const parsed = new Date(referenceDateParam);
        if (Number.isNaN(parsed.getTime())) {
            return res.status(400).json({
                error: 'Invalid referenceDate. Expected an ISO-8601 string or timestamp.',
            });
        }
        referenceDate = parsed;
    }

    const payload = calculateWeeklyCoverage(completedRuns, { referenceDate });
    res.json(payload);
});
