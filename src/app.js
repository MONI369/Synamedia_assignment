const express = require('express');
const bookingRoutes = require('./routes/hotelRoomBookings');

const app = express();

app.use(express.json()); // For parsing JSON request bodies
app.use('/api/v1/booking', bookingRoutes); // Booking-related routes

app.get('/', (req, res) => {
    res.send('Welcome to the Hotel Room Booking System!');
});
// Start server on port 3000
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;
