const express = require('express');
const router = express.Router();
const fs = require('fs');


//create File API CALL - /api/file/createFile
router.post('/createFile', async (req, res) => {
    try {
        let date = new Date().toLocaleDateString();
        fs.writeFileSync('Files/Current_Date_Time.txt', date.toString());
        const data = fs.readFileSync('Files/Current_Date_Time.txt', 'UTF-8');
        res.send({
            Message: "File Created",
            fileName: "Current_Date_Time.txt",
            content: data
        });
    } catch (error) {
        res.json("Internal server error occured");
    }
})

//list All file API CALL - /api/file/getAllFiles
router.get('/getAllFiles', async (req, res) => {
    try {
        let files =[];
        fs.readdirSync('./Files').forEach(file => {
            files.push(file)
        });
        res.json({
            message:"Success",
            "Files present" :files
        })
    } catch (error) {
        console.log("Internal server error occured");
    }
})

module.exports = router;