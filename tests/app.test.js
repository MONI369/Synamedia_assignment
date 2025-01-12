const request = require('supertest');
const app = require('../src/app');
let { bookings:localBookings, rooms:localRooms } = require('../src/services/hotelBookingService'); // Import in-memory data
let server;

beforeAll(() => {
    return new Promise((resolve, reject) => {
        const PORT = 3002;
        server = app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
            resolve();
        }).on('error', reject); 
    });
});

afterAll(() => {
    if (server) {
        server.close(); // Clean up the server after tests
    }
});

beforeEach(() => {
    jest.setTimeout(10000);

    // Reset local data before each test
    localBookings = [];
    localRooms = [];
    bookings=[];

    // Fill rooms with data if necessary
    for (let i = 1; i <= 10; i++) {
        localRooms[i - 1] = i;
    }
});

describe('Hotel Room Booking System APIs', () => {
    // Test cases for Booking Room API
    describe('POST /api/v1/booking', () => {
        test('should successfully book a room', async () => {
            const response = await request(app)
                .post('/api/v1/booking')
                .send({
                    name: 'Monika M',
                    email: 'monika@gmail.com',
                    checkInDate: '2025-01-12',
                    checkOutDate: '2025-01-13',
                });
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe('Room booked successfully');
            expect(response.body.details).toMatchObject({
                name: 'Monika M',
                email: 'monika@gmail.com',
                roomNumber: expect.any(Number),
                checkInDate: '2025-01-12',
                checkOutDate: '2025-01-13',
            });
        });

        // test('should return error when no rooms are available', async () => {
        //     // Fill all rooms
        //     for (let i = 1; i <= 10; i++) {
        //         localBookings.push({
        //             name: `User ${i}`,
        //             email: `user${i}@example.com`,
        //             roomNumber: i,
        //             checkInDate: '2025-01-12',
        //             checkOutDate: '2025-01-13',
        //         });
        //     }

        //     const response = await request(app)
        //         .post('/api/v1/booking')
        //         .send({
        //             name: 'New User',
        //             email: 'newuser@example.com',
        //             checkInDate: '2025-01-12',
        //             checkOutDate: '2025-01-13',
        //         });

        //     expect(response.statusCode).toBe(400);
        //     expect(response.body.message).toBe('No rooms available for the requested dates');
        // });

        // test('should return error for duplicate booking for the same email and overlapping dates', async () => {
        //     localBookings.push({
        //         name: 'Monika M',
        //         email: 'monika@gmail.com',
        //         roomNumber: 1,
        //         checkInDate: '2025-01-12',
        //         checkOutDate: '2025-01-13',
        //     });

        //     const response = await request(app)
        //         .post('/api/v1/booking')
        //         .send({
        //             name: 'Monika M',
        //             email: 'monika@gmail.com',
        //             checkInDate: '2025-01-12',
        //             checkOutDate: '2025-01-13',
        //         });

        //     expect(response.statusCode).toBe(400);
        //     expect(response.body.message).toBe('User already has a booking during the requested dates');
        // });

        test('should return validation errors for missing fields', async () => {
            const response = await request(app)
                .post('/api/v1/booking')
                .send({
                    email: 'monika@gmail.com',
                    checkInDate: '2025-01-12',
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.errors).toEqual(
                expect.arrayContaining([
                    {"location": "body", "msg": "Name is required", "path": "name", "type": "field"}, 
                    {"location": "body", "msg": "Name must be a string", "path": "name", "type": "field"}, 
                    {"location": "body", "msg": "Check-out date is required", "path": "checkOutDate", "type": "field"}, 
                    {"location": "body", "msg": "Check-out date must be a valid ISO8601 date", "path": "checkOutDate", "type": "field"},
                ])
            );
        });
    });

    // Test cases for View Booking Details API
    describe('GET /api/v1/booking/:email', () => {
        test('should retrieve booking details for an email', async () => {
            localBookings.push({
                name: 'Monika M',
                email: 'monika@gmail.com',
                roomNumber: 1,
                checkInDate: '2025-01-12',
                checkOutDate: '2025-01-13',
            });

            const response = await request(app).get('/api/v1/booking/monika@gmail.com');

            expect(response.statusCode).toBe(200);
            expect(response.body.details).toHaveLength(1);
            expect(response.body.details[0]).toMatchObject({
                email: 'monika@gmail.com',
                roomNumber: expect.any(Number),
                checkInDate: '2025-01-12',
                checkOutDate: '2025-01-13',
            });
        });

        test('should return error when no booking is found for the email', async () => {
            const response = await request(app).get('/api/v1/booking/nonexistent@example.com');

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('No booking found for this email');
        });
    });

    // Test cases for View All Guests API
    describe('GET /api/v1/booking', () => {
        test('should retrieve a list of all current guests', async () => {
            localBookings.push(
                {
                    name: 'Monika M',
                    email: 'monika@gmail.com',
                    roomNumber: 1,
                    checkInDate: '2025-01-12',
                    checkOutDate: '2025-01-13',
                },
                {
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    roomNumber: 2,
                    checkInDate: '2025-01-12',
                    checkOutDate: '2025-01-13',
                }
            );

            const response = await request(app).get('/api/v1/booking');

            expect(response.statusCode).toBe(200);
            // expect(response.body).toHaveLength(2);
            // expect(response.body).toEqual(
            //     expect.arrayContaining([
            //         { name: 'Monika M', roomNumber: 1 },
            //         { name: 'Jane Smith', roomNumber: 2 },
            //     ])
            // );
        });
    });

    // Test cases for Cancel Booking API
    describe('DELETE /api/v1/booking', () => {
        test('should successfully cancel a booking', async () => {
            localBookings.push({
                name: 'Monika M',
                email: 'monika@gmail.com',
                roomNumber: 1,
                checkInDate: '2025-01-12',
                checkOutDate: '2025-01-13',
            });

            const response = await request(app)
                .delete('/api/v1/booking')
                .send({
                    email: 'monika@gmail.com',
                    roomNumber: 1,
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Booking canceled successfully');
            expect(localBookings).toHaveLength(0);
        });

        test('should return error when attempting to cancel a nonexistent booking', async () => {
            const response = await request(app)
                .delete('/api/v1/booking')
                .send({
                    email: 'nonexistent@example.com',
                    roomNumber: 1,
                });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Booking not found');
        });
    });

    // Test cases for Modify Booking API
    describe('PUT /api/v1/booking', () => {
        test('should modify booking when the current room is available', async () => {
            localBookings.push({
                name: 'Monika M',
                email: 'monika@gmail.com',
                roomNumber: 1,
                checkInDate: '2025-01-12',
                checkOutDate: '2025-01-13',
            });

            const response = await request(app)
                .put('/api/v1/booking')
                .send({
                    email: 'monika@gmail.com',
                    checkInDate: '2025-01-14',
                    checkOutDate: '2025-01-15',
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Booking updated successfully');
            expect(response.body.booking).toMatchObject({
                email: 'monika@gmail.com',
                roomNumber: 1,
                checkInDate: '2025-01-14',
                checkOutDate: '2025-01-15',
            });
        });

        test('should modify booking and assign a new room when current room is unavailable', async () => {
            localBookings.push(
                {
                    name: 'Monika M',
                    email: 'monika@gmail.com',
                    roomNumber: 1,
                    checkInDate: '2025-01-12',
                    checkOutDate: '2025-01-13',
                },
                {
                    name: 'Another User',
                    email: 'another@example.com',
                    roomNumber: 1,
                    checkInDate: '2025-01-14',
                    checkOutDate: '2025-01-15',
                }
            );

            const response = await request(app)
                .put('/api/v1/booking')
                .send({
                    email: 'monika@gmail.com',
                    checkInDate: '2025-01-14',
                    checkOutDate: '2025-01-15',
                });

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Booking updated successfully');
            expect(response.body.booking).toMatchObject({
                email: 'monika@gmail.com',
                roomNumber: expect.any(Number),
                checkInDate: '2025-01-14',
                checkOutDate: '2025-01-15',
            });
            expect(response.body.booking.roomNumber).not.toBe(1);
        });

        test('should return error when no rooms are available', async () => {
            for (let i = 1; i <= 10; i++) {
                localBookings.push({
                    name: `User ${i}`,
                    email: `user${i}@example.com`,
                    roomNumber: i,
                    checkInDate: '2025-01-14',
                    checkOutDate: '2025-01-15',
                });
            }

            const response = await request(app)
                .put('/api/v1/booking')
                .send({
                    email: 'monika@gmail.com',
                    checkInDate: '2025-01-14',
                    checkOutDate: '2025-01-15',
                });

            expect(response.statusCode).toBe(400);
            expect(response.body.message).toBe('No rooms available for the requested dates');
        });
    });
});
