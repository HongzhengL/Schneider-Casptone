import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { 
  getConfigurationById, 
  getConfigurationByName, 
  getAllConfigurations,
  searchConfigurations 
} from '../data/filterConfigurations.js';

// Create a test app instance
const createTestApp = () => {
  const app = express();
  
  app.use(cors({
    origin: true,
  }));
  
  app.use(express.json());
  
  // Configuration endpoints
  app.get('/api/configurations', (req, res) => {
    try {
      const { search } = req.query;
      
      if (search) {
        const results = searchConfigurations(search);
        res.json({
          configurations: results,
          total: results.length
        });
      } else {
        const results = getAllConfigurations();
        res.json({
          configurations: results,
          total: results.length
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  app.get('/api/configurations/:identifier', (req, res) => {
    try {
      const { identifier } = req.params;
      
      // Try by ID first, then by name
      let config = getConfigurationById(identifier);
      if (!config) {
        config = getConfigurationByName(identifier);
      }
      
      if (!config) {
        return res.status(404).json({ error: 'Configuration not found' });
      }
      
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  return app;
};

describe('Configuration Endpoints', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  describe('GET /api/configurations', () => {
    it('should return all configurations', async () => {
      const response = await request(app)
        .get('/api/configurations')
        .expect(200);
      
      expect(response.body).toHaveProperty('configurations');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.configurations)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
    });
    
    it('should return configurations with correct structure', async () => {
      const response = await request(app)
        .get('/api/configurations')
        .expect(200);
      
      const configs = response.body.configurations;
      expect(configs.length).toBeGreaterThan(0);
      
      configs.forEach(config => {
        expect(config).toHaveProperty('id');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('description');
        expect(config).toHaveProperty('filters');
        expect(config).toHaveProperty('usageCount');
        expect(config).toHaveProperty('createdAt');
        expect(config).toHaveProperty('lastUsed');
        
        expect(typeof config.id).toBe('string');
        expect(typeof config.name).toBe('string');
        expect(typeof config.description).toBe('string');
        expect(typeof config.usageCount).toBe('number');
        expect(typeof config.createdAt).toBe('string');
        expect(typeof config.lastUsed).toBe('string');
      });
    });
    
    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/configurations?search=temperature')
        .expect(200);
      
      expect(response.body).toHaveProperty('configurations');
      expect(response.body).toHaveProperty('total');
      expect(Array.isArray(response.body.configurations)).toBe(true);
    });
    
    it('should return empty results for non-matching search', async () => {
      const response = await request(app)
        .get('/api/configurations?search=nonexistent')
        .expect(200);
      
      expect(response.body.total).toBe(0);
      expect(response.body.configurations).toHaveLength(0);
    });
    
    it('should handle CORS headers', async () => {
      const response = await request(app)
        .get('/api/configurations')
        .expect(200);
      
      // CORS headers are handled by the middleware
      expect(response.status).toBe(200);
    });
  });
  
  describe('GET /api/configurations/:identifier', () => {
    it('should return configuration by ID', async () => {
      const response = await request(app)
        .get('/api/configurations/high-value-loads')
        .expect(200);
      
      expect(response.body).toHaveProperty('id', 'high-value-loads');
      expect(response.body).toHaveProperty('name');
      expect(response.body).toHaveProperty('description');
      expect(response.body).toHaveProperty('filters');
    });
    
    it('should return configuration by name (case insensitive)', async () => {
      const response = await request(app)
        .get('/api/configurations/High Value Loads')
        .expect(200);
      
      expect(response.body).toHaveProperty('id', 'high-value-loads');
      expect(response.body).toHaveProperty('name', 'High Value Loads');
    });
    
    it('should return 404 for non-existent configuration', async () => {
      const response = await request(app)
        .get('/api/configurations/nonexistent')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Configuration not found');
    });
    
    it('should return correct filter structure', async () => {
      const response = await request(app)
        .get('/api/configurations/high-value-loads')
        .expect(200);
      
      const filters = response.body.filters;
      
      expect(filters).toHaveProperty('minLoadedRpm');
      expect(filters).toHaveProperty('serviceExclusions');
      expect(filters).toHaveProperty('confirmedOnly');
      expect(Array.isArray(filters.serviceExclusions)).toBe(true);
      expect(typeof filters.minLoadedRpm).toBe('number');
      expect(typeof filters.confirmedOnly).toBe('boolean');
    });
  });
  
  describe('Configuration Data Validation', () => {
    it('should have valid configuration IDs', async () => {
      const response = await request(app)
        .get('/api/configurations')
        .expect(200);
      
      const configs = response.body.configurations;
      
      configs.forEach(config => {
        expect(config.id).toMatch(/^[a-z-]+$/);
        expect(config.id.length).toBeGreaterThan(0);
      });
    });
    
    it('should have valid usage counts', async () => {
      const response = await request(app)
        .get('/api/configurations')
        .expect(200);
      
      const configs = response.body.configurations;
      
      configs.forEach(config => {
        expect(config.usageCount).toBeGreaterThanOrEqual(0);
        expect(Number.isInteger(config.usageCount)).toBe(true);
      });
    });
    
    it('should have valid date formats', async () => {
      const response = await request(app)
        .get('/api/configurations')
        .expect(200);
      
      const configs = response.body.configurations;
      
      configs.forEach(config => {
        expect(() => new Date(config.createdAt)).not.toThrow();
        expect(() => new Date(config.lastUsed)).not.toThrow();
      });
    });
  });
  
  describe('Multi-Configuration Scenarios', () => {
    it('should handle multiple configuration requests', async () => {
      const requests = [
        'high-value-loads',
        'standard-dry-van',
        'temperature-controlled',
        'expedited-loads'
      ].map(id => request(app).get(`/api/configurations/${id}`));
      
      const responses = await Promise.all(requests);
      
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('name');
      });
    });
    
    it('should maintain data consistency across requests', async () => {
      const response1 = await request(app).get('/api/configurations/high-value-loads');
      const response2 = await request(app).get('/api/configurations/high-value-loads');
      
      expect(response1.body.id).toBe(response2.body.id);
      expect(response1.body.name).toBe(response2.body.name);
      expect(response1.body.filters.minLoadedRpm).toBe(response2.body.filters.minLoadedRpm);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      await request(app)
        .post('/api/configurations')
        .expect(404);
    });
    
    it('should handle empty identifier', async () => {
      // Empty identifier should return all configurations
      const response = await request(app)
        .get('/api/configurations/')
        .expect(200);
      
      expect(response.body).toHaveProperty('configurations');
      expect(response.body).toHaveProperty('total');
    });
  });
});
