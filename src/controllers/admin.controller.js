const Admin = require('../models/Admin');
const Seller = require('../models/Seller');
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });
        if (!admin || !(await admin.comparePassword(password))) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        const token = jwt.sign(
            { id: admin._id, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                role: 'admin'
            }
        });
    } catch (error) {
        next(error);
    }
};

const createSeller = async (req, res, next) => {
    try {
        const { name, email, mobile, country, state, skills, password } = req.body;

        const existingSeller = await Seller.findOne({ email });
        if (existingSeller) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists'
            });
        }

        const seller = await Seller.create({
            name,
            email,
            mobile,
            country,
            state,
            skills,
            password
        });

        const sellerResponse = seller.toObject();
        delete sellerResponse.password;

        res.status(201).json({
            success: true,
            message: 'Seller created successfully',
            data: sellerResponse
        });
    } catch (error) {
        next(error);
    }
};

const getSellers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const sellers = await Seller.find()
            .select('-password')
            .skip(skip)
            .limit(limit);

        const total = await Seller.countDocuments();

        res.status(200).json({
            success: true,
            message: 'Sellers fetched successfully',
            data: {
                data: sellers,
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

module.exports = {
    adminLogin,
    createSeller,
    getSellers
};
