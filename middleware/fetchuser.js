const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET

const fetchuser = (req, res, next) => {

    //Get the user from the JWT token and add id to request object
    console.log(req )
    const token = req.header('auth-token');
    if (!token) {
        
        res.status(401).json({ error: "1. Please authenticate using a valid token" });
    }

    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;

        next();
    } catch (error) {
        res.status(401).json({ error: "2. Please authenticate using a valid token" })
    }

}

module.exports = fetchuser;