const { StatusCodes } = require('http-status-codes');

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.orginalUrl}`);
    res.status(StatusCodes.NOT_FOUND);
    next(error);
};

const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    if (err.name === 'ValidationError') {
        statusCode = StatusCodes.BAD_REQUEST;
        message = Object.values(err.errors)
            .map((item) => item.message)
            .join(', ');
    }

    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = StatusCodes.NOT_FOUND;
        message = `Resource not found with id: ${err.value}.`;
    }

    if (err.code && err.code === 11000) {
        statusCode = StatusCodes.BAD_REQUEST;
        message = `Duplicate value entered for ${Object.keys(
            err.keyValue
        )} field, please choose another value.`;
    }

    res.status(statusCode).json({
        message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    notFound,
    errorHandler,
};
