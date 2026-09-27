const request = require('supertest');
const app = require('../server');
const { query } = require('../db');

let businessToken;
let artisanToken;
let adminToken;
let businessId;
let artisanId;
let artisanPublicId;
let categoryId;
let requestId;
let bookingId;

describe('Core Business Workflow', () => {
  beforeAll(async () => {
    // Clean up test data
    await query('DELETE FROM disputes');
    await query('DELETE FROM ratings');
    await query('DELETE FROM booking_status_history');
    await query('DELETE FROM bookings');
    await query('DELETE FROM service_requests');
    await query('DELETE FROM artisan_profiles');
    await query('DELETE FROM business_profiles');
    await query("DELETE FROM users WHERE email LIKE 'workflow-%'");

    // Create business user
    const businessRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'workflow-business@vms.com', password: 'password123', role: 'business' });
    businessToken = businessRes.body.data.token;
    businessId = businessRes.body.data.user.id;

    // Create artisan user
    const artisanRes = await request(app)
      .post('/api/auth/register')
      .send({ email: 'workflow-artisan@vms.com', password: 'password123', role: 'artisan' });
    artisanToken = artisanRes.body.data.token;
    artisanId = artisanRes.body.data.user.id;
    const publicIdRes = await query('SELECT public_id FROM artisan_profiles WHERE user_id = $1', [artisanId]);
    artisanPublicId = publicIdRes.rows[0].public_id;

    // Update artisan profile with categories and verification
    const catRes = await query('SELECT id FROM service_categories LIMIT 1');
    categoryId = catRes.rows[0].id;

    await query(
      'UPDATE artisan_profiles SET categories = $1, verification_status = $2 WHERE user_id = $3',
      [[categoryId], 'verified', artisanId]
    );

    // Admin login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@vms.com', password: 'password123' });
    adminToken = adminRes.body.data.token;
  });

  afterAll(async () => {
    await query('DELETE FROM disputes');
    await query('DELETE FROM ratings');
    await query('DELETE FROM booking_status_history');
    await query('DELETE FROM bookings');
    await query('DELETE FROM service_requests');
    await query('DELETE FROM artisan_profiles');
    await query('DELETE FROM business_profiles');
    await query("DELETE FROM users WHERE email LIKE 'workflow-%'");
  });

  it('should allow a business to create a service request', async () => {
    const res = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        category_id: categoryId,
        title: 'Fix electrical fault',
        description: 'Shop has no power in the back room.',
        location: 'Accra',
        preferred_timeframe: '2026-10-15',
        budget: '300',
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    requestId = res.body.data.request.id;
  });

  it('should allow artisans to view open service requests', async () => {
    const res = await request(app)
      .get('/api/service-requests')
      .set('Authorization', `Bearer ${artisanToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.requests.length).toBeGreaterThan(0);
  });

  it('should allow a business to book an artisan', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        request_id: requestId,
        artisan_id: artisanId,
        agreed_price: '250',
        scheduled_date: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.booking.status).toBe('requested');
    bookingId = res.body.data.booking.id;
  });

  it('should allow artisan to accept the booking', async () => {
    const res = await request(app)
      .put(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${artisanToken}`)
      .send({ status: 'accepted' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should allow artisan to complete the booking', async () => {
    await request(app)
      .put(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${artisanToken}`)
      .send({ status: 'in_progress' });

    const res = await request(app)
      .put(`/api/bookings/${bookingId}/status`)
      .set('Authorization', `Bearer ${artisanToken}`)
      .send({ status: 'completed' });

    expect(res.statusCode).toBe(200);
  });

  it('should allow business to rate the artisan', async () => {
    const res = await request(app)
      .post(`/api/ratings/${bookingId}`)
      .set('Authorization', `Bearer ${businessToken}`)
      .send({ rating: 5, review: 'Excellent work, very professional.' });

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should reflect the new rating on the artisan profile', async () => {
    const res = await request(app)
      .get(`/api/artisans/${artisanPublicId}`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.statusCode).toBe(200);
    expect(parseFloat(res.body.data.artisan.average_rating)).toBe(5);
  });
});
