const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budgetController');
const { budgetSchema } = require('../schemas/budgetSchema');
const { validateRequest } = require('../middleware/validateRequest'); 
const { validateJWT } = require('../middleware/authMiddleware');

router.use(validateJWT);

router.post('/', validateRequest(budgetSchema), budgetController.createBudget);
router.get('/', budgetController.retrieveBudgets);
router.put('/:id', validateRequest(budgetSchema), budgetController.updateBudget);
router.delete('/:id', budgetController.deleteBudget);


module.exports = router;