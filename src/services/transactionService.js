const Transaction = require('../models/transactionModel');

// Create a new transaction
async function createTransaction(transactionData) {
    const transaction = new Transaction(transactionData);
    return await transaction.save();
}

// Get all transactions for a user
async function getTransactionsByUser(userId) {
    return await Transaction.find({ userId });
}

// Get a specific transaction by ID for a user
async function getTransactionById(userId, transactionId) {
    return await Transaction.findOne({ _id: transactionId, userId });
}

// Update a transaction for a user
async function updateTransaction(userId, transactionId, updateData) {
    return await Transaction.findOneAndUpdate(
        { _id: transactionId, userId },
        updateData,
        { new: true }
    );
}

// Delete a transaction for a user
async function deleteTransaction(userId, transactionId) {
    return await Transaction.findOneAndDelete({ _id: transactionId, userId });
}

async function getSummaryByUser(userId) {
    const summary = await Transaction.aggregate([
        { $match: { userId: typeof userId === 'string' ? require('mongoose').Types.ObjectId(userId) : userId } },
        {
            $group: {
                _id: "$type",
                total: { $sum: "$amount" }
            }
        }
    ]);
    // Format result as { income: X, expense: Y }
    const result = { income: 0, expense: 0 };
    summary.forEach(item => {
        result[item._id] = item.total;
    });
    return result;
}

module.exports = {
    createTransaction,
    getTransactionsByUser,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getSummaryByUser
};
