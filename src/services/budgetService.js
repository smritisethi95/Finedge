const Budget = require('../models/budgetModel');
const { toObjectId } = require('../utils/mongoHelper');

const createBudget = async (data) => {
  return await Budget.create(data);
};

const retrieveBudgets = async (userId) => {
  return await Budget.find({ userId: toObjectId(userId) });
};

const updateBudget = async (userId, budgetId, data) => {
  return await Budget.findOneAndUpdate(
        { _id: budgetId, userId: toObjectId(userId) },
        data,
        { new: true, runValidators: true }
    );
};

const deleteBudget = async (userId, budgetId) => {
  return await Budget.findOneAndDelete({ _id: budgetId, userId: toObjectId(userId) });
};


module.exports = {
    createBudget,
    retrieveBudgets,
    updateBudget,
    deleteBudget
};