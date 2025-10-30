const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const { User } = require('../models');
const { StatusCodes } = require('http-status-codes');

const protect = asyncHandler(async (req, res, next) => {
    //const token = req.signedCookies.jwt;

    const token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select(
                '-password -__v'
            );
            next();
        } catch (error) {
            res.status(StatusCodes.UNAUTHORIZED);
            throw new Error('Not authorized. Invalid token.');
        }
    } else {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error('Not authorized. No token exists.');
    }
});

const admin = (req, res, next) => {
    if (req.user.account.role !== 'admin' && req.user.account.role !== 'superAdmin') {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error("You're unauthorized to access this route");
    }
    next();
};

const superAdmin = (req, res, next) => {
    console.log(req.user.account.role);
    if (req.user.account.role !== 'superAdmin') {
        res.status(StatusCodes.UNAUTHORIZED);
        throw new Error("You're unauthorized to access this route");
    }
    next();
};

module.exports = {
    protect,
    admin,
    superAdmin,
};
