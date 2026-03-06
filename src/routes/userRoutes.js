const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const { registerSchema, loginSchema } = require('../schemas/userSchema');
const { validateRequest } = require('../middleware/validateRequest');


router.post('/', validateRequest(registerSchema), userController.register);
router.post('/login', validateRequest(loginSchema), userController.login);
router.get('/:id', userController.getUserById);
router.get('/', userController.getAllUsers);

module.exports = router;