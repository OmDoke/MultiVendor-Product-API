const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { 
    sellerLogin, 
    createProduct, 
    getProducts, 
    getProductPdf, 
    deleteProduct 
} = require('../controllers/seller.controller');
const { verifyToken, isSeller } = require('../middlewares/auth');
const validate = require('../middlewares/validator');
const upload = require('../middlewares/upload');

// POST /api/seller/login
router.post('/login', [
    body('email').isEmail().withMessage('Enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validate
], sellerLogin);

// POST /api/seller/products (Protected: Seller only)
router.post('/products', [
    verifyToken,
    isSeller,
    upload.any(), // Use any() to handle dynamic brand image field names
    body('productName').notEmpty().withMessage('Product Name is required'),
    body('productDescription').notEmpty().withMessage('Product Description is required'),
    // Brands array validation is handled inside controller due to multipart parsing complexity
    validate
], createProduct);

// GET /api/seller/products (Protected: Seller only)
router.get('/products', [verifyToken, isSeller], getProducts);

// GET /api/seller/products/:id/pdf (Protected: Seller only)
router.get('/products/:id/pdf', [verifyToken, isSeller], getProductPdf);

// DELETE /api/seller/products/:id (Protected: Seller only)
router.delete('/products/:id', [verifyToken, isSeller], deleteProduct);

module.exports = router;
