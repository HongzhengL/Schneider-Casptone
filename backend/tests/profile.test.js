const request = require('supertest');
const app = require('../src/server');

describe('Profile endpoints', () => {
  test('GET /api/profiles returns all profiles', async () => {
    const res = await request(app).get('/api/profiles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('GET /api/profiles/:id returns a single profile', async () => {
    const res = await request(app).get('/api/profiles/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe('1');
    expect(res.body.name).toBeDefined();
  });
});

describe('/api/loads/find with profiles', () => {
  test('profile filters are applied when profile is passed by id', async () => {
    const res = await request(app).get('/api/loads/find').query({ profile: '1' });
    expect(res.statusCode).toBe(200);
    // All results should match the profile origin and destination
    res.body.forEach((load) => {
      expect(`${load.fromLocation.city}, ${load.fromLocation.state}`).toBe('Chicago, IL');
      expect(`${load.toLocation.city}, ${load.toLocation.state}`).toBe('Madison, WI');
    });
  });

  test('profile filters can be overridden by query parameters', async () => {
    const res = await request(app)
      .get('/api/loads/find')
      .query({ profile: '1', origin: 'Madison, WI' });
    expect(res.statusCode).toBe(200);
    // Overriding the origin should return loads that depart from Madison, WI
    res.body.forEach((load) => {
      expect(`${load.fromLocation.city}, ${load.fromLocation.state}`).toBe('Madison, WI');
    });
  });
});