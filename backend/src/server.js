import cors from 'cors';
import express from 'express';
import { suggestedLoads } from './data/home.js';
import { notices } from './data/notices.js';
import { findLoads } from './data/findLoads.js';
import { completedRuns } from './data/completedRuns.js';
import {
    driverProfile,
    walletInfo,
    menuSections,
    performanceSummary,
    appVersion,
} from './data/driverPortal.js';
import { defaultMetrics } from './data/metrics.js';

const app = express();

app.use(
    cors({
        origin: true,
    })
);
app.use(express.json());

app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
});

app.get('/api/loads/suggested', (_req, res) => {
    res.json(suggestedLoads);
});

app.get('/api/notices', (_req, res) => {
    res.json(notices);
});

app.get('/api/loads/find', (req, res) => {
    const {
        minLoadedRpm,
        minDistance,
        maxDistance,
        serviceExclusions,
        confirmedOnly,
        standardNetworkOnly,
        destination,
        destinationState,
    } = req.query;

    const minLoaded = minLoadedRpm ? Number(minLoadedRpm) : 0;
    const minDist = minDistance ? Number(minDistance) : 0;
    const maxDist =
        maxDistance && maxDistance !== '1000+'
            ? Number(maxDistance)
            : Number.POSITIVE_INFINITY;

    const exclusionList =
        typeof serviceExclusions === 'string'
            ? serviceExclusions.split(',').filter(Boolean)
            : Array.isArray(serviceExclusions)
            ? serviceExclusions.filter(Boolean)
            : [];

    const filtered = findLoads.filter((load) => {
        if (load.loadedRpmNum < minLoaded) return false;
        if (load.distanceNum < minDist) return false;
        if (load.distanceNum > maxDist) return false;

        if (exclusionList.length > 0) {
            const tags = Array.isArray(load.serviceTags) ? load.serviceTags : [];
            if (tags.some((tag) => exclusionList.includes(tag))) {
                return false;
            }
        }

    if (confirmedOnly === 'true' && !load.confirmedAppointment) {
        return false;
    }

        if (standardNetworkOnly === 'true' && load.distanceToOrigin > 150) {
            return false;
        }

        if (destination) {
            const destinationText = load.toLocation.toLowerCase();
            const target = String(destination).toLowerCase();
            if (!destinationText.includes(target)) {
                return false;
            }
        }

        if (destinationState) {
            const stateTarget = String(destinationState).toLowerCase();
            const match = load.toLocation
                .split(',')
                .map((part) => part.trim().toLowerCase());
            if (!match.some((segment) => segment.startsWith(stateTarget))) {
                return false;
            }
        }

        if (req.query.destinationRadius) {
            const radius = Number(req.query.destinationRadius);
            if (!Number.isNaN(radius) && load.distanceToOrigin > radius) {
                return false;
            }
        }

        if (req.query.minWeight) {
            const minWeight = Number(req.query.minWeight);
            if (!Number.isNaN(minWeight) && load.weightNum < minWeight) {
                return false;
            }
        }

        if (req.query.maxWeight) {
            const maxWeight = Number(req.query.maxWeight);
            if (!Number.isNaN(maxWeight) && load.weightNum > maxWeight) {
                return false;
            }
        }

        if (req.query.loadType) {
            const types = Array.isArray(req.query.loadType)
                ? req.query.loadType
                : String(req.query.loadType).split(',');
            if (!types.some((type) => load.loadType.toLowerCase() === type.toLowerCase())) {
                return false;
            }
        }

        if (req.query.customer) {
            const customers = Array.isArray(req.query.customer)
                ? req.query.customer
                : String(req.query.customer).split(',');
            if (!customers.some((customer) => load.customer.toLowerCase() === customer.toLowerCase())) {
                return false;
            }
        }

        if (req.query.startDate || req.query.endDate) {
            const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : null;
            const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : null;
            const pickup = new Date(load.pickupDate);

            if (startDate && pickup < startDate) return false;
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                if (pickup > endOfDay) return false;
            }
        }

        if (req.query.destinationDateFrom || req.query.destinationDateTo) {
            const dropFrom = req.query.destinationDateFrom
                ? new Date(String(req.query.destinationDateFrom))
                : null;
            const dropTo = req.query.destinationDateTo
                ? new Date(String(req.query.destinationDateTo))
                : null;
            const delivery = new Date(load.dropDate);
            if (dropFrom && delivery < dropFrom) return false;
            if (dropTo) {
                const endOfDay = new Date(dropTo);
                endOfDay.setHours(23, 59, 59, 999);
                if (delivery > endOfDay) return false;
            }
        }

        return true;
    });

    res.json(filtered);
});

app.get('/api/loads/completed', (_req, res) => {
    res.json(completedRuns);
});

app.get('/api/destinations', (_req, res) => {
    const destinations = Array.from(
        new Map(
            findLoads.map((load) => [
                load.toLocation.toLowerCase(),
                {
                    label: load.toLocation,
                    city: load.toLocation.split(',')[0].trim(),
                    state: load.toLocation.split(',')[1]?.trim().slice(0, 2) ?? '',
                },
            ])
        ).values()
    );
    res.json(destinations);
});

app.get('/api/driver/portal', (_req, res) => {
    res.json({
        profile: driverProfile,
        wallet: walletInfo,
        menuSections,
        performance: performanceSummary,
        appVersion,
    });
});

app.get('/api/settings/metrics', (_req, res) => {
    res.json(defaultMetrics);
});

const port = process.env.PORT ?? 4000;

app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
});
