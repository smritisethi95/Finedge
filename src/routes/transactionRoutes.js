const express = require('express');
const router = express.Router();

const transactionController = require('./../controllers/transactionController');
const { validateRequest } = require('../middleware/validateRequest');
const { validateJWT } = require('../middleware/authMiddleware');
const { transactionCreateSchema, transactionUpdateSchema } = require('../schemas/transactionSchema');


router.use(validateJWT);

router.post('/', validateRequest(transactionCreateSchema), transactionController.createTransaction);
router.get('/', transactionController.getTransactionsByUser);
// AI/Automation endpoints - MUST come before /:transactionId
router.get('/summary', transactionController.getSummary);
router.get('/recommendations', transactionController.getRecommendations);
router.get('/recent', transactionController.getRecentTransactions);

// Dynamic route MUST be last
router.get('/:transactionId', transactionController.getTransactionById);
router.patch('/:transactionId', validateRequest(transactionUpdateSchema), transactionController.updateTransaction);
router.delete('/:transactionId', transactionController.deleteTransaction);

module.exports = router;
