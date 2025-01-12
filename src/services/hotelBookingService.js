let bookings = [];
let rooms = Array.from({ length: 10 }, (_, i) => i + 1); // Room numbers from 1 to 10

// Utility to check room availability
const isRoomAvailable = (roomNumber, checkInDate, checkOutDate) => {
    return !bookings.some(booking => 
        booking.roomNumber === roomNumber &&
        (
            (new Date(checkInDate) < new Date(booking.checkOutDate) && 
             new Date(checkOutDate) > new Date(booking.checkInDate)) // Overlap condition
        )
    );
};

// Book a room
const bookRoom = (req, res) => {
    const { name, email, checkInDate, checkOutDate } = req.body;

    // Find an available room for the requested dates
    const availableRoom = rooms.find(roomNumber => 
        isRoomAvailable(roomNumber, checkInDate, checkOutDate)
    );

    if (!availableRoom) {
        return res.status(400).json({ message: 'No rooms available for the requested dates' });
    }

    // Save booking details
    const booking = {
        name,
        email,
        roomNumber: availableRoom,
        checkInDate,
        checkOutDate
    };
    bookings.push(booking);
    // console.log("bookings after bookRoom:",bookings);
    res.status(201).json({ message: 'Room booked successfully', details:booking });
};

// View booking details
const getBookingDetails = (req, res) => {
    const { email } = req.params;
    const userBookings = bookings.filter(booking => booking.email === email);
    // console.log("userBookings:",userBookings)
    if (!(userBookings.length>0)) {
        return res.status(404).json({ message: 'No booking found for this email' });
    }
    res.status(200).json({details:userBookings});
};

// View all guests
const getAllGuests = (req, res) => {
    const currentGuests = bookings.map(({ name, roomNumber }) => ({ name, roomNumber }));
    res.status(200).json({details:currentGuests});
};

// Cancel a booking
const cancelBooking = (req, res) => {
    const { email, roomNumber } = req.body;
    const bookingIndex = bookings.findIndex(b => b.email === email && b.roomNumber === roomNumber);

    if (bookingIndex === -1) {
        return res.status(404).json({ message: 'Booking not found' });
    }

    // Free the room
    const room = rooms.find(r => r.roomNumber === roomNumber);
    if (room) room.isBooked = false;

    // Remove the booking
    bookings.splice(bookingIndex, 1);
    // console.log("bookings after cancel:",bookings);
    res.status(200).json({ message: 'Booking canceled successfully' });
};

// Modify a booking
const modifyBooking = (req, res) => {
    const { email, checkInDate, checkOutDate } = req.body;

    // Find the user's existing booking
    const bookingIndex = bookings.findIndex(booking => booking.email === email);

    if (bookingIndex === -1) {
        return res.status(404).json({ message: 'Booking not found for this email' });
    }

    const existingBooking = bookings[bookingIndex];

    // Check if the current room is available for the new dates
    const isCurrentRoomAvailable = !bookings.some(booking =>
        booking.roomNumber === existingBooking.roomNumber &&
        booking.email !== email && // Ignore the user's current booking
        (
            (new Date(checkInDate) < new Date(booking.checkOutDate) &&
             new Date(checkOutDate) > new Date(booking.checkInDate)) // Overlap condition
        )
    );

    if (isCurrentRoomAvailable) {
        // Update booking details with the current room
        bookings[bookingIndex].checkInDate = checkInDate;
        bookings[bookingIndex].checkOutDate = checkOutDate;

        return res.status(200).json({
            message: 'Booking updated successfully',
            details: bookings[bookingIndex],
        });
    }

    // Find another available room
    const availableRoom = rooms.find(roomNumber =>
        !bookings.some(booking =>
            booking.roomNumber === roomNumber &&
            (
                (new Date(checkInDate) < new Date(booking.checkOutDate) &&
                 new Date(checkOutDate) > new Date(booking.checkInDate)) // Overlap condition
            )
        )
    );

    if (!availableRoom) {
        return res.status(400).json({
            message: 'No rooms available for the requested dates',
        });
    }

    // Assign the new room and update booking details
    bookings[bookingIndex].roomNumber = availableRoom;
    bookings[bookingIndex].checkInDate = checkInDate;
    bookings[bookingIndex].checkOutDate = checkOutDate;
    // console.log("bookings after modification:",bookings);
    res.status(200).json({
        message: 'Booking updated successfully with a new room',
        details: bookings[bookingIndex],
    });
};


module.exports = { bookRoom, getBookingDetails, getAllGuests, cancelBooking, modifyBooking };
