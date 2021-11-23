const express = require('express');
const app = express();
const router = express.Router();

app.use(express.json());

let mentors = [
    {
        id: 'M-1',
        mentorName: "Kalpesh",
        mentorEmail: "kalpesh@guvi.in",
        students:['S-1','S-2','S-3']
    },
    {
        id: 'M-2',
        mentorName: "Kamlesh",
        mentorEmail: "kamlesh@guvi.in",
        students:['S-4','S-5','S-6']
    }
]

let students = [
    {
        id: 'S-1',
        studentName: "student 1",
        studentEmail: "student1@gmail.com",
        mentorId: 'M-1'
    },
    {
        id: 'S-2',
        studentName: "student 2",
        studentEmail: "student2@gmail.com",
        mentorId: 'M-1'
    },
    {
        id: 'S-3',
        studentName: "student 3",
        studentEmail: "student3@gmail.com",
        mentorId: 'M-1'
    },
    {
        id: 'S-4',
        studentName: "student 4",
        studentEmail: "student4@gmail.com",
        mentorId: 'M-2'
    },
    {
        id: 'S-5',
        studentName: "student 5",
        studentEmail: "student6@gmail.com",
        mentorId: 'M-2'
    },
    {
        id: 'S-6',
        studentName: "student 6",
        studentEmail: "student6@gmail.com",
        mentorId: 'M-2'
    },
    {
        "id": "S-7",
        "studentName": "student 7",
        "studentEmail": "student7@gmail.com"
    },
    {
        "id": "S-8",
        "studentName": "student 7",
        "studentEmail": "student7@gmail.com"
    },
    {
        "id": "S-9",
        "studentName": "student 7",
        "studentEmail": "student7@gmail.com"
    }
]

//Get details of mentors --- /api/student-mentor-portal/getMentors
router.get('/getMentors', (req, res) => {
    try {
        res.status(200).send(mentors);
    } catch {
        res.status(400).send("Internal server error occured");
    }
})


//Get details of students --- /api/student-mentor-portal/getStudents
router.get('/getStudents', (req, res) => {
    try {
        res.status(200).send(students);
    } catch {
        res.status(400).send("Internal server error occured");
    }
})


//Add Mentor --- /api/student-mentor-portal/addMentor
router.post('/addMentor', (req, res) => {
    try {
        let id = 'M-' + (mentors.length + 1);
        mentors.push({id, ...req.body});
        res.status(400).send("Mentor Added Successfully");
    } catch (error) {
        res.status(400).send("Internal server error occured");
    }
})


//Add student --- /api/student-mentor-portal/addStudent
router.post('/addStudent', (req, res) => {
    try{
        let id = 'S-' + (students.length+1);
        students.push({id, ...req.body});
        res.status(400).send("Student Added Successfully");
    }catch (error) {
        res.status(400).send("Internal server error occured");
    }
})

//Assign students to a mentor --- /api/student-mentor-portal/assignStudent
router.post('/assignStudent/:id', (req, res) => {
    try {
        let mentorFlag = -1;
        mentors.forEach((mentor,index) => {
            if(mentor.id === req.params.id){
                mentorFlag = index;
            }
        })
        if(mentorFlag === -1){
            res.status(200).send("Invalid Mentor ID");
        }else{
            let studentsNotAssigned = [];
            let studentsAssigned = [];
            req.body.students.forEach(studentId => {
                let id = Number(studentId.substring(2));
                if(id>=students.length || students[id-1].mentorId != undefined){
                    studentsNotAssigned.push(studentId);
                } else{
                    students[id-1].mentorId = req.params.id;
                    studentsAssigned.push(studentId);
                }
            })
            res.status(400).json({"student assigned":studentsAssigned, "studentd not assigned":studentsNotAssigned});
        }

    } catch (error) {
        res.status(400).json("Internal server error occured");

    }
})

//assign or update Mentor -- api/student-mentor-portal/updateMentor
router.post('/updateMentor/:id', (req, res) => {
    try {
        let studentFlag = 0;
        students.forEach(student => {
            if(student.id === req.params.id){
                student.mentorId = req.body.mentorId;
                studentFlag = 1;
                res.status(400).send("Mentor updated successfully");
            }
        })
        if(studentFlag === 0){
            res.status(200).send("Invalid student id");
        }
    } catch (error) {
        res.status(400).json("Internal server error occured");
    }
})

//get students for a mentor ---/api/student-mentor-portal/getStudentsAssignedToMentor/:id
router.get('/getStudentsAssignedToMentor/:id', (req, res) => {
    try {
        let mentorFlag = 0;
        mentors.forEach(mentor => {
            if(mentor.id === req.params.id){
                mentorFlag = 1;
            }
        })
        if(mentorFlag === 0){
            res.status(200).send("Invalid Mentor ID")
        }else{
            let studentsArray = [];
            students.forEach(student => {
                if(student.mentorId === req.params.id){
                    studentsArray.push(student);
                }
            })
            res.status(400).json({"message":"Fetched Students Successfully", "Student assigned":studentsArray});
        }
    } catch (error) {
        res.status(400).json("Internal server error occured");
    }
})

module.exports = router;