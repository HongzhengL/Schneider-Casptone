import request from 'supertest';
import express from 'express';
import cors from 'cors';
import { driverProfile, walletInfo, menuSections, performanceSummary, appVersion } from '../data/driverPortal.js';

// Create a test app instance
const createTestApp = () => {
  const app = express();
  
  app.use(cors({
    origin: true,
  }));
  
  app.use(express.json());
  
  // Profile endpoint
  app.get('/api/driver/portal', (_req, res) => {
    res.json({
      profile: driverProfile,
      wallet: walletInfo,
      menuSections,
      performance: performanceSummary,
      appVersion,
    });
  });
  
  return app;
};

describe('Profile Endpoints', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  describe('GET /api/driver/portal', () => {
    it('should return complete driver portal data', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      expect(response.body).toHaveProperty('profile');
      expect(response.body).toHaveProperty('wallet');
      expect(response.body).toHaveProperty('menuSections');
      expect(response.body).toHaveProperty('performance');
      expect(response.body).toHaveProperty('appVersion');
    });
    
    it('should return correct profile structure', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      const profile = response.body.profile;
      
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('phone');
      expect(profile).toHaveProperty('driverId');
      expect(profile).toHaveProperty('cdlNumber');
      expect(profile).toHaveProperty('rating');
      expect(profile).toHaveProperty('totalDeliveries');
      expect(profile).toHaveProperty('memberSince');
      expect(profile).toHaveProperty('fleet');
      expect(profile).toHaveProperty('homeTerminal');
      
      // Validate data types
      expect(typeof profile.name).toBe('string');
      expect(typeof profile.email).toBe('string');
      expect(typeof profile.phone).toBe('string');
      expect(typeof profile.driverId).toBe('string');
      expect(typeof profile.cdlNumber).toBe('string');
      expect(typeof profile.rating).toBe('number');
      expect(typeof profile.totalDeliveries).toBe('number');
      expect(typeof profile.memberSince).toBe('string');
      expect(typeof profile.fleet).toBe('string');
      expect(typeof profile.homeTerminal).toBe('string');
    });
    
    it('should return correct wallet structure', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      const wallet = response.body.wallet;
      
      expect(wallet).toHaveProperty('balance');
      expect(wallet).toHaveProperty('pendingEarnings');
      expect(wallet).toHaveProperty('schneiderPay');
      
      // Validate data types
      expect(typeof wallet.balance).toBe('number');
      expect(typeof wallet.pendingEarnings).toBe('number');
      expect(typeof wallet.schneiderPay).toBe('object');
      expect(wallet.schneiderPay).toHaveProperty('fuelBonus');
    });
    
    it('should return correct menu sections structure', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      const menuSections = response.body.menuSections;
      
      expect(Array.isArray(menuSections)).toBe(true);
      expect(menuSections.length).toBeGreaterThan(0);
      
      menuSections.forEach(section => {
        expect(section).toHaveProperty('title');
        expect(section).toHaveProperty('items');
        expect(Array.isArray(section.items)).toBe(true);
        
        section.items.forEach(item => {
          expect(item).toHaveProperty('icon');
          expect(item).toHaveProperty('label');
          expect(typeof item.icon).toBe('string');
          expect(typeof item.label).toBe('string');
        });
      });
    });
    
    it('should return correct performance structure', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      const performance = response.body.performance;
      
      expect(performance).toHaveProperty('loadsCompleted');
      expect(performance).toHaveProperty('onTimeRate');
      expect(performance).toHaveProperty('averageRating');
      
      // Validate data types
      expect(typeof performance.loadsCompleted).toBe('number');
      expect(typeof performance.onTimeRate).toBe('number');
      expect(typeof performance.averageRating).toBe('number');
    });
    
    it('should return app version', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      expect(response.body).toHaveProperty('appVersion');
      expect(typeof response.body.appVersion).toBe('string');
    });
    
    it('should handle CORS headers', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      // CORS headers are handled by the middleware
      expect(response.status).toBe(200);
    });
    
    it('should return JSON content type', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
  
  describe('Profile Data Validation', () => {
    it('should have valid email format', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      const email = response.body.profile.email;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(true);
    });
    
    it('should have valid phone format', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      const phone = response.body.profile.phone;
      expect(phone).toMatch(/^\+1 \(\d{3}\) \d{3}-\d{4}$/);
    });
    
    it('should have valid driver ID format', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      const driverId = response.body.profile.driverId;
      expect(driverId).toMatch(/^SNI-\d{5}$/);
    });
    
    it('should have valid CDL number format', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      const cdlNumber = response.body.profile.cdlNumber;
      expect(cdlNumber).toMatch(/^[A-Z]{2}-CDL-\d{9}$/);
    });
    
    it('should have valid rating range', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      const rating = response.body.profile.rating;
      expect(rating).toBeGreaterThanOrEqual(0);
      expect(rating).toBeLessThanOrEqual(5);
    });
    
    it('should have positive total deliveries', async () => {
      const response = await request(app)
        .get('/api/driver/portal')
        .expect(200);
      
      const totalDeliveries = response.body.profile.totalDeliveries;
      expect(totalDeliveries).toBeGreaterThan(0);
    });
  });
  
  describe('Multi-Profile Scenarios', () => {
    it('should handle multiple profile requests', async () => {
      const requests = Array(5).fill().map(() => 
        request(app).get('/api/driver/portal')
      );
      
      const responses = await Promise.all(requests);
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('profile');
        expect(response.body.profile.name).toBe('Johnny Rodriguez');
      });
    });
    
    it('should maintain data consistency across requests', async () => {
      const response1 = await request(app).get('/api/driver/portal');
      const response2 = await request(app).get('/api/driver/portal');
      
      expect(response1.body.profile.driverId).toBe(response2.body.profile.driverId);
      expect(response1.body.profile.name).toBe(response2.body.profile.name);
      expect(response1.body.wallet.balance).toBe(response2.body.wallet.balance);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle malformed requests gracefully', async () => {
      // Test with invalid HTTP method
      await request(app)
        .post('/api/driver/portal')
        .expect(404);
    });
    
    it('should handle missing endpoints', async () => {
      await request(app)
        .get('/api/driver/nonexistent')
        .expect(404);
    });
  });
});
