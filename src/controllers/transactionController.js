const transactionService = require('../services/transactionService');
const cacheService = require('../utils/cacheService');

//create a new transaction
async function createTransaction(req, res) {
    let userId = req.headers['x-user-id']; 
    try {
        let payload = {
            ...req.body,
            userId
        }
        const transaction = await transactionService.createTransaction(payload);
        res.status(201).send(transaction);
    } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        res.status(500).json({ error: error.message });
    }
}

//get all transactions for a user
async function getTransactionsByUser(req, res) {
    let userId = req.headers['x-user-id'];
    try {
        const transactions = await transactionService.getTransactionsByUser(userId);
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//get transaction by id for a user
async function getTransactionById(req, res) {
    let userId = req.headers['x-user-id'];
    try {
        const transaction = await transactionService.getTransactionById(userId, req.params.transactionId);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

//update a transaction
async function updateTransaction(req, res) {
    let userId = req.headers['x-user-id'];
    try {
        const transaction = await transactionService.updateTransaction(userId, req.params.transactionId, req.body);
        if (!transaction) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(200).json(transaction);
    } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        res.status(500).json({ error: error.message });
    }
}

//delete a transaction
async function deleteTransaction(req, res) {
    let userId = req.headers['x-user-id'];
    try {
        const result = await transactionService.deleteTransaction(userId, req.params.transactionId);
        if (!result) {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

async function getSummary(req, res) {
    let userId = req.headers['x-user-id'];
    const cacheKey = `summary_${userId}`;
    const cached = cacheService.get(cacheKey);
    if (cached) {
        return res.status(200).json(cached);
    }
    try {
        const summary = await transactionService.getSummaryByUser(userId);
        cacheService.set(cacheKey, summary, 60 * 1000); // cache for 60 seconds
        res.status(200).json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    createTransaction,
    getTransactionsByUser,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getSummary
};