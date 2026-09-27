const request = require('supertest');
const app = require('../server');
const { query } = require('../db');

let businessToken;
let artisanToken;
let businessId;
let artisanId;
let categoryId;
let requestId;

async function registerUser(email, role) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ email, password: 'password123', role });
  return { token: res.body.data.token, id: res.body.data.user.id };
}

describe('Artisan Application and Location Privacy Flow', () => {
  beforeAll(async () => {
    await query('DELETE FROM request_applications');
    await query('DELETE FROM disputes');
    await query('DELETE FROM ratings');
    await query('DELETE FROM booking_status_history');
    await query('DELETE FROM bookings');
    await query('DELETE FROM service_requests');
    await query('DELETE FROM artisan_profiles');
    await query('DELETE FROM business_profiles');
    await query("DELETE FROM users WHERE email LIKE 'app-test-%'");

    const business = await registerUser('app-test-business@vms.com', 'business');
    businessToken = business.token;
    businessId = business.id;

    const artisan = await registerUser('app-test-artisan@vms.com', 'artisan');
    artisanToken = artisan.token;
    artisanId = artisan.id;

    const catRes = await query("SELECT id FROM service_categories WHERE name = 'Electrical'");
    categoryId = catRes.rows[0].id;

    await query(
      'UPDATE artisan_profiles SET categories = $1, verification_status = $2, full_name = $3, location = $4, phone = $5 WHERE user_id = $6',
      [[categoryId], 'verified', 'Test Artisan', 'Accra', '0244000000', artisanId]
    );

    const requestRes = await request(app)
      .post('/api/service-requests')
      .set('Authorization', `Bearer ${businessToken}`)
      .send({
        category_id: categoryId,
        title: 'Electrical repair needed',
        description: 'Fix shop wiring',
        location: 'Accra',
        latitude: 5.6037,
        longitude: -0.1870,
        preferred_timeframe: '2026-10-15',
        budget: '400',
      });
    requestId = requestRes.body.data.request.id;
  });

  afterAll(async () => {
    await query('DELETE FROM request_applications');
    await query('DELETE FROM disputes');
    await query('DELETE FROM ratings');
    await query('DELETE FROM booking_status_history');
    await query('DELETE FROM bookings');
    await query('DELETE FROM service_requests');
    await query('DELETE FROM artisan_profiles');
    await query('DELETE FROM business_profiles');
    await query("DELETE FROM users WHERE email LIKE 'app-test-%'");
  });

  it('should only show matching category requests to artisans', async () => {
    const res = await request(app)
      .get('/api/service-requests')
      .set('Authorization', `Bearer ${artisanToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.requests.length).toBeGreaterThan(0);
    expect(res.body.data.requests[0].category_id).toBe(categoryId);
  });

  it('should hide exact coordinates from artisan on request list', async () => {
    const res = await request(app)
      .get('/api/service-requests')
      .set('Authorization', `Bearer ${artisanToken}`);

    const req = res.body.data.requests.find((r) => r.id === requestId);
    expect(req).toBeDefined();
    expect(req.latitude).toBeUndefined();
    expect(req.longitude).toBeUndefined();
  });

  it('should hide exact coordinates from artisan on request detail before approval', async () => {
    const res = await request(app)
      .get(`/api/service-requests/${requestId}`)
      .set('Authorization', `Bearer ${artisanToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.request.latitude).toBeUndefined();
    expect(res.body.data.request.longitude).toBeUndefined();
  });

  it('should allow artisan to apply to a matching request', async () => {
    const res = await request(app)
      .post(`/api/service-requests/${requestId}/apply`)
      .set('Authorization', `Bearer ${artisanToken}`)
      .send({ message: 'I can do this job' });

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should show the application to the business owner', async () => {
    const res = await request(app)
      .get(`/api/service-requests/${requestId}/applications`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.applications.length).toBe(1);
    expect(res.body.data.applications[0].artisan_id).toBe(artisanId);
  });

  it('should reveal exact location to artisan after business approves application', async () => {
    const appsRes = await request(app)
      .get(`/api/service-requests/${requestId}/applications`)
      .set('Authorization', `Bearer ${businessToken}`);
    const applicationId = appsRes.body.data.applications[0].id;

    const res = await request(app)
      .put(`/api/service-requests/${requestId}/applications/${applicationId}/approve`)
      .set('Authorization', `Bearer ${businessToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data.booking.status).toBe('accepted');

    const requestRes = await request(app)
      .get(`/api/service-requests/${requestId}`)
      .set('Authorization', `Bearer ${artisanToken}`);

    expect(requestRes.body.data.request.latitude).toBeDefined();
    expect(requestRes.body.data.request.longitude).toBeDefined();
  });
});
