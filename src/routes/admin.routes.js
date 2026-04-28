const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { adminLogin, createSeller, getSellers } = require('../controllers/admin.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth');
const validate = require('../middlewares/validator');

// POST /api/admin/login
router.post('/login', [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], adminLogin);

// POST /api/admin/sellers (Protected: Admin only)
router.post('/sellers', [
    verifyToken,
    isAdmin,
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Enter a valid email'),
    body('mobile').notEmpty().withMessage('Mobile number is required'),
    body('country').notEmpty().withMessage('Country is required'),
    body('state').notEmpty().withMessage('State is required'),
    body('skills').isArray({ min: 1 }).withMessage('Skills must be an array with at least one value'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    validate
], createSeller);

// GET /api/admin/sellers (Protected: Admin only)
router.get('/sellers', [verifyToken, isAdmin], getSellers);

module.exports = router;
