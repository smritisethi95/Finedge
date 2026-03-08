const Transaction = require('../models/transactionModel');
const Budget = require('../models/budgetModel');
const { toObjectId } = require('../utils/mongoHelper');

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
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const summary = await Transaction.aggregate([
    {
      $match: {
        userId: toObjectId(userId),
        date: {
          $gte: startOfMonth,
          $lt: endOfMonth
        }
      }
    },
    {
      $group: {
        _id: "$type",
        total: { $sum: "$amount" }
      }
    }
  ]);

  const result = {
    totalIncome: 0,
    totalExpense: 0
  };

  summary.forEach((item) => {
    if (item._id === "income") {
      result.totalIncome = item.total;
    }

    if (item._id === "expense") {
      result.totalExpense = item.total;
    }
  });

  const balance = result.totalIncome - result.totalExpense;

  const budget = await Budget.findOne({ userId });

  let monthlyGoal = 0;
  let savingsTarget = 0;
  let remainingBudget = 0;

  if (budget) {
    monthlyGoal = budget.monthlyGoal;
    savingsTarget = budget.savingsTarget;
    remainingBudget = monthlyGoal - result.totalExpense;
  }

  const budgetStatus =
    remainingBudget < 0 ? "OVER_BUDGET" : "WITHIN_BUDGET";

  return {
    month: now.toLocaleString("default", { month: "long" }),
    totalIncome: result.totalIncome,
    totalExpense: result.totalExpense,
    balance,
    monthlyGoal,
    savingsTarget,
    remainingBudget,
    budgetStatus
  };
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