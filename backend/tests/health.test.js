const request = require('supertest');
const app = require('../app');

describe('GET /api/health', () => {
  it('should return status 200 and { status: "ok" }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('should return status 404 and standard error format for undefined routes', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('not found');
  });
});

describe('CORS', () => {
  it('should allow requests from whitelisted origins', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://localhost:5173');
    expect(res.statusCode).toBe(200);
    expect(res.headers['access-control-allow-origin']).toBe('http://localhost:5173');
  });

  it('should reject requests from non-whitelisted origins', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', 'http://malicious-site.com');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('should allow requests with no Origin header (curl/Postman)', async () => {
    const res = await request(app).get('/api/health');
    // supertest sends no Origin header by default
    expect(res.statusCode).toBe(200);
  });
});
