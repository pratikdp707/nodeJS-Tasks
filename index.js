const connectToMongo = require('./dbConfig');
const express = require('express')

connectToMongo();

const app = express()
const port = 4000

app.use(express.json());    

//Availabel routes
app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use('/api/file/', require('./routes/fileOps'));
app.use('/api/hall-booking-api/', require('./routes/hallBooking'));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

