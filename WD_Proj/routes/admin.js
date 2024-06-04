const student = require('../models/student');
const application = require('../models/application');
const slot = require('../models/slot');
const course = require('../models/course');
const teacherCourse = require('../models/teacherCourse');
const teacher = require('../models/teacher');

var express = require('express');
var router = express.Router();

router.use(async (req, res, next) => {
    if(req.user.role != "admin") return res.json({ msg: "NOT ADMIN" })
    else next()
})

// admin will add course to the system
 

router.post("/addCourse", async (req, res) => {
    try {
        const {courseID} = req.body;  
        let cv = await course.findOne({ courseID });
        if (cv) return res.json({ msg: "Course already exists" });
        console.log("Course:", req.body);
        await course.create({...req.body });
        return res.json({ msg: "COURSE ADDED" });
    } catch (error) {
        console.error(error);
    }
});
// router.post("/addCourse", async (req, res) => {
//     try {
//         const {courseID, teachers} = req.body;  
//         let cv = await course.findOne({ courseID });
//         if (cv) return res.json({ msg: "Course already exists" });
//         console.log("Course:", req.body);
//         ncv = await course.create({...req.body });
//         await teacher.updateMany(
//             { _id: { $in: teachers } },
//             { $push: { courses: ncv[0]._id } },
//             { session }   
//         )
//         return res.json({ msg: "COURSE ADDED" });

//     } catch (error) {
//         console.error(error);
//     }
// });

// admin will delete course from the system

router.post("/deleteCourse", async (req, res) => {
    try {
        const { courseID } = req.body;
        let cv = await course.findOne({ courseID });
        if (!cv) return res.json({ msg: "Course not found" });
        await course.deleteOne({ courseID });
        return res.json({ msg: "COURSE DELETED" });
    } catch (error) {
        console.error(error);
    }
});

// admin will view all courses in the system

router.get("/getCourses", async (req, res) => {
    try {
        let cv = await course.find({}).populate('teachers')
        if (!cv) return res.json({ msg: "No courses found" });
        return res.json({ cv });
    } catch (error) {
        console.error(error);
    }
});

router.get('/getTeachers', async (req, res) => {
    try {
        let tv = await teacher.find({}).select('_id email firstName lastName');
        if (!tv) return res.json({ msg: 'No teachers found' });
        return res.json({ tv });
    } catch (error) {
        console.error(error);
    }
});

// admin will update course in the system
// router.put("/updateCourse/:courseID", async (req, res) => {
//     try {
//         const { courseID } = req.params;
        
//         let cv = await course.findOne({ courseID });
//         if (!cv) {
//             return res.status(404).json({ msg: "Course not found" });
//         }

//         // Update the existing course with the new data
//         cv = await course.findOneAndUpdate(
//             { courseID },
//             { $set: req.body },
//             { new: true }
//         );

//         return res.json({ msg: "Course updated", updatedCourse: cv });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ msg: "Internal Server Error" });
//     }
// });

// make post api for updateCourse
router.post("/updateCourse", async (req, res) => {
    try {
        const {courseID} = req.body;  
        let cv = await course.findOne({ courseID });
        if (!cv) {
            return res.status(404).json({ msg: "Course not found" });
        }
        cv = await course.findOneAndUpdate(
            { courseID },
            { $set: req.body },
            { new: true }
        );

        return res.json({ msg: "Course updated", updatedCourse: cv });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Internal Server Error" });
    }
});

// admin will assign course to teacher
// router.post("/assignCourseToTeacher", async (req, res) => {
//     try{
//         const{teacherEmail, courseID} = req.body
//         let tv = await teacher.findOne({email:teacherEmail});
//         if(!tv) return res.json({msg: "Teacher not found"})
        
//         let cv = await course.findOne({courseID});
//         if(!cv) return res.json({msg: "Course not found"})
        
//         let tcv = await teacherCourse.findOne({teacher:tv._id, course:cv._id});
//         if(tcv) return res.json({msg: "The teacher is already assigned to this course"})
        
//         await teacherCourse.create({teacher:tv._id, course:cv._id});
//         tv.coursesTeaching.push(cv.courseName); 
//         await tv.save();  
//         return res.json({msg: "COURSE ASSIGNED TO TEACHER"})
//     }catch(error){
//         console.error(error);
//     }   
// }); 


module.exports = router;
