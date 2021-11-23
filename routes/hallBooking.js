const express = require('express');
const app = express();
const router = express.Router();
app.use(express.json());

//Rooms Data
let rooms = [{
    id: "A-1",
    name: "Deluxe",
    amenities: ['Wi-Fi', 'Fully air conditioned'],
    totalCapacity: 500,
    pricePerHour: 1000,
    bookingDetails: [{
        customerName: "Pratik",
        date: new Date('2021-11-23'),
        startTime: '07:00',
        endTime: '21:00',
        status: 'Confirmed'
    }]
},
{
    id: "A-2",
    name: "Super Deluxe",
    amenities: ['Wi-Fi', 'Fully air conditioned', 'Projector Screen', 'Recliners'],
    totalCapacity: 700,
    pricePerHour: 1700,
    bookingDetails: [{
        customerName: "Prateek",
        date: new Date('2021-11-24'),
        startTime: '07:00',
        endTime: '21:00',
        status: 'Confirmed'
    }]
}]

// list all the rooms - /api/hall-booking-api/getAllRooms
router.get('/getAllRooms', (req, res) => {
    res.send(rooms);
})


// create a new room - /api/hall-booking-api/createRoom
router.post('/createRoom', (req, res) => {
    let id = 'A-' + (rooms.length + 1);
    try {
        rooms.push({ id, ...req.body });
        res.send({
            status: "OK",
            message: "Room Created Successfully"
        })
    } catch (error) {
        console.log("Internal server error occured");
    }
})


//booking a room - /api/hall-boooking-api/bookRoom/:id
router.post('/bookRoom/:id', (req, res) => {
    let flagID = 0;

    console.log(req.params.id);

    try {
        rooms.forEach((element, index) => {
            console.log(element.id)
            if (element.id === req.params.id) {
                flagID = index;
            }
        });
        if (flagID === 0) {
            res.status(400).send({ message: "Invalid Room ID" })
        } else {
            let customerDetails = {
                customerName: req.body.customerName,
                date: new Date(req.body.date),
                startTime: req.body.startTime,
                endTime: req.body.endTime,
                status: 'Confirmed'
            }
            let bookingStatus = 0;
            rooms[flagID].bookingDetails.forEach((customer) => {
                console.log(customer);
                if (customer.date.getTime() === customerDetails.date.getTime()) {
                    if (Number(customerDetails.startTime.substring(0, 2)) >= Number(customer.endTime.substring(0, 2))
                        || Number(customerDetails.endTime.substring(0, 2)) <= Number(customer.startTime.substring(0, 2))) {
                        bookingStatus = 1;
                    } else {
                        bookingStatus = 0;
                    }
                } else {
                    bookingStatus = 0;
                }
            })

            if (bookingStatus === 1) {
                rooms[flagID].bookingDetails.push(customerDetails);
                res.status(200).send("Room Booked Successfully");
            } else {
                res.status(200).send("Please select a different time slot");
            }
        }

    } catch (error) {
        res.status(400).send("Internal server error occured");
    }

})


//List all customer - api/hall-booking-api/getCustomers
router.get('/getCustomers', (req, res) => {
    let customers = [];
    try {

        rooms.forEach(room => {
            let customerObject = {
                roomID: room.id
            }
            room.bookingDetails.forEach(customer => {
                customerObject.customerName = customer.customerName;
                customerObject.date = customer.date;
                customerObject.startTime = customer.startTime;
                customerObject.endTime = customer.endTime;

                customers.push(customerObject);
            })
        })

        res.status(400).send(customers);
    } catch (error) {
        res.status(400).send("Internal Server error occured");
    }


})

module.exports = router;