const express = require('express');
const router = express.Router();
const userController = require('./../controllers/userController');
const { validateUserRegistration, validateUserLogin } = require('../middleware/validator');


router.post('/', validateUserRegistration, userController.register);
router.post('/login', validateUserLogin, userController.login);
router.get('/:id', userController.getUserById);
router.get('/', userController.getAllUsers);

module.exports = router;