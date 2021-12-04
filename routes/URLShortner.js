const express = require('express');
const router = express.Router();
const URLUser = require('../models/URLShortnerUser');
const url = require('../models/Url');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require("uuid");
var fetchuser = require('../middleware/fetchuser');
var sendEmail = require('../util/urlShortnerMailer');
const mailerFunc = require('../util/mailerFunction');
const shortId = require('shortid');
const request = require('request');
const validUrl = require('valid-url')



//ROUTE 1 : Register Account --- /api/url-shortner/register
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    try {
        let success = false;
        if (!email || !name || !password) {
            return res.json({ success, "msg": "Please Enter all the details" });
        }

        //check whether the email exists already    
        let user = await URLUser.findOne({ email: email });
        if (user) {
            return res.json({ success, "msg": "User with this email exists already." })
        }

        //create token and send mail for account activation
        const activationToken = jwt.sign({ name, email, password },
            process.env.JWT_SECRET,
            { expiresIn: process.env.ACTIVATION_EXPIRE });

        const accountActivationURL = `${process.env.BaseURL}/accountActivation/${activationToken}`;
        console.log(accountActivationURL)

        const emailMessage =
            `  
        <p>Hi ${name}</p>
        <p>Thanks for the registration with our website !!</p>
        <p>Please click on the below link to activate you account:</p>
        <p><a href= ${accountActivationURL}>${accountActivationURL}</a></p>
        <p>The above URL will be active for <strong>${process.env.ACTIVATION_EXPIRE}</strong> mins.</p>

        <p>Thanks and Regards,</p>
        <p>URL Shortner Team</p>
        `;
        try {
            console.log("insisde try")
            //const emailResponse = await mailerFunc("pratikparate707@gmail.com", "abcd");
            const emailresponse = await sendEmail(email, emailMessage);
            console.log(emailresponse);
            success = true; 
            return res.json({ success, "msg": "Account activation link has been sent to your registered mail id." ,accountActivationURL})
        } catch (error) {
            success = false;
            return res.json({ success, msg: "Failed to send account activation link" , error})
        }

    } catch(error){
        res.json({success,error});
    }
});



//ROUTE 2 : Account activation -- /api/url-shortner/
router.get('/accountActivation/:activationToken', async(req,res) => {
    const activationToken = req.params.activationToken;
    try {
        console.log(activationToken)
        const {name, email, password} = jwt.verify(activationToken , process.env.JWT_SECRET,
            (err, decoded) => {
                if(err){
                    console.log(err);
                    return res.send(
                        `
                        <h1 style="
                            color:red;
                            text-align:center;
                        ">Activation Link expired !! Please signup again</h1>
                        `
                    )
                }else{
                    return decoded;
                }
            })
            console.log(name+" "+email+" "+password);

        try {

            const salt = await bcrypt.genSalt(10);
            const secPassword = await bcrypt.hash(password, salt);
            const user = await URLUser.create({
                name: name,
                email: email,
                password: secPassword
            })
            console.log(user);
            return res.send(
                `
                <h1 style="
                    color:red;
                    text-align:center;
                ">Account Activated Successfully</h1>
                `
            )

        } catch (error) {
            return res.json({success:false, error,"msg":"1"})
        }    

    } catch (error) {
        return res.json({success:false, error,"msg":"2"})
    }
})


//ROUTE 3
//authenticate a user using POST request --- endpoint:api/url-shortner/login. Login required
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
        let user = await URLUser.findOne({ email });

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
        const authToken = jwt.sign(payload, process.env.JWT_SECRET);
        res.json({ success, authToken });


    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server error occured");
    }

})


//ROUTE 4
//Get logged in user details using POST request --- endpoint:api/url-shortner/getUser. Login required 
router.post('/getUser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await URLUser.findById(userId).select("-password");
        res.json(user);
    } catch (error) {
        res.status(401).send({ error: "Internal server error occured" });
    }
});


//ROUTE 5
//Get email id from user using POST request --- endpoint:api/url-shortner/forgotPassword . No Login required
router.post('/forgotPassword', async (req, res) => {
    const { email } = req.body;
    try {
        let success = false;
        if (!email) {
            console.log("1")
            return res.json({ success, "error": "Internal server error occured" });
        }
        const result = await URLUser.findOne({ email });
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

            const authToken = jwt.sign(payload, process.env.JWT_SECRET,{
                expiresIn: process.env.ACTIVATION_EXPIRE
            });
            console.log(authToken)
            const resetPasswordString = `${result._id}/${authToken}`;

            const emailResponse = await mailerFunc(result.email, resetPasswordString);

        }
        success = true;
        res.send({ success, "msg": "Check you email for reseting password" })

    } catch (error) {
        res.json({ "error": "Internal server error occured" });
    }

});

//ROUTE 6
//Get token in POST request --- endpoint:api/url-shortner/resetPassword/:id/:token . No Login required
router.post('/resetPassword/', async (req, res) => {
    const { id, token, password } = req.body;
    //const { password } = req.body;
    try {
        let success = false;
        const userData = await URLUser.findById(id);
        if (!userData) {
            return res.json({ success, "error": "No such user found" })
        }
        
        const data = jwt.verify(token, process.env.JWT_SECRET);
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


//ROUTE 7
//Get all the URLs shortened ---- api/url-shortner/getURLS
router.get('/getURLS', async (req, res) => {
    try{
        let urls = await url.find({}, "longURL shortURL clicks");

        return res.json({
            success: true,
            urls
        })
    } catch(error){
        return res.json({success: false, error})
    }
})

//ROUTE 8
//Shortner the input URL --- api/url-shortner/shorten
router.post('/shorten', async(req, res) => {
    const {longURL} = req.body;
    console.log(longURL);
    if(!validUrl.isUri(process.env.BaseURL)){
        return res.json({success:false, error:"Invalid base url"});
    }

    const urlCode = shortId.generate();
    console.log(urlCode);
    if(validUrl.isUri(longURL)){
        try{
            let Url = await url.findOne({longURL});
            console.log(Url);
            if(Url){
                res.json({success:true, Url});
            }else{
                console.log("in else 1")
                const shortURL = process.env.BaseURL + urlCode;
                console.log("in else 2")
                Url = new url({
                    longURL,
                    shortURL,
                    shortcode: urlCode
                })
                console.log("in else 3")
                await Url.save()
                console.log("in else 4")
                res.json({success:true, Url})
            }

        } catch(error){
            return res.json({success:false, error})
        }
    }

})


//ROUTE 9
//redirect short url to long url --- api/url-shortner/:shortcode
router.get('/:shortcode', async(req, res) => {
    try{
        let Url = await url.findOne({shortUrl : `${process.env.BaseURL}/${req.params.shortcode}`});
        console.log(Url);
        if(Url){
            Url.clicks = Url.clicks+1;
            await Url.save();
            return res.redirect(Url.longURL)
        } else{
            return res.json({success: false, error:"No Such URL exists"})
        }
    }catch(error){
        return res.json({success:false, error});
    }
})

module.exports = router;