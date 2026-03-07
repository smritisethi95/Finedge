const express = require('express');
const router = express.Router();

const transactionController = require('./../controllers/transactionController');

const {validateTransaction} = require('../middleware/validateTransaction');
const requireUserId = require('../middleware/requireUserId');

// apply header check for all routes in this router
router.use(requireUserId);

router.post('/', validateTransaction, transactionController.createTransaction);
router.get('/', transactionController.getTransactionsByUser);
router.get('/summary', transactionController.getSummary);
router.get('/:transactionId', transactionController.getTransactionById);
router.patch('/:transactionId', validateTransaction, transactionController.updateTransaction);
router.delete('/:transactionId', transactionController.deleteTransaction);


module.exports = router;
