// Load environment variables first
require('dotenv').config();

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/userModel');

let authToken;
let testUserId;
const testUser = {
    name: 'TestUser',
    email: 'testuser@example.com',
    password: 'password123'
};

beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/finedge_test';
    
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
    }
});

afterAll(async () => {
    // Clean up test user
    await User.deleteOne({ email: testUser.email });
    await User.deleteOne({ email: 'newuser@example.com' });
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Clean up before each test
    await User.deleteOne({ email: testUser.email });
    await User.deleteOne({ email: 'newuser@example.com' });
});

describe('User API Tests', () => {
    
    describe('POST /users - Register', () => {
        it('should register a new user with valid data', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    name: 'TestUser',
                    email: 'newuser@example.com',
                    password: 'password123'
                });
            
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('registered');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user.email).toBe('newuser@example.com');
            expect(res.body.data.user).not.toHaveProperty('password');
        });

        it('should reject registration with missing name', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Name');
        });

        it('should reject registration with short name', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    name: 'AB',
                    email: 'test@example.com',
                    password: 'password123'
                });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('3 characters');
        });

        it('should reject registration with invalid email', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    name: 'TestUser',
                    email: 'invalid-email',
                    password: 'password123'
                });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('valid email');
        });

        it('should reject registration with short password', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    name: 'TestUser',
                    email: 'test@example.com',
                    password: 'short'
                });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('8 characters');
        });

        it('should reject registration with missing password', async () => {
            const res = await request(app)
                .post('/users')
                .send({
                    name: 'TestUser',
                    email: 'test@example.com'
                });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject duplicate user registration', async () => {
            // Register first time
            await request(app)
                .post('/users')
                .send(testUser);
            
            // Try to register again with same email
            const res = await request(app)
                .post('/users')
                .send(testUser);
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('already exists');
        });

        it('should hash password before storing', async () => {
            const res = await request(app)
                .post('/users')
                .send(testUser);
            
            expect(res.status).toBe(201);
            
            const user = await User.findOne({ email: testUser.email });
            expect(user.password).not.toBe(testUser.password);
            expect(user.password.length).toBeGreaterThan(20); // bcrypt hashes are long
        });
    });

    describe('POST /users/login - Login', () => {
        beforeEach(async () => {
            // Create a user for login tests
            await request(app)
                .post('/users')
                .send(testUser);
        });

        it('should login with valid credentials', async () => {
            const res = await request(app)
                .post('/users/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toContain('logged in');
            expect(res.body.data).toHaveProperty('user');
            expect(res.body.data).toHaveProperty('token');
            expect(res.body.data.user).not.toHaveProperty('password');
            
            authToken = res.body.data.token;
            testUserId = res.body.data.user._id;
        });

        it('should reject login with wrong password', async () => {
            const res = await request(app)
                .post('/users/login')
                .send({
                    email: testUser.email,
                    password: 'wrongpassword'
                });
            
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
        });

        it('should reject login with non-existent email', async () => {
            const res = await request(app)
                .post('/users/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password123'
                });
            
            expect(res.status).toBe(401);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('Invalid credentials');
        });

        it('should reject login with missing email', async () => {
            const res = await request(app)
                .post('/users/login')
                .send({
                    password: 'password123'
                });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject login with invalid email format', async () => {
            const res = await request(app)
                .post('/users/login')
                .send({
                    email: 'invalid-email',
                    password: 'password123'
                });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });
    });

    describe('GET /users/:id - Get User By ID (Protected)', () => {
        beforeEach(async () => {
            // Create and login user
            await request(app)
                .post('/users')
                .send(testUser);
            
            const loginRes = await request(app)
                .post('/users/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            
            authToken = loginRes.body.data.token;
            testUserId = loginRes.body.data.user._id;
        });

        it('should get user by ID with valid token', async () => {
            const res = await request(app)
                .get(`/users/${testUserId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.email).toBe(testUser.email);
            expect(res.body.data).not.toHaveProperty('password');
        });

        it('should reject request without token', async () => {
            const res = await request(app)
                .get(`/users/${testUserId}`);
            
            expect(res.status).toBe(401);
        });

        it('should reject request with invalid token', async () => {
            const res = await request(app)
                .get(`/users/${testUserId}`)
                .set('Authorization', 'Bearer invalid-token');
            
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(res.body.success).toBe(false);
        });

        it('should return 404 for non-existent user ID', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/users/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(404);
            expect(res.body.error).toContain('not found');
        });
    });

    describe('GET /users - Get All Users (Protected)', () => {
        beforeEach(async () => {
            // Create and login user
            await request(app)
                .post('/users')
                .send(testUser);
            
            const loginRes = await request(app)
                .post('/users/login')
                .send({
                    email: testUser.email,
                    password: testUser.password
                });
            
            authToken = loginRes.body.data.token;
        });

        it('should get all users with valid token', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should reject request without token', async () => {
            const res = await request(app)
                .get('/users');
            
            expect(res.status).toBe(401);
        });

        it('should not include passwords in user list', async () => {
            const res = await request(app)
                .get('/users')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            res.body.data.forEach(user => {
                expect(user).not.toHaveProperty('password');
            });
        });
    });

    describe('JWT Token Validation', () => {
        it('should include user data in token', async () => {
            const registerRes = await request(app)
                .post('/users')
                .send(testUser);
            
            const token = registerRes.body.data.token;
            expect(token).toBeTruthy();
            expect(typeof token).toBe('string');
            
            // Token should have 3 parts (header.payload.signature)
            const parts = token.split('.');
            expect(parts.length).toBe(3);
        });

        it('should accept Bearer token in Authorization header', async () => {
            const registerRes = await request(app)
                .post('/users')
                .send(testUser);
            
            const token = registerRes.body.data.token;
            const userId = registerRes.body.data.user._id;
            
            const res = await request(app)
                .get(`/users/${userId}`)
                .set('Authorization', `Bearer ${token}`);
            
            expect(res.status).toBe(200);
        });
    });
});

