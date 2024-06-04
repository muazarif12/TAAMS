const student = require('../models/student');
const application = require('../models/application');
const slot = require('../models/slot');
const course = require('../models/course');
const teacherCourse = require('../models/teacherCourse');

var express = require('express');
const teacher = require('../models/teacher');
var router = express.Router();

router.use(async (req, res, next) => {
    if(req.user.role == "teacher") return res.json({ msg: "TEACHER NOT AUTHORIZED" })
    else next()
})


router.post('/viewApplicationStatus', async (req, res) => {
    try {

        const {sectionId} = req.body
        let user = await student.findOne({ email: req.user.email });
        let app = await application.find({studentEmail: user.email, sectionId : sectionId}).select('-_id status ');
        if (!app || app.length === 0) return res.json({ msg: 'No applications found' });
        return res.json({ sv: app });
    } catch (error) {
        console.error(error);
    }
});

router.get("/getStudentInfo", async (req, res) => {

    try{
        
        let stv = await student.findOne({email : req.user.email})
        if(!stv) return res.json({msg: "no students found"});
        console.log(stv)
        return res.json({stv});
        
        
    }

    catch (error){
        console.error(error);
            
    }

});



router.get('/viewAllslots', async (req, res) => {
    try {
        let sv = await slot.find({}).select('-_id sectionId')  
    
        if (!sv || sv.length === 0) return res.json({ msg: 'No slots found' });
        return res.json({ sv });
    } catch (error) {
        console.error(error);
    }
});

router.post('/getAllSlotbyTeacherEmail', async (req, res) => {
    try {
        const { email } = req.body;
        let tv = await teacher.findOne({ email: email });
        
        let sv = await slot.find({ teacher: tv._id }).select('-_id sectionId');
        
        if (!sv || sv.length === 0) return res.json({ msg:'The teacher has not opened any slots'});
        return res.json({ sv });
    } catch (error) {
        console.error(error);
    }
});
 
router.post('/getAllSlotsbyCourseId', async (req, res) => {
    try {
        const { courseID } = req.body;
        let cv = await course.findOne({ courseID: courseID });
        let sv = await slot.find({ course: cv._id }).select('-_id sectionId');
        if (!sv || sv.length === 0) return res.json({ msg: 'No slots found for this course' });
        return res.json({ sv });
    } catch (error) {
        console.error(error);
    }
});

router.post('/getTeacherInfo', async (req, res) => {
    try {
        const { email } = req.body;
        let tv = await teacher.findOne({ email: email }).select('-_id firstName lastName department coursesTeaching');
        if (!tv ) return res.json({ msg: 'Teacher not found' });
        return res.json({ tv });
    } catch (error) {
        console.error(error);
    }
});

router.get('/getAllTeachers', async (req, res) => {
    try {
        let tv = await teacher.find({}).select('-_id email firstName lastName');
        if (!tv) return res.json({ msg: 'No teachers found' });
        return res.json({ tv });
    } catch (error) {
        console.error(error);
    }
});


// POST API for students to apply for a slot directly using slot ID
router.post('/applyforSlot', async (req, res) => {
    try {
        const { slotId, studentStatement } = req.body;
        const user = await student.findOne({ email: req.user.email });

        if (!user) return res.status(404).json({ msg: 'Student not found' });

        const sv = await slot.findOne({ _id: slotId }).populate('course');

        if (!sv) return res.json({ msg: 'Slot not open for this Section' });

        const app1 = await application.findOne({ slot: sv._id, studentEmail: user.email });

        if (app1) return res.json({ msg: 'Application already exists' });

        const newApp = await application.create({
            studentName: `${user.firstName} ${user.lastName}`,
            studentEmail: user.email,
            studentStatement,
            slot: sv._id,
            course: sv.course // Add the course reference from the slot
        });

        sv.applications.push(newApp._id);
        await sv.save();

        return res.json({ msg: 'APPLICATION CREATED' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
});


router.post('/deleteApplication', async (req, res) => {
    try {
        const { sectionId } = req.body;
        let user = await student.findOne({ email: req.user.email });
        let sv = await slot.findOne({ sectionId : sectionId });
        if (!sv) return res.json({ msg: 'Slot not open for this Section' });
        let app = await application.findOne({ slot: sv._id });
        
        if(!app) return res.json({ msg: 'Application not found' });
        
        await application.deleteOne({ slot: sv._id});
        await slot.updateOne({ sectionId: sectionId }, { $pull: { applications: app._id } });
        
        return res.json({ msg: 'Application deleted successfully' });

    } catch (error) {
        console.error(error);
    }
});




module.exports = router;



