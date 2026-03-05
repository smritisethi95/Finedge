const User = require('../models/userModel');

class UserService {
    async registerUser(userData) {
        const { name, email, password } = userData;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error('User already exists');
            error.statusCode = 400
            throw error;
        }

        const user = await User.create({ name, email, password });

        const userObject = user.toObject();
        delete userObject.password;

        return userObject;
    }

    async loginUser(email, password) {
        const user = await User.findOne({ email });
        if (!user) {
            const error = new Error('Invalid credentials');
            error.statusCode = 401;
            throw error;
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            const error = new Error('inavlid password');
            error.statusCode = 401;
            throw error;
        }

        const userObject = user.toObject();
        delete userObject.password;

        return userObject;
    }

    async getUserById(userId) {
        const user = await User.findById(userId).select('-password');
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }

        return user;
    }
    async getAllUsers() {
        const users = await User.find().select('-password');
        return users;
    }
}

module.exports = new UserService();