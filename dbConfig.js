const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://root:root@cluster0.o1ehh.mongodb.net/NodeJSTask4DB?retryWrites=true&w=majority';

const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("Connected to mongo successfully!!!");
    })
}

connectToMongo();

module.exports = connectToMongo;