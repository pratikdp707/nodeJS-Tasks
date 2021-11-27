const express = require('express');
const router = express.Router();
const User = require('../models/Users');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require("uuid");
var fetchuser = require('../middleware/fetchuser');
const mailerFunc = require('../util/mailerFunction');

const JWT_SECRET = process.env.JWT_SECRET

//ROUTE 1
//create a user using POST request --- endpoint:api/auth/createUser. No login required
router.post('/createUser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    let success = false;
    // If there are errors, return Bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({ success, errors: errors.array() });
    }
    try {
        //check if the user with same email already exists 
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return resjson({ success, error: "Sorry!! User with this email already exists" })
        }

        const salt = await bcrypt.genSalt(10);
        const secPassword = await bcrypt.hash(req.body.password, salt);
        user = await User.create({
            name: req.body.name,
            password: secPassword,
            email: req.body.email
        });

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authToken });
        // .then(user => res.json(user))
        // .catch(err => {console.log(err)
        // res.json({error: "Please enter a unique value for email"})});
    } catch (error) {
        console.log(error);
        res.status(500).send("Some error occured");
    }
})

//ROUTE 2
//authenticate a user using POST request --- endpoint:api/auth/login. Login required
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists()
], async (req, res) => {

    // If there are errors, return Bad request and errors
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });

        if (!user) {
            return res.json({ error: 'Please try to login with correct credentials' });
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if (!passwordCompare) {
            success = false;
            return res.json({ success, error: 'Please try to login with correct credentials' });
        }

        const payload = {
            user: {
                id: user.id
            }
        }
        success = true;
        const authToken = jwt.sign(payload, JWT_SECRET);
        res.json({ success, authToken });


    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server error occured");
    }

})


//ROUTE 3
//Get logged in user details using POST request --- endpoint:api/auth/getUser. Login required 
router.post('/getUser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.json(user);
    } catch (error) {
        res.status(401).send({ error: "Internal server error occured" });
    }
});


//ROUTE 4
//Get email id from user using POST request --- endpoint:api/auth/forgotPassword . No Login required
router.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;
    try {
        let success = false;
        if (!email) {
            console.log("1")
            return res.json({ success, "error": "Internal server error occured" });
        }
        const result = await User.findOne({ email });
        if (!result) {
            console.log("2")
            return res.json({ success, "error": "No such user found" })
        }
        // console.log(userData);
        // const resetPasswordID = uuid();
        // const userID = userData._id;
        // const result = await User.findByIdAndUpdate(userID,{
        //     $set: {resetPasswordID}
        // },{
        //     new : true
        // });

        console.log(result);
        if (result) {
            const payload = {
                email: result.email,
                id: result._id
            }
            const authToken = jwt.sign(payload, JWT_SECRET);
            const resetPasswordString = `${result._id}/${authToken}`;

            const emailResponse = await mailerFunc(result.email, resetPasswordString);

        }
        success = true;
        res.send({ success, "msg": "Check you email for reseting password" })

    } catch (error) {
        res.json({ "error": "Internal server error occured" });
    }

});

//ROUTE 5
//Get token in POST request --- endpoint:api/auth/resetPassword/:id/:token . No Login required
router.post('/resetPassword/', async (req, res) => {
    const { id, token, password } = req.body;
    //const { password } = req.body;
    try {
        let success = false;
        const userData = await User.findById(id);
        if (!userData) {
            return res.json({ success, "error": "No such user found" })
        }
        
        const data = jwt.verify(token, JWT_SECRET);
        console.log(data);
        if (id == data.id) {
            const salt = await bcrypt.genSalt(10);
            const secPassword = await bcrypt.hash(password, salt);
            const result = await User.findByIdAndUpdate(id, {
                $set:{"password":secPassword}
            });
            if (result) {
                console.log(result);
                success = true;
                res.json({ success, "msg": "Your password has been changed" });
            }
        }


    } catch (error) {
        res.send({ "error": "INternal server error occured" })
    }
})



module.exports = router;