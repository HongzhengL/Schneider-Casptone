import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { findLoads } from '../data/findLoads.js';
import { 
  getConfigurationById, 
  getConfigurationByName 
} from '../data/filterConfigurations.js';

// Create a test app instance
const createTestApp = () => {
  const app = express();
  
  app.use(cors({
    origin: true,
  }));
  
  app.use(express.json());
  
  // Enhanced loads endpoint with configuration support
  app.get('/api/loads/find', (req, res) => {
    try {
      const { configId, configName, ...queryParams } = req.query;
      
      let appliedConfiguration = null;
      let effectiveFilters = {};
      
      // Handle configuration-based filtering
      if (configId || configName) {
        let config = null;
        if (configId) {
          config = getConfigurationById(configId);
        } else if (configName) {
          config = getConfigurationByName(configName);
        }
        
        if (!config) {
          return res.status(404).json({ error: 'Configuration not found' });
        }
        
        appliedConfiguration = {
          id: config.id,
          name: config.name,
          description: config.description
        };
        
        // Start with configuration filters
        effectiveFilters = { ...config.filters };
      }
      
      // Apply query parameter overrides
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] !== undefined && queryParams[key] !== null && queryParams[key] !== '') {
          let value = queryParams[key];
          
          // Parse numeric values
          if (['minLoadedRpm', 'minDistance', 'maxDistance', 'destinationRadius'].includes(key)) {
            value = parseFloat(value);
          }
          
          // Parse boolean values
          if (['confirmedOnly', 'standardNetworkOnly'].includes(key)) {
            value = value === 'true';
          }
          
          // Parse array values
          if (key === 'serviceExclusions' && typeof value === 'string') {
            value = value.split(',').map(s => s.trim());
          }
          
          effectiveFilters[key] = value;
        }
      });
      
      // Get loads with effective filters
      const loads = findLoads;
      const filtered = loads.filter(load => {
        // Apply all filters
        if (effectiveFilters.minLoadedRpm && load.loadedRpmNum < effectiveFilters.minLoadedRpm) {
          return false;
        }
        
        if (effectiveFilters.minDistance && load.distanceNum < effectiveFilters.minDistance) {
          return false;
        }
        
        if (effectiveFilters.maxDistance && load.distanceNum > effectiveFilters.maxDistance) {
          return false;
        }
        
        if (effectiveFilters.serviceExclusions && effectiveFilters.serviceExclusions.length > 0) {
          if (effectiveFilters.serviceExclusions.some(exclusion => 
            load.serviceTags.some(service => service.toLowerCase().includes(exclusion.toLowerCase()))
          )) {
            return false;
          }
        }
        
        if (effectiveFilters.confirmedOnly && !load.confirmedAppointment) {
          return false;
        }
        
        if (effectiveFilters.standardNetworkOnly && !load.standardNetwork) {
          return false;
        }
        
        if (effectiveFilters.loadType) {
          const types = Array.isArray(effectiveFilters.loadType)
            ? effectiveFilters.loadType
            : String(effectiveFilters.loadType).split(',');
          if (!types.some((type) => load.loadType.toLowerCase() === type.toLowerCase())) {
            return false;
          }
        }
        
        return true;
      });
      
      res.json({
        loads: filtered,
        total: filtered.length,
        appliedConfiguration,
        filters: effectiveFilters
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  return app;
};

describe('Enhanced Loads Endpoint', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  describe('GET /api/loads/find', () => {
    it('should return loads with basic structure', async () => {
      const response = await request(app)
        .get('/api/loads/find')
        .expect(200);
      
      expect(response.body).toHaveProperty('loads');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('filters');
      expect(Array.isArray(response.body.loads)).toBe(true);
    });
    
    it('should return loads with configuration by ID', async () => {
      const response = await request(app)
        .get('/api/loads/find?configId=high-value-loads')
        .expect(200);
      
      expect(response.body).toHaveProperty('loads');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('appliedConfiguration');
      expect(response.body).toHaveProperty('filters');
      
      expect(response.body.appliedConfiguration).toHaveProperty('id', 'high-value-loads');
      expect(response.body.appliedConfiguration).toHaveProperty('name');
      expect(response.body.appliedConfiguration).toHaveProperty('description');
    });
    
    it('should return loads with configuration by name', async () => {
      const response = await request(app)
        .get('/api/loads/find?configName=High Value Loads')
        .expect(200);
      
      expect(response.body).toHaveProperty('appliedConfiguration');
      expect(response.body.appliedConfiguration.id).toBe('high-value-loads');
    });
    
    it('should return 404 for invalid configuration', async () => {
      const response = await request(app)
        .get('/api/loads/find?configId=invalid-config')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Configuration not found');
    });
    
    it('should apply configuration filters correctly', async () => {
      const response = await request(app)
        .get('/api/loads/find?configId=high-value-loads')
        .expect(200);
      
      const filters = response.body.filters;
      expect(filters).toHaveProperty('minLoadedRpm');
      expect(filters).toHaveProperty('serviceExclusions');
      expect(Array.isArray(filters.serviceExclusions)).toBe(true);
    });
    
    it('should allow query parameter overrides', async () => {
      const response = await request(app)
        .get('/api/loads/find?configId=standard-dry-van&maxDistance=300')
        .expect(200);
      
      expect(response.body.filters.maxDistance).toBe(300);
      expect(response.body.appliedConfiguration.id).toBe('standard-dry-van');
    });
    
    it('should work with traditional query parameters', async () => {
      const response = await request(app)
        .get('/api/loads/find?minLoadedRpm=2.0&maxDistance=500&loadType=Dry Van')
        .expect(200);
      
      expect(response.body.filters.minLoadedRpm).toBe(2.0);
      expect(response.body.filters.maxDistance).toBe(500);
      expect(response.body.filters.loadType).toBe('Dry Van');
      expect(response.body.appliedConfiguration).toBeNull();
    });
    
    it('should handle service exclusions correctly', async () => {
      const response = await request(app)
        .get('/api/loads/find?serviceExclusions=hazmat,driver-load')
        .expect(200);
      
      expect(Array.isArray(response.body.filters.serviceExclusions)).toBe(true);
      expect(response.body.filters.serviceExclusions).toContain('hazmat');
      expect(response.body.filters.serviceExclusions).toContain('driver-load');
    });
    
    it('should handle boolean parameters correctly', async () => {
      const response = await request(app)
        .get('/api/loads/find?confirmedOnly=true&standardNetworkOnly=false')
        .expect(200);
      
      expect(response.body.filters.confirmedOnly).toBe(true);
      expect(response.body.filters.standardNetworkOnly).toBe(false);
    });
    
    it('should handle numeric parameters correctly', async () => {
      const response = await request(app)
        .get('/api/loads/find?minLoadedRpm=1.5&maxDistance=750&destinationRadius=50')
        .expect(200);
      
      expect(typeof response.body.filters.minLoadedRpm).toBe('number');
      expect(typeof response.body.filters.maxDistance).toBe('number');
      expect(typeof response.body.filters.destinationRadius).toBe('number');
    });
  });
  
  describe('Load Data Validation', () => {
    it('should return loads with correct structure', async () => {
      const response = await request(app)
        .get('/api/loads/find')
        .expect(200);
      
      const loads = response.body.loads;
      if (loads.length > 0) {
        const load = loads[0];
        
        expect(load).toHaveProperty('id');
        expect(load).toHaveProperty('fromLocation');
        expect(load).toHaveProperty('toLocation');
        expect(load).toHaveProperty('distance');
        expect(load).toHaveProperty('loadedRpm');
        expect(load).toHaveProperty('loadType');
        expect(load).toHaveProperty('serviceTags');
        expect(load).toHaveProperty('confirmedAppointment');
        
        expect(typeof load.id).toBe('string');
        expect(typeof load.fromLocation).toBe('string');
        expect(typeof load.toLocation).toBe('string');
        expect(typeof load.distance).toBe('string');
        expect(typeof load.loadedRpm).toBe('string');
        expect(typeof load.loadType).toBe('string');
        expect(Array.isArray(load.serviceTags)).toBe(true);
        expect(typeof load.confirmedAppointment).toBe('boolean');
      }
    });
    
    it('should filter loads correctly by minLoadedRpm', async () => {
      const response = await request(app)
        .get('/api/loads/find?minLoadedRpm=2.0')
        .expect(200);
      
      const loads = response.body.loads;
      loads.forEach(load => {
        expect(load.loadedRpmNum).toBeGreaterThanOrEqual(2.0);
      });
    });
    
    it('should filter loads correctly by maxDistance', async () => {
      const response = await request(app)
        .get('/api/loads/find?maxDistance=500')
        .expect(200);
      
      const loads = response.body.loads;
      loads.forEach(load => {
        expect(load.distanceNum).toBeLessThanOrEqual(500);
      });
    });
    
    it('should filter loads correctly by loadType', async () => {
      const response = await request(app)
        .get('/api/loads/find?loadType=Dry Van')
        .expect(200);
      
      const loads = response.body.loads;
      loads.forEach(load => {
        expect(load.loadType).toBe('Dry Van');
      });
    });
  });
  
  describe('Multi-Configuration Scenarios', () => {
    it('should handle multiple configuration requests', async () => {
      const requests = [
        'high-value-loads',
        'standard-dry-van',
        'temperature-controlled'
      ].map(id => request(app).get(`/api/loads/find?configId=${id}`));
      
      const responses = await Promise.all(requests);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('appliedConfiguration');
        expect(response.body.appliedConfiguration).not.toBeNull();
      });
    });
    
    it('should maintain data consistency across requests', async () => {
      const response1 = await request(app).get('/api/loads/find?configId=high-value-loads');
      const response2 = await request(app).get('/api/loads/find?configId=high-value-loads');
      
      expect(response1.body.appliedConfiguration.id).toBe(response2.body.appliedConfiguration.id);
      expect(response1.body.filters.minLoadedRpm).toBe(response2.body.filters.minLoadedRpm);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      await request(app)
        .post('/api/loads/find')
        .expect(404);
    });
    
    it('should handle invalid numeric parameters', async () => {
      const response = await request(app)
        .get('/api/loads/find?minLoadedRpm=invalid')
        .expect(200);
      
      // Should handle gracefully and return all loads
      expect(response.body).toHaveProperty('loads');
    });
  });
});
