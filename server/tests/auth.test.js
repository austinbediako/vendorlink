const request = require('supertest');
const app = require('../server');
const { query } = require('../db');

let authToken;
let userId;

describe('Authentication API', () => {
  beforeAll(async () => {
    await query('DELETE FROM ratings');
    await query('DELETE FROM bookings');
    await query('DELETE FROM service_requests');
    await query('DELETE FROM business_profiles');
    await query('DELETE FROM artisan_profiles');
    await query("DELETE FROM users WHERE email = 'testuser@vms.com'");
  });

  afterAll(async () => {
    await query('DELETE FROM ratings');
    await query('DELETE FROM bookings');
    await query('DELETE FROM service_requests');
    await query('DELETE FROM business_profiles');
    await query('DELETE FROM artisan_profiles');
    await query("DELETE FROM users WHERE email = 'testuser@vms.com'");
  });

  it('should register a new business user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@vms.com',
        password: 'password123',
        role: 'business',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.role).toBe('business');
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  it('should not register a duplicate user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'testuser@vms.com',
        password: 'password123',
        role: 'business',
      });

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@vms.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
  });

  it('should reject invalid login credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@vms.com',
        password: 'wrongpassword',
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('should get current user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('testuser@vms.com');
  });
});
