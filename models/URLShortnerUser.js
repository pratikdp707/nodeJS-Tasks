const mongoose = require('mongoose');

const {Schema} = mongoose;

const URLUserSchema = new Schema({
    name:{
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type: String,
        required : true
    },
    timestamp : {
        type : Date,
        default : Date.now
    }
});

const URLUser = mongoose.model('urlshortnerusers', URLUserSchema);
URLUser.createIndexes(() => {
    console.log("created Index");
});
module.exports = URLUser;