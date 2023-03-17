# Olive Hotel Management Backend
This is the hotel management software written using nodejs and express;

## Routes
- Rooms endpoints
- Bookings endpoints
- Authentication endpoints
- Payment endpoints

## Quick start
- Clone the project
- Run npm install or npm i or yarn install
- Make sure you have mongodb running in your system
- Start the server by running - npm run server

## Resources
Rooms:
- /rooms: Get a list of all rooms in the hotel
- /rooms/:roomId: Get details of a specific room
- /rooms/:roomId/bookings: Get a list of bookings for a specific room
- /rooms/:roomId/bookings/:bookingId: Get details of a specific booking for a specific room
- /rooms/:roomId/bookings: Create a new booking for a specific room
- /rooms/:roomId/bookings/:bookingId: Update or cancel a booking for a specific room

Guests:
- /guests: Get a list of all guests
- /guests/:guestId: Get details of a specific guest
- /guests: Create a new guest
- /guests/:guestId: Update or delete a specific guest

Bookings:
- /bookings: Get a list of all bookings
- /bookings/:bookingId: Get details of a specific booking
- /bookings: Create a new booking
- /bookings/:bookingId: Update or cancel a specific booking

Employees:
- /employees: Get a list of all employees
- /employees/:employeeId: Get details of a specific employee
- /employees: Create a new employee
- /employees/:employeeId: Update or delete a specific employee

Services:
- /services: Get a list of all services offered by the hotel
- /services/:serviceId: Get details of a specific service
- /services: Create a new service
- /services/:serviceId: Update or delete a specific service

Payments:
- /payments: Get a list of all payments
- /payments/:paymentId: Get details of a specific payment
- /payments: Create a new payment
- /payments/:paymentId: Update or cancel a specific payment