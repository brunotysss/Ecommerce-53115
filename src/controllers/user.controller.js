import UserService from '../services/user.service.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import config from '../config/index.js';
import EmailService from '../services/email.service.js';
import crypto from 'crypto';

const { jwtSecret, refreshTokenSecret } = config;

const register = async (req, res) => {
    try {
        const { first_name, last_name, email, age, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await UserService.createUser({
            first_name,
            last_name,
            email,
            age,
            password: hashedPassword
        });

        if (req.headers['x-postman']) {
            return res.status(201).json(user);
        }

        res.redirect('/login');
    } catch (error) {
        res.status(500).json({ error: 'Failed to register user', details: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserService.getUserByEmail(email);
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '15m' });
        const refreshToken = jwt.sign({ id: user._id, role: user.role }, refreshTokenSecret, { expiresIn: '7d' });

        user.refreshTokens.push(refreshToken);
        await user.save();

        res.cookie('jwt', token, { httpOnly: true, secure: true });
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        res.redirect('/products');
    } catch (error) {
        res.status(500).json({ error: 'Failed to login', details: error.message });
    }
};

const refreshToken = async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.status(401).json({ error: 'Access denied' });

    try {
        const decoded = jwt.verify(refreshToken, refreshTokenSecret);
        const user = await UserService.getUserById(decoded.id);
        if (!user || !user.refreshTokens.includes(refreshToken)) return res.status(401).json({ error: 'Invalid refresh token' });

        const newToken = jwt.sign({ id: user._id, role: user.role }, jwtSecret, { expiresIn: '15m' });
        const newRefreshToken = jwt.sign({ id: user._id, role: user.role }, refreshTokenSecret, { expiresIn: '7d' });

        user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
        user.refreshTokens.push(newRefreshToken);
        await user.save();

        res.cookie('jwt', newToken, { httpOnly: true, secure: true });
        res.cookie('refreshToken', newRefreshToken, { httpOnly: true, secure: true });
        res.json({ message: 'Token refreshed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to refresh token', details: error.message });
    }
};

const logout = async (req, res) => {
    try {
        const { refreshToken } = req.cookies;
        const user = await UserService.getUserByRefreshToken(refreshToken);

        if (user) {
            user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
            await user.save();
        }

        res.clearCookie('jwt');
        res.clearCookie('refreshToken');
        res.json({ message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to logout', details: error.message });
    }
};

const uploadDocuments = async (req, res) => {
    try {
        const userId = req.params.uid;
        const files = req.files;

        const documents = [];
        if (files.profile) {
            documents.push({ name: 'profile', reference: files.profile[0].path });
        }
        if (files.product) {
            files.product.forEach(file => {
                documents.push({ name: 'product', reference: file.path });
            });
        }
        if (files.document) {
            files.document.forEach(file => {
                documents.push({ name: 'document', reference: file.path });
            });
        }

        const user = await UserService.addDocuments(userId, documents);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to upload documents', details: error.message });
    }
};

const upgradeToPremium = async (req, res) => {
    try {
        const userId = req.params.uid;
        const user = await UserService.upgradeToPremium(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found or missing documents' });
        }
        res.json({ message: 'User upgraded to premium', user });
    } catch (error) {
        res.status(500).json({ error: 'Failed to upgrade user', details: error.message });
    }
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await UserService.getUserByEmail(email);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetLink = `http://localhost:8081/reset-password?token=${resetToken}`;
        
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        await EmailService.sendResetPasswordEmail(user.email, resetLink);

        res.json({ message: 'Password reset link sent' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to request password reset', details: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await UserService.getUserByResetToken(token);

        if (!user || user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ error: 'Token is invalid or has expired' });
        }

        const isSamePassword = await bcrypt.compare(newPassword, user.password);
        if (isSamePassword) {
            return res.status(400).json({ error: 'New password cannot be the same as the old password' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password has been reset' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset password', details: error.message });
    }
};

const getCurrentUser = (req, res) => {
    res.json(req.user);
};

// Exportamos todas las funciones en un objeto
export default {
    register,
    login,
    refreshToken,
    logout,
    uploadDocuments,
    upgradeToPremium,
    forgotPassword,
    resetPassword,
    getCurrentUser
};
