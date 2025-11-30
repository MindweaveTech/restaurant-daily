import { test, expect } from '@playwright/test';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-for-development';

test.describe('Staff Invitation API', () => {
    let adminToken: string;
    let staffToken: string;

    test.beforeAll(async () => {
        // Generate a mock admin token
        adminToken = jwt.sign({
            phone: '+1234567890',
            role: 'admin',
            restaurant_id: 'rest_123',
            restaurant_name: 'Test Restaurant',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        }, JWT_SECRET);

        // Generate a mock staff token (who shouldn't be able to invite)
        staffToken = jwt.sign({
            phone: '+0987654321',
            role: 'staff',
            restaurant_id: 'rest_123',
            restaurant_name: 'Test Restaurant',
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + 3600
        }, JWT_SECRET);
    });

    test('should allow admin to invite staff', async ({ request }) => {
        const response = await request.post('/api/staff/invite', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            },
            data: {
                phone: '+15555555555',
                role: 'staff'
            }
        });

        // Note: This might fail if the DB is not mocked or set up, 
        // but we are testing the endpoint logic. 
        // If it hits the real DB, we might need to handle that.
        // For now, let's see what happens.
        const body = await response.json();
        console.log('Admin invite response:', body);
        if (response.status() !== 200) {
            console.log('Admin invite failure response:', body);
        }

        // We expect either success or a specific error if DB fails (which confirms the endpoint is reachable)
        // Ideally we want 200.
        expect(response.status()).toBe(200);
        expect(body.success).toBe(true);
        expect(body.invitation).toBeDefined();
    });

    test('should deny staff from inviting others', async ({ request }) => {
        const response = await request.post('/api/staff/invite', {
            headers: {
                'Authorization': `Bearer ${staffToken}`
            },
            data: {
                phone: '+15555555556',
                role: 'staff'
            }
        });

        const body = await response.json();
        console.log('Staff invite response:', body);
        expect(response.status()).toBe(403);
    });

    test('should validate phone number', async ({ request }) => {
        const response = await request.post('/api/staff/invite', {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            },
            data: {
                phone: 'invalid-phone',
                role: 'staff'
            }
        });

        expect(response.status()).toBe(400);
    });
});
