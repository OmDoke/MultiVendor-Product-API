const Seller = require('../models/Seller');
const Product = require('../models/Product');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { generateProductPdf } = require('../utils/pdfGenerator');

const sellerLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const seller = await Seller.findOne({ email });
        if (!seller || !(await seller.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const accessToken = jwt.sign(
            { id: seller._id, role: 'seller' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                accessToken,
                role: 'seller'
            }
        });
    } catch (error) {
        next(error);
    }
};

const createProduct = async (req, res, next) => {
    try {
        const { productName, productDescription } = req.body;
        let { brands } = req.body;

        // Parse brands if it's sent as a string (common with multipart/form-data)
        if (typeof brands === 'string') {
            brands = JSON.parse(brands);
        }

        if (!brands || !Array.isArray(brands) || brands.length === 0) {
            return res.status(422).json({
                success: false,
                message: 'Validation Error',
                errors: [{ msg: 'Brands array must contain at least one brand' }]
            });
        }

        // Handle uploaded images
        const files = req.files || []; // Expected to be array from upload.any() or upload.fields()
        
        // Match images to brands. 
        // Requirements say: brands[0][image], brands[1][image]
        // In multer with upload.any(), we might need to find files by fieldname
        brands = brands.map((brand, index) => {
            const fieldName = `brands[${index}][image]`;
            const file = files.find(f => f.fieldname === fieldName);
            if (!file) {
                throw new Error(`Image for brand at index ${index} is required`);
            }
            return {
                ...brand,
                image: file.filename
            };
        });

        const product = await Product.create({
            sellerId: req.user.id,
            productName,
            productDescription,
            brands
        });

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        // If error occurs, cleanup uploaded files
        if (req.files) {
            req.files.forEach(file => {
                const filePath = path.join(__dirname, '../uploads', file.filename);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
        }
        
        if (error.message.includes('is required')) {
             return res.status(422).json({
                success: false,
                message: 'Validation Error',
                errors: [{ msg: error.message }]
            });
        }
        next(error);
    }
};

const getProducts = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const products = await Product.find({ sellerId: req.user.id })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments({ sellerId: req.user.id });

        const dataWithPdfUrl = products.map(product => {
            const productObj = product.toObject();
            return {
                ...productObj,
                viewPdfUrl: `/api/seller/products/${product._id}/pdf`
            };
        });

        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: {
                data: dataWithPdfUrl,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
};

const getProductPdf = async (req, res, next) => {
    try {
        const product = await Product.findOne({
            _id: req.params.id,
            sellerId: req.user.id
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or access denied'
            });
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=product-${product._id}.pdf`);

        generateProductPdf(product, res);
    } catch (error) {
        next(error);
    }
};

const deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        if (product.sellerId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You can only delete your own products.'
            });
        }

        // Delete associated images from disk
        product.brands.forEach(brand => {
            const filePath = path.join(__dirname, '../uploads', brand.image);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            message: 'Product and associated images deleted successfully'
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sellerLogin,
    createProduct,
    getProducts,
    getProductPdf,
    deleteProduct
};
