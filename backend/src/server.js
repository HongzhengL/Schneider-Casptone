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
import { 
    getConfigurationById, 
    getConfigurationByName, 
    getAllConfigurations,
    searchConfigurations 
} from './data/filterConfigurations.js';

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

// New endpoint to get all filter configurations
app.get('/api/configurations', (req, res) => {
    const { search } = req.query;
    
    if (search) {
        const results = searchConfigurations(search);
        res.json({
            configurations: results,
            total: results.length,
            searchTerm: search
        });
    } else {
        res.json({
            configurations: getAllConfigurations(),
            total: getAllConfigurations().length
        });
    }
});

// New endpoint to get a specific configuration by ID or name
app.get('/api/configurations/:identifier', (req, res) => {
    const { identifier } = req.params;
    
    // Try to find by ID first
    let config = getConfigurationById(identifier);
    
    // If not found by ID, try by name
    if (!config) {
        config = getConfigurationByName(identifier);
    }
    
    if (!config) {
        return res.status(404).json({
            error: 'Configuration not found',
            identifier
        });
    }
    
    res.json(config);
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
        origin,
        originState,
        configId,
        configName
    } = req.query;

    // Check if a configuration is specified
    let appliedConfig = null;
    if (configId) {
        appliedConfig = getConfigurationById(configId);
        if (!appliedConfig) {
            return res.status(404).json({
                error: 'Configuration not found',
                configId
            });
        }
    } else if (configName) {
        appliedConfig = getConfigurationByName(configName);
        if (!appliedConfig) {
            return res.status(404).json({
                error: 'Configuration not found',
                configName
            });
        }
    }

    // Merge configuration filters with query parameters
    // Query parameters take precedence over configuration
    const effectiveFilters = {
        ...(appliedConfig?.filters || {}),
        ...req.query
    };

    // Extract filter values from effective filters
    const minLoaded = effectiveFilters.minLoadedRpm ? Number(effectiveFilters.minLoadedRpm) : 0;
    const minDist = effectiveFilters.minDistance ? Number(effectiveFilters.minDistance) : 0;
    const maxDist =
        effectiveFilters.maxDistance && effectiveFilters.maxDistance !== '1000+' 
            ? Number(effectiveFilters.maxDistance) 
            : Number.POSITIVE_INFINITY;

    const exclusionList =
        typeof effectiveFilters.serviceExclusions === 'string'
            ? effectiveFilters.serviceExclusions.split(',').filter(Boolean)
            : Array.isArray(effectiveFilters.serviceExclusions)
              ? effectiveFilters.serviceExclusions.filter(Boolean)
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

        if (effectiveFilters.confirmedOnly === 'true' && !load.confirmedAppointment) {
            return false;
        }

        if (effectiveFilters.standardNetworkOnly === 'true' && load.distanceToOrigin > 150) {
            return false;
        }

        if (effectiveFilters.destination) {
            const destinationText = load.toLocation.toLowerCase();
            const target = String(effectiveFilters.destination).toLowerCase();
            if (!destinationText.includes(target)) {
                return false;
            }
        }

        if (effectiveFilters.destinationState) {
            const stateTarget = String(effectiveFilters.destinationState).toLowerCase();
            const match = load.toLocation.split(',').map((part) => part.trim().toLowerCase());
            if (!match.some((segment) => segment.startsWith(stateTarget))) {
                return false;
            }
        }

        if (effectiveFilters.origin) {
            const originText = load.fromLocation.toLowerCase();
            const target = String(effectiveFilters.origin).toLowerCase();
            if (!originText.includes(target)) {
                return false;
            }
        }

        if (effectiveFilters.originState) {
            const stateTarget = String(effectiveFilters.originState).toLowerCase();
            const match = load.fromLocation.split(',').map((part) => part.trim().toLowerCase());
            if (!match.some((segment) => segment.startsWith(stateTarget))) {
                return false;
            }
        }

        if (effectiveFilters.destinationRadius) {
            const radius = Number(effectiveFilters.destinationRadius);
            if (!Number.isNaN(radius) && load.distanceToOrigin > radius) {
                return false;
            }
        }

        if (effectiveFilters.minWeight) {
            const minWeight = Number(effectiveFilters.minWeight);
            if (!Number.isNaN(minWeight) && load.weightNum < minWeight) {
                return false;
            }
        }

        if (effectiveFilters.maxWeight) {
            const maxWeight = Number(effectiveFilters.maxWeight);
            if (!Number.isNaN(maxWeight) && load.weightNum > maxWeight) {
                return false;
            }
        }

        if (effectiveFilters.loadType) {
            const types = Array.isArray(effectiveFilters.loadType)
                ? effectiveFilters.loadType
                : String(effectiveFilters.loadType).split(',');
            if (!types.some((type) => load.loadType.toLowerCase() === type.toLowerCase())) {
                return false;
            }
        }

        if (effectiveFilters.customer) {
            const customers = Array.isArray(effectiveFilters.customer)
                ? effectiveFilters.customer
                : String(effectiveFilters.customer).split(',');
            if (
                !customers.some(
                    (customer) => load.customer.toLowerCase() === customer.toLowerCase()
                )
            ) {
                return false;
            }
        }

        if (effectiveFilters.startDate || effectiveFilters.endDate) {
            const startDate = effectiveFilters.startDate ? new Date(String(effectiveFilters.startDate)) : null;
            const endDate = effectiveFilters.endDate ? new Date(String(effectiveFilters.endDate)) : null;
            const pickup = new Date(load.pickupDate);

            if (startDate && pickup < startDate) return false;
            if (endDate) {
                const endOfDay = new Date(endDate);
                endOfDay.setHours(23, 59, 59, 999);
                if (pickup > endOfDay) return false;
            }
        }

        if (effectiveFilters.destinationDateFrom || effectiveFilters.destinationDateTo) {
            const dropFrom = effectiveFilters.destinationDateFrom
                ? new Date(String(effectiveFilters.destinationDateFrom))
                : null;
            const dropTo = effectiveFilters.destinationDateTo
                ? new Date(String(effectiveFilters.destinationDateTo))
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

    // Prepare response with metadata
    const response = {
        loads: filtered,
        total: filtered.length,
        appliedConfiguration: appliedConfig ? {
            id: appliedConfig.id,
            name: appliedConfig.name,
            description: appliedConfig.description
        } : null,
        filters: {
            minLoadedRpm: minLoaded,
            minDistance: minDist,
            maxDistance: maxDist === Number.POSITIVE_INFINITY ? null : maxDist,
            serviceExclusions: exclusionList,
            confirmedOnly: effectiveFilters.confirmedOnly === 'true',
            standardNetworkOnly: effectiveFilters.standardNetworkOnly === 'true',
            destination: effectiveFilters.destination,
            destinationState: effectiveFilters.destinationState,
            loadType: effectiveFilters.loadType,
            customer: effectiveFilters.customer,
            startDate: effectiveFilters.startDate,
            endDate: effectiveFilters.endDate,
            destinationDateFrom: effectiveFilters.destinationDateFrom,
            destinationDateTo: effectiveFilters.destinationDateTo,
            minWeight: effectiveFilters.minWeight,
            maxWeight: effectiveFilters.maxWeight,
            destinationRadius: effectiveFilters.destinationRadius
        }
    };

    res.json(response);
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

app.get('/api/origins', (_req, res) => {
    const origins = Array.from(
        new Map(
            findLoads.map((load) => [
                load.fromLocation.toLowerCase(),
                {
                    label: load.fromLocation,
                    city: load.fromLocation.split(',')[0].trim(),
                    state: load.fromLocation.split(',')[1]?.trim().slice(0, 2) ?? '',
                },
            ])
        ).values()
    );
    res.json(origins);
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
