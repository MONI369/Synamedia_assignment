const { body, param } = require('express-validator');

const bookingValidations = [
    body('name')
        .exists().withMessage('Name is required')
        .isString().withMessage('Name must be a string'),
    body('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),
    body('checkInDate')
        .exists().withMessage('Check-in date is required')
        .isISO8601().withMessage('Check-in date must be a valid ISO8601 date'),
    body('checkOutDate')
        .exists().withMessage('Check-out date is required')
        .isISO8601().withMessage('Check-out date must be a valid ISO8601 date')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.checkInDate)) {
                throw new Error('Check-out date must be after check-in date');
            }
            return true;
        }),
];

const emailValidation = [
    param('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),
];

const cancelBookingValidations = [
    body('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),
    body('roomNumber')
        .exists().withMessage('Room number is required')
        .isInt({ min: 1 }).withMessage('Room number must be a valid integer'),
];

const modifyBookingValidations = [
    body('email')
        .exists().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid'),
    body('checkInDate')
        .exists().withMessage('Check-in date is required')
        .isISO8601().withMessage('Check-in date must be a valid ISO8601 date'),
    body('checkOutDate')
        .exists().withMessage('Check-out date is required')
        .isISO8601().withMessage('Check-out date must be a valid ISO8601 date')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.checkInDate)) {
                throw new Error('Check-out date must be after check-in date');
            }
            return true;
        }),
];

module.exports = {
    bookingValidations,
    emailValidation,
    cancelBookingValidations,
    modifyBookingValidations,
};
