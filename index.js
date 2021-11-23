const connectToMongo = require('./dbConfig');
const express = require('express')

connectToMongo();

const app = express()
const port = process.env.PORT || 4000;

app.use(express.json());    

//Availabel routes
app.get('/', (req, res) => {
    res.send('Hello World!')
})

//Task 1 -- File System
app.use('/api/file/', require('./routes/fileOps'));

//Task 2 -- Hall Booking API
app.use('/api/hall-booking-api/', require('./routes/hallBooking'));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

