// Load environment variables first
require('dotenv').config();

const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const User = require('../models/userModel');
const Transaction = require('../models/transactionModel');
const cacheService = require('../utils/cacheService');

let authToken;
let userId;
const testUser = {
    name: 'SummaryUser',
    email: 'summary@example.com',
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
    // Clean up test data
    await User.deleteOne({ email: testUser.email });
    await Transaction.deleteMany({ userId });
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Clean up before each test
    await User.deleteOne({ email: testUser.email });
    if (userId) {
        await Transaction.deleteMany({ userId });
    }
    
    // Register and login user
    const registerRes = await request(app)
        .post('/users')
        .send(testUser);
    
    authToken = registerRes.body.data.token;
    userId = registerRes.body.data.user._id;
});

describe('Summary API Tests', () => {
    
    describe('GET /api/v1/transactions/summary', () => {
        
        it('should get summary with valid token', async () => {
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('totalIncome');
            expect(res.body.data).toHaveProperty('totalExpense');
        });

        it('should reject request without token', async () => {
            const res = await request(app)
                .get('/api/v1/transactions/summary');
            
            expect(res.status).toBe(401);
        });

        it('should reject request with invalid token', async () => {
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', 'Bearer invalid-token-here');
            
            expect(res.status).toBeGreaterThanOrEqual(400);
            expect(res.body.success).toBe(false);
        });

        it('should return zero totals for user with no transactions', async () => {
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.data.totalIncome).toBe(0);
            expect(res.body.data.totalExpense).toBe(0);
        });

        it('should calculate total income correctly', async () => {
            // Create income transactions
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'income',
                    category: 'Salary',
                    amount: 5000
                });
            
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'income',
                    category: 'Freelance',
                    amount: 1500
                });
            
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.data.totalIncome).toBe(6500);
            expect(res.body.data.totalExpense).toBe(0);
        });

        it('should calculate total expenses correctly', async () => {
            // Create expense transactions
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'expense',
                    category: 'Groceries',
                    amount: 250.50
                });
            
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'expense',
                    category: 'Utilities',
                    amount: 150.75
                });
            
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.data.totalIncome).toBe(0);
            expect(res.body.data.totalExpense).toBe(401.25);
        });

        it('should calculate both income and expenses correctly', async () => {
            // Create multiple transactions
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'income',
                    category: 'Salary',
                    amount: 5000
                });
            
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'expense',
                    category: 'Rent',
                    amount: 1200
                });
            
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'expense',
                    category: 'Groceries',
                    amount: 300.50
                });
            
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'income',
                    category: 'Bonus',
                    amount: 1000
                });
            
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.data.totalIncome).toBe(6000);
            expect(res.body.data.totalExpense).toBe(1500.50);
        });

        it('should only show summary for authenticated user, not other users', async () => {
            // Create transactions for first user
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'income',
                    category: 'Salary',
                    amount: 5000
                });
            
            // Register a second user
            const user2 = {
                name: 'OtherUser',
                email: 'other@example.com',
                password: 'password123'
            };
            
            const registerRes2 = await request(app)
                .post('/users')
                .send(user2);
            
            const authToken2 = registerRes2.body.data.token;
            
            // Get summary for second user (should be 0)
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken2}`);
            
            expect(res.status).toBe(200);
            expect(res.body.data.totalIncome).toBe(0);
            expect(res.body.data.totalExpense).toBe(0);
            
            // Clean up second user
            await User.deleteOne({ email: user2.email });
        });

        it('should handle decimal amounts correctly', async () => {
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'expense',
                    category: 'Coffee',
                    amount: 4.99
                });
            
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'expense',
                    category: 'Lunch',
                    amount: 12.50
                });
            
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.data.totalExpense).toBeCloseTo(17.49, 2);
        });
    });

    describe('Summary Cache Functionality', () => {
        
        it('should cache summary data', async () => {
            // Create a transaction
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'income',
                    category: 'Salary',
                    amount: 5000
                });
            
            // First request - should compute and cache
            const res1 = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res1.status).toBe(200);
            expect(res1.body.data.totalIncome).toBe(5000);
            
            // Check cache exists
            const cacheKey = `summary_${userId}`;
            const cachedData = cacheService.get(cacheKey);
            expect(cachedData).not.toBeNull();
            expect(cachedData.totalIncome).toBe(5000);
        });

        it('should return cached data on subsequent requests', async () => {
            // Create a transaction
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'income',
                    category: 'Salary',
                    amount: 5000
                });
            
            // First request
            await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            // Add another transaction (won't be in cache yet)
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'income',
                    category: 'Bonus',
                    amount: 1000
                });
            
            // Second request - should return cached data (5000, not 6000)
            const res2 = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            // Cache should still show old value for a short time
            expect(res2.status).toBe(200);
            expect(res2.body.data.totalIncome).toBe(5000); // Old cached value
        });

        it('should have message in response', async () => {
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('message');
            expect(res.body.message).toContain('summary');
        });
    });

    describe('Summary Edge Cases', () => {
        
        it('should handle large amounts correctly', async () => {
            await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'income',
                    category: 'Investment',
                    amount: 1000000
                });
            
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.data.totalIncome).toBe(1000000);
        });

        it('should handle many transactions efficiently', async () => {
            // Create 20 transactions
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(
                    request(app)
                        .post('/api/v1/transactions')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            type: 'income',
                            category: 'Salary',
                            amount: 100
                        })
                );
                promises.push(
                    request(app)
                        .post('/api/v1/transactions')
                        .set('Authorization', `Bearer ${authToken}`)
                        .send({
                            type: 'expense',
                            category: 'Food',
                            amount: 50
                        })
                );
            }
            
            await Promise.all(promises);
            
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.data.totalIncome).toBe(1000);
            expect(res.body.data.totalExpense).toBe(500);
        });
    });
});

