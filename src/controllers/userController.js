
const userService = require('../services/userService');

class UserController {
    async register(req, res, next) {
        try {
            const userData = req.body;
            const { user, token } = await userService.registerUser(userData);
            res.status(201).json({
                success: true,
                message: 'User registered succesfully',
                data: { user, token }
            })
        } catch (error) {
            next(error);
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body;
            const { user, token } = await userService.loginUser(email, password);
            res.status(200).json({
                success: true,
                message: 'user logged in successfully',
                data: { user, token }
            })
        } catch (error) {
            next(error);
        }
    }

    async getUserById(req, res, next) {
        try {
            const {id} = req.params;
            const user = await userService.getUserById(id);
            res.status(200).json({
                success: true,
                data: user
            })
        } catch (error) {
            next(error);
        }
    }

    async getAllUsers(req, res, next) {
        try {
            const user = await userService.getAllUsers();
            res.status(200).json({
                success: true,
                message: 'All users found',
                data: user
            })
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new UserController();