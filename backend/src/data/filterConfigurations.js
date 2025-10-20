// Filter configuration presets for the /api/loads/find endpoint
export const filterConfigurations = [
    {
        id: 'high-value-loads',
        name: 'High Value Loads',
        description: 'Premium loads with high RPM and confirmed appointments',
        filters: {
            minLoadedRpm: 2.0,
            confirmedOnly: true,
            serviceExclusions: ['hazmat', 'driver-load', 'driver-unload']
        },
        createdBy: 'system',
        createdAt: new Date('2024-01-15T10:00:00Z'),
        lastUsed: new Date('2024-01-20T14:30:00Z'),
        usageCount: 45
    },
    {
        id: 'standard-dry-van',
        name: 'Standard Dry Van',
        description: 'Standard dry van loads within 500 miles',
        filters: {
            loadType: ['Dry Van'],
            maxDistance: 500,
            standardNetworkOnly: true,
            serviceExclusions: ['hazmat', 'high-value']
        },
        createdBy: 'system',
        createdAt: new Date('2024-01-10T09:00:00Z'),
        lastUsed: new Date('2024-01-19T16:45:00Z'),
        usageCount: 128
    },
    {
        id: 'temperature-controlled',
        name: 'Temperature Controlled',
        description: 'Refrigerated and temperature control loads',
        filters: {
            loadType: ['Temperature Control', 'Refrigerated'],
            minLoadedRpm: 1.8,
            serviceExclusions: ['driver-load', 'driver-unload']
        },
        createdBy: 'system',
        createdAt: new Date('2024-01-12T11:30:00Z'),
        lastUsed: new Date('2024-01-18T08:15:00Z'),
        usageCount: 67
    },
    {
        id: 'expedited-loads',
        name: 'Expedited Loads',
        description: 'Fast delivery loads with high priority',
        filters: {
            loadType: ['Expedited', 'High Value'],
            minLoadedRpm: 2.2,
            maxDistance: 300,
            confirmedOnly: true,
            serviceExclusions: ['stop-off', 'trailer-spot']
        },
        createdBy: 'system',
        createdAt: new Date('2024-01-08T14:20:00Z'),
        lastUsed: new Date('2024-01-17T12:30:00Z'),
        usageCount: 23
    },
    {
        id: 'long-haul-flatbed',
        name: 'Long Haul Flatbed',
        description: 'Long distance flatbed loads for construction materials',
        filters: {
            loadType: ['Flatbed'],
            minDistance: 400,
            minLoadedRpm: 1.9,
            serviceExclusions: ['hazmat', 'high-value']
        },
        createdBy: 'system',
        createdAt: new Date('2024-01-05T16:45:00Z'),
        lastUsed: new Date('2024-01-16T09:20:00Z'),
        usageCount: 34
    },
    {
        id: 'local-deliveries',
        name: 'Local Deliveries',
        description: 'Short distance loads within 200 miles',
        filters: {
            maxDistance: 200,
            standardNetworkOnly: true,
            serviceExclusions: ['hazmat', 'high-value', 'expedited']
        },
        createdBy: 'system',
        createdAt: new Date('2024-01-03T13:15:00Z'),
        lastUsed: new Date('2024-01-15T11:45:00Z'),
        usageCount: 89
    },
    {
        id: 'hazmat-specialized',
        name: 'Hazmat Specialized',
        description: 'Hazmat loads with specialized requirements',
        filters: {
            loadType: ['Hazmat'],
            minLoadedRpm: 2.1,
            confirmedOnly: true,
            serviceExclusions: ['driver-load', 'driver-unload', 'live-load', 'live-unload']
        },
        createdBy: 'system',
        createdAt: new Date('2024-01-01T08:30:00Z'),
        lastUsed: new Date('2024-01-14T15:10:00Z'),
        usageCount: 12
    },
    {
        id: 'weekend-loads',
        name: 'Weekend Loads',
        description: 'Loads available for weekend pickup and delivery',
        filters: {
            startDate: new Date('2024-01-20T00:00:00Z'), // Weekend start
            endDate: new Date('2024-01-21T23:59:59Z'), // Weekend end
            serviceExclusions: ['no-weekend-delivery']
        },
        createdBy: 'system',
        createdAt: new Date('2024-01-18T10:00:00Z'),
        lastUsed: new Date('2024-01-19T17:30:00Z'),
        usageCount: 8
    }
];

// Helper function to get configuration by ID
export const getConfigurationById = (id) => {
    return filterConfigurations.find(config => config.id === id);
};

// Helper function to get configuration by name (case-insensitive)
export const getConfigurationByName = (name) => {
    return filterConfigurations.find(config => 
        config.name.toLowerCase() === name.toLowerCase()
    );
};

// Helper function to get all configurations
export const getAllConfigurations = () => {
    return filterConfigurations;
};

// Helper function to search configurations by partial name match
export const searchConfigurations = (query) => {
    const searchTerm = query.toLowerCase();
    return filterConfigurations.filter(config => 
        config.name.toLowerCase().includes(searchTerm) ||
        config.description.toLowerCase().includes(searchTerm)
    );
};
