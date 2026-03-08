const request = require('supertest');
const app = require('../app');
const mongoose = require('mongoose');
const Transaction = require('../models/transactionModel');
const { generateToken } = require('../utils/jwtHelper');

let authToken;
let userId;
let transactionId;

beforeAll(async () => {
    // Connect to test database
    const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/finedge_test';
    
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(mongoUri);
    }
    
    // Create test user and generate token - use ObjectId
    userId = new mongoose.Types.ObjectId();
    authToken = generateToken({ id: userId.toString(), email: 'test@example.com' });
});

afterAll(async () => {
    // Clean up and disconnect
    await Transaction.deleteMany({ userId });
    await mongoose.connection.close();
});

beforeEach(async () => {
    // Clear transactions before each test
    await Transaction.deleteMany({ userId });
});

describe('Transaction API Tests', () => {
    
    describe('POST /api/v1/transactions', () => {
        it('should create a new transaction with valid data', async () => {
            const res = await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'expense',
                    category: 'Groceries',
                    amount: 100,
                    date: '2026-03-07'
                });
            
            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('_id');
            expect(res.body.data.category).toBe('Groceries');
            transactionId = res.body.data._id;
        });

        it('should auto-categorize transaction based on keywords', async () => {
            const res = await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'expense',
                    category: 'walmart shopping',
                    amount: 50
                });
            
            expect(res.status).toBe(201);
            expect(res.body.data.category).toBe('Groceries');
            expect(res.body.message).toContain('auto-corrected');
        });

        it('should reject transaction with negative amount', async () => {
            const res = await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    type: 'expense',
                    category: 'Food',
                    amount: -100
                });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.error).toContain('amount');
        });

        it('should reject transaction without type', async () => {
            const res = await request(app)
                .post('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    category: 'Food',
                    amount: 100
                });
            
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it('should reject request without auth token', async () => {
            const res = await request(app)
                .post('/api/v1/transactions')
                .send({
                    type: 'expense',
                    category: 'Food',
                    amount: 100
                });
            
            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/v1/transactions', () => {
        beforeEach(async () => {
            // Create sample transactions with proper ObjectId
            await Transaction.create([
                { userId, type: 'expense', category: 'Groceries', amount: 100, date: new Date() },
                { userId, type: 'income', category: 'Salary', amount: 5000, date: new Date() }
            ]);
        });

        it('should get all transactions for user', async () => {
            const res = await request(app)
                .get('/api/v1/transactions')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBe(2);
        });
    });

    describe('GET /api/v1/transactions/:transactionId', () => {
        beforeEach(async () => {
            const transaction = await Transaction.create({
                userId,
                type: 'expense',
                category: 'Food',
                amount: 50,
                date: new Date()
            });
            transactionId = transaction._id.toString();
        });

        it('should get transaction by ID', async () => {
            const res = await request(app)
                .get(`/api/v1/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data._id).toBe(transactionId);
        });

        it('should return 404 for non-existent transaction', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .get(`/api/v1/transactions/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(404);
        });
    });

    describe('PATCH /api/v1/transactions/:transactionId', () => {
        beforeEach(async () => {
            const transaction = await Transaction.create({
                userId,
                type: 'expense',
                category: 'Food',
                amount: 50,
                date: new Date()
            });
            transactionId = transaction._id.toString();
        });

        it('should update transaction', async () => {
            const res = await request(app)
                .patch(`/api/v1/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ amount: 75 });
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.amount).toBe(75);
        });

        it('should reject update with invalid amount', async () => {
            const res = await request(app)
                .patch(`/api/v1/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ amount: -50 });
            
            expect(res.status).toBe(400);
        });
    });

    describe('DELETE /api/v1/transactions/:transactionId', () => {
        beforeEach(async () => {
            const transaction = await Transaction.create({
                userId,
                type: 'expense',
                category: 'Food',
                amount: 50,
                date: new Date()
            });
            transactionId = transaction._id.toString();
        });

        it('should delete transaction', async () => {
            const res = await request(app)
                .delete(`/api/v1/transactions/${transactionId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(204);
        });

        it('should return 404 when deleting non-existent transaction', async () => {
            const fakeId = new mongoose.Types.ObjectId();
            const res = await request(app)
                .delete(`/api/v1/transactions/${fakeId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(404);
        });
    });

    describe('GET /api/v1/transactions/summary', () => {
        beforeEach(async () => {
            await Transaction.create([
                { userId, type: 'expense', category: 'Food', amount: 100, date: new Date() },
                { userId, type: 'expense', category: 'Food', amount: 50, date: new Date() },
                { userId, type: 'income', category: 'Salary', amount: 5000, date: new Date() }
            ]);
        });

        it('should return summary of transactions', async () => {
            const res = await request(app)
                .get('/api/v1/transactions/summary')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toHaveProperty('totalIncome');
            expect(res.body.data).toHaveProperty('totalExpense');
            expect(res.body.data.totalIncome).toBe(5000);
            expect(res.body.data.totalExpense).toBe(150);
        });
    });

    describe('GET /api/v1/transactions/recommendations', () => {
        beforeEach(async () => {
            const now = new Date();
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 15);
            
            // Create last month transactions
            await Transaction.create([
                { userId, type: 'expense', category: 'Groceries', amount: 100, date: lastMonth }
            ]);
            
            // Create current month transactions with higher spending
            await Transaction.create([
                { userId, type: 'expense', category: 'Groceries', amount: 200, date: now }
            ]);
        });

        it('should return spending recommendations', async () => {
            const res = await request(app)
                .get('/api/v1/transactions/recommendations')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
            expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api/v1/transactions/recent', () => {
        beforeEach(async () => {
            const now = new Date();
            await Transaction.create([
                { userId, type: 'expense', category: 'Food', amount: 50, date: now },
                { userId, type: 'income', category: 'Salary', amount: 1000, date: now }
            ]);
        });

        it('should return recent transactions', async () => {
            const res = await request(app)
                .get('/api/v1/transactions/recent')
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });

        it('should return transactions since timestamp', async () => {
            const since = new Date(Date.now() - 1000 * 60).toISOString(); // 1 minute ago
            const res = await request(app)
                .get(`/api/v1/transactions/recent?since=${since}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
        });
    });
});