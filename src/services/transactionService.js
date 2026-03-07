const Transaction = require('../models/transactionModel');
const mongoose = require('mongoose');

// Helper to convert userId to ObjectId if needed
function toObjectId(userId) {
    if (typeof userId === 'string') {
        return new mongoose.Types.ObjectId(userId);
    }
    return userId;
}

// Create a new transaction
async function createTransaction(transactionData) {
    const data = { ...transactionData, userId: toObjectId(transactionData.userId) };
    const transaction = new Transaction(data);
    return await transaction.save();
}

// Get all transactions for a user
async function getTransactionsByUser(userId) {
    return await Transaction.find({ userId: toObjectId(userId) });
}

// Get a specific transaction by ID for a user
async function getTransactionById(userId, transactionId) {
    return await Transaction.findOne({ _id: transactionId, userId: toObjectId(userId) });
}

// Update a transaction for a user
async function updateTransaction(userId, transactionId, updateData) {
    return await Transaction.findOneAndUpdate(
        { _id: transactionId, userId: toObjectId(userId) },
        updateData,
        { new: true, runValidators: true }
    );
}

// Delete a transaction for a user
async function deleteTransaction(userId, transactionId) {
    return await Transaction.findOneAndDelete({ _id: transactionId, userId: toObjectId(userId) });
}

async function getSummaryByUser(userId) {
    const summary = await Transaction.aggregate([
        { $match: { userId: toObjectId(userId) } },
        {
            $group: {
                _id: "$type",
                total: { $sum: "$amount" }
            }
        }
    ]);
    
    // Format result to match test expectations
    const result = { totalIncome: 0, totalExpense: 0 };
    summary.forEach(item => {
        if (item._id === 'income') {
            result.totalIncome = item.total;
        } else if (item._id === 'expense') {
            result.totalExpense = item.total;
        }
    });
    return result;
}

async function getRecentTransactions(userId, sinceTimestamp) {
    const query = { userId: toObjectId(userId) };
    if (sinceTimestamp) {
        query.date = { $gt: new Date(sinceTimestamp) };
    }
    return await Transaction.find(query).sort({ date: -1 }).limit(10);
}

module.exports = {
    createTransaction,
    getTransactionsByUser,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getSummaryByUser,
    getRecentTransactions
};