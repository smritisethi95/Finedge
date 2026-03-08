const budgetService = require('../services/budgetService');
const { getUserIdFromReq } = require('../utils/requestHelper');
const { EntityAlreadyExistError } = require('../errors/entityError');

const createBudget = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);
    const { monthlyGoal, savingsTarget } = req.body;
    const budgetPayload = {
        monthlyGoal: monthlyGoal,
        savingsTarget: savingsTarget,
        userId: userId
    };
    const budgets = await budgetService.retrieveBudgets(userId);

    if(budgets.length > 0) {
        throw new EntityAlreadyExistError();
    }

    const budget = await budgetService.createBudget(budgetPayload);
    res.status(201).json(budget);
  } catch (error) {
    next(error);
  }
};

const retrieveBudgets = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);
    const budgets = await budgetService.retrieveBudgets(userId);
    res.status(200).json(budgets);
  } catch (error) {
    next(error);
  }
};

const updateBudget = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);
    const { monthlyGoal, savingsTarget } = req.body;
    const budgetPayload = {
        monthlyGoal: monthlyGoal,
        savingsTarget: savingsTarget,
        userId: userId
    };
    const updatedBudget = await budgetService.updateBudget(
      userId,
      req.params.id,
      budgetPayload
    );

    if (!updatedBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json(updatedBudget);
  } catch (error) {
    next(error);
  }
};

const deleteBudget = async (req, res, next) => {
  try {
    const userId = getUserIdFromReq(req);
    const deletedBudget = await budgetService.deleteBudget(userId, req.params.id);

    if (!deletedBudget) {
      return res.status(404).json({ message: "Budget not found" });
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    next(error);
  }
};


module.exports = {
    createBudget,
    retrieveBudgets,
    updateBudget,
    deleteBudget
};