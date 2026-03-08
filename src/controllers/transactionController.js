const transactionService = require('../services/transactionService');
const cacheService = require('../utils/cacheService');
const analyticsService = require('../services/analyticsService');
const { suggestCategory } = require('../utils/categorizer');

function getUserIdFromReq(req) {
    // ensure middleware validateJWT set req.userId
    return req.userId || (req.user && (req.user.id || req.user.userId || req.user.sub)) || null;
}

async function createTransaction(req, res, next) {
    console.log('Creating transaction with payload:', req.body);
    try {
        const userId = getUserIdFromReq(req);
        let { category, ...rest } = req.body;
        
        // Auto-suggest better category based on keywords
        const suggestedCategory = suggestCategory(category);
        
        const payload = { ...rest, category: suggestedCategory, userId };
        const transaction = await transactionService.createTransaction(payload);
        const out = transaction && transaction.toObject ? transaction.toObject() : transaction;
        
        const message = suggestedCategory !== category 
            ? `Transaction created. Category auto-corrected to '${suggestedCategory}'.`
            : 'Transaction created successfully';
            
        return res.status(201).json({ success: true, data: out, message });
    } catch (error) {
        return next(error);
    }
}

async function getTransactionsByUser(req, res, next) {
    try {
        const userId = getUserIdFromReq(req);
        const transactions = await transactionService.getTransactionsByUser(userId);
        const out = transactions.map(t => (t.toObject ? t.toObject() : t));
        return res.status(200).json({ success: true, data: out, message: 'Transactions retrieved successfully' });
    } catch (error) {
        return next(error);
    }
}

async function getTransactionById(req, res, next) {
    try {
        const userId = getUserIdFromReq(req);
        const transaction = await transactionService.getTransactionById(userId, req.params.transactionId);
        if (!transaction) {
            const err = new Error('Transaction not found');
            err.statusCode = 404;
            throw err;
        }
        const out = transaction.toObject ? transaction.toObject() : transaction;
        return res.status(200).json({ success: true, data: out, message: 'Transaction retrieved successfully' });
    } catch (error) {
        return next(error);
    }
}

async function updateTransaction(req, res, next) {
    try {
        const userId = getUserIdFromReq(req);
        const transaction = await transactionService.updateTransaction(userId, req.params.transactionId, req.body);
        if (!transaction) {
            const err = new Error('Transaction not found');
            err.statusCode = 404;
            throw err;
        }
        const out = transaction.toObject ? transaction.toObject() : transaction;
        return res.status(200).json({ success: true, data: out, message: 'Transaction updated successfully' });
    } catch (error) {
        return next(error);
    }
}

async function deleteTransaction(req, res, next) {
    try {
        const userId = getUserIdFromReq(req);
        const result = await transactionService.deleteTransaction(userId, req.params.transactionId);
        if (!result) {
            const err = new Error('Transaction not found');
            err.statusCode = 404;
            throw err;
        }
        return res.status(204).json({ success: true, message: 'Transaction deleted successfully' });
    } catch (error) {
        return next(error);
    }
}

async function getSummary(req, res, next) {
    try {
        const userId = getUserIdFromReq(req);
        const cacheKey = `summary_${userId}`;
        const cached = cacheService.get(cacheKey);
        if (cached) {
            return res.status(200).json({ success: true, data: cached });
        }
        const summary = await transactionService.getSummaryByUser(userId);
        cacheService.set(cacheKey, summary, 60 * 1000); // cache 60s
        return res.status(200).json({ success: true, data: summary, message: 'Transaction summary retrieved successfully' });
    } catch (error) {
        return next(error);
    }
}

async function getRecommendations(req, res, next) {
    try {
        const userId = getUserIdFromReq(req);
        const recommendations = await analyticsService.getSpendingRecommendations(userId);
        return res.status(200).json({ success: true, data: recommendations });
    } catch (error) {
        return next(error);
    }
}

async function getRecentTransactions(req, res, next) {
    try {
        const userId = getUserIdFromReq(req);
        const since = req.query.since; // ISO timestamp
        const transactions = await transactionService.getRecentTransactions(userId, since);
        const out = transactions.map(t => (t.toObject ? t.toObject() : t));
        return res.status(200).json({ success: true, data: out });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    createTransaction,
    getTransactionsByUser,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getSummary,
    getRecommendations,
    getRecentTransactions
};