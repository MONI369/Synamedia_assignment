const express = require('express');
const { validationResult } = require('express-validator');
const {
    bookRoom,
    getBookingDetails,
    getAllGuests,
    cancelBooking,
    modifyBooking,
} = require('../services/hotelBookingService');
const {
    bookingValidations,
    emailValidation,
    cancelBookingValidations,
    modifyBookingValidations,
} = require('../validations/bookingValidations');

const router = express.Router();

// Middleware to handle validation errors
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// Book a room
router.post('/', bookingValidations, validate, bookRoom);

// View booking details
router.get('/:email', emailValidation, validate, getBookingDetails);

// View all guests
router.get('/', getAllGuests);

// Cancel a booking
router.delete('/', cancelBookingValidations, validate, cancelBooking);

// Modify a booking
router.put('/', modifyBookingValidations, validate, modifyBooking);

module.exports = router;
