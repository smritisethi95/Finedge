const Transaction = require('../models/transactionModel');
const mongoose = require('mongoose');

async function getSpendingRecommendations(userId) {
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // Current month expenses by category
    const currentExpenses = await Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'expense', date: { $gte: currentMonthStart } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    // Last month expenses by category
    const lastMonthExpenses = await Transaction.aggregate([
        { $match: { userId: userObjectId, type: 'expense', date: { $gte: lastMonthStart, $lte: lastMonthEnd } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    const lastMonthMap = {};
    lastMonthExpenses.forEach(exp => { lastMonthMap[exp._id] = exp.total; });

    const recommendations = [];

    currentExpenses.forEach(curr => {
        const category = curr._id;
        const currentTotal = curr.total;
        const lastTotal = lastMonthMap[category] || 0;

        if (lastTotal > 0) {
            const increasePercent = ((currentTotal - lastTotal) / lastTotal) * 100;
            if (increasePercent > 15) {
                recommendations.push({
                    category,
                    currentSpending: currentTotal,
                    lastMonthSpending: lastTotal,
                    message: `Your ${category} spending increased by ${increasePercent.toFixed(1)}%. Consider reducing to $${lastTotal.toFixed(2)}.`
                });
            }
        }
    });

    // Check if user has any income this month
    const income = await Transaction.findOne({ userId: userObjectId, type: 'income', date: { $gte: currentMonthStart } });
    if (!income) {
        recommendations.push({
            category: 'Income',
            message: 'No income recorded this month. Add your income to track savings better.'
        });
    }

    return recommendations.length > 0 ? recommendations : [{ message: 'Great job! Your spending is under control.' }];
}

module.exports = { getSpendingRecommendations };