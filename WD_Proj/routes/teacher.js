const admin = require("../models/admin");
const teacher = require("../models/teacher");
const slot = require("../models/slot");
const course = require("../models/course");
const application = require("../models/application");
const student = require("../models/student");
const teacherCourse = require("../models/teacherCourse");

var express = require("express");
var router = express.Router();


router.get("/getCoursesByTeacher", async (req, res) => {
    try {
      // Get the teacher's email from the request user
      const { email } = req.user;
  
      // Find the teacher's ID based on the email
      const teacherDoc = await teacher.findOne({ email: email });
      if (!teacherDoc) return res.status(404).json({ msg: "Teacher not found" });
  
      // Find all the courses assigned to the teacher
      const teacherCourses = await teacherCourse.find({ teacher: teacherDoc._id });
  
      // Extract the course IDs from the teacherCourses
      const courseIds = teacherCourses.map((tc) => tc.course);
  
      // Find the courses based on the course IDs
      const courses = await course.find({ _id: { $in: courseIds } });
  
      return res.json({ courses });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Internal Server Error" });
    }
  });



router.post("/getSlotbySectionId", async (req, res) => {
    try{
        const {sectionId} = req.body
        let sv = await slot.find({sectionId: sectionId}).populate(
            [{path:"teacher", select:'teacherID email firstName lastName'}, 
             {path:"course", select: 'courseId courseName'}]
            ).select('sectionId requirements duration workHours applicationDeadline createdAt')
        if(!sv || sv.length === 0) return res.json({msg: "No slots found"})
        return res.json({sv})
    }catch(error){
        console.error(error)
    }
});


router.use(async (req, res, next) => {
    if(!req.user.role == "teacher") return res.json({ msg: "NOT TEACHER" })
    else next()
})


// teachers will create slots for the course they is teaching 
// 
router.post("/createSlot", async (req, res) => {
    try {
        const { sectionId, courseId } = req.body;

        // Find the course directly using its ID
        let cv = await course.findById(courseId);
        if (!cv) return res.json({ msg: "Course not found" });

        let user = await teacher.findOne({ email: req.user.email });
        if (!user) return res.json({ msg: "Teacher not found" });

        let tcv = await teacherCourse.findOne({ teacher: user._id, course: cv._id });
        if (!tcv) return res.json({ msg: "Course not assigned to teacher" });

        // Create the slot with the provided data
        await slot.create({
            ...req.body,
            teacher: user._id,
            course: cv._id,
            teacherName: user.firstName + " " + user.lastName,
            teacherEmail: user.email
        });

        return res.json({ msg: "SLOT CREATED" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


// teacher can delete slot
router.post("/deleteSlot", async (req, res) => {
    try {
        const { sectionId } = req.body;
        //console.log(sectionId);
        let user = await teacher.findOne({ email: req.user.email });
        let sv = await slot.findOne({ sectionId: sectionId, teacher: user._id});
        
        if (!sv) return res.json({ msg: "Slot not found " });
        await slot.deleteOne({ sectionId: sectionId}); // here the user._id is not necessary because the sectionId is unique //teacher: user._id
        return res.json({ msg: "Slot deleted successfully" });
    } catch (error) {
        console.error(error);
    }

})

// teacher can update slot only the description and requirements
router.patch("/updateSlot/:sectionId", async (req, res) => {
    try {
        const { sectionId } = req.params;
        const { description, requirements } = req.body; // Only allow updating description and requirements
        
        let user = await teacher.findOne({ email: req.user.email });
        let sv = await slot.findOne({ sectionId: sectionId, teacher: user._id });
        if (!sv) return res.json({ msg: "Slot not found " });
        
        
        await slot.findOneAndUpdate(
            { sectionId: sectionId },
            { $set: { description, requirements } },
            { new: true }
        );

        return res.json({ msg: "Slot updated successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});

// teacher can view TA applications for their slots
// GET API to retrieve all applications for the slots created by the teacher
router.get('/viewApplications', async (req, res) => {
    try {
        const user = await teacher.findOne({ email: req.user.email });

        if (!user) return res.status(404).json({ msg: "Teacher not found" });

        const slots = await slot.find({ teacher: user._id }).populate({
            path: 'applications',
            select: 'studentName slot studentEmail sectionId status studentStatement favourite -_id'
        });

        if (!slots || slots.length === 0) return res.json({ msg: "No slots found" });

        let apps = [];
        for (let s of slots) {
            for (let app of s.applications) {
                apps.push(app);
            }
        }

        if (apps.length === 0) return res.json({ msg: "No applications found" });
        return res.json({ apps });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: "Server error" });
    }
});

// teacher can view student profile
router.post("/viewStudentProfile", async (req, res) => {
    try {
        const { studentEmail } = req.body;
        let stv = await student.findOne({ email: studentEmail }).select('-_id email firstName lastName degreeProgram semester');
        if (!stv) return res.json({ msg: "Student not found" });
        return res.json({ stv });
    } catch (error) {
        console.error(error);
    }
});

// teacher can accept applications
router.patch("/acceptApplication/:slotId/:studentEmail", async (req, res) => {
    try {
        const { slotId, studentEmail } = req.params;

        let sv = await slot.findById(slotId).populate("applications");
        if (!sv) return res.json({ msg: "Slot not found" });

        let app = sv.applications.find(application => application.studentEmail === studentEmail);
        if (!app) return res.json({ msg: "Application not found" });
        if (app.status === "accepted") return res.json({ msg: "Application already accepted" });

        await application.findByIdAndUpdate(app._id, { status: "accepted" });
        return res.json({ msg: "Application accepted" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// let application = sv.applications.find(studentEmail:studentEmail);

// teacher can reject applications
router.patch("/rejectApplication/:slotId/:studentEmail", async (req, res) => {
    try {
        const { slotId, studentEmail } = req.params;

        let sv = await slot.findById(slotId).populate("applications");
        if (!sv) return res.json({ msg: "Slot not found" });

        let app = sv.applications.find(application => application.studentEmail === studentEmail);
        if (!app) return res.json({ msg: "Application not found" });
        if (app.status === "accepted") return res.json({ msg: "Application already accepted" });

        await application.findByIdAndUpdate(app._id, { status: "rejected" });
        return res.json({ msg: "Application rejected" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ msg: 'Server error' });
    }
});

// teacher can mark applications as favourite
router.patch("/makeFavourite/:sectionId/:studentEmail", async (req, res) => {
    try {
        
        const { sectionId, studentEmail } = req.params;
        
        let sv = await slot.findOne({ sectionId: sectionId }).populate("applications");
        if (!sv) return res.json({ msg: "Slot not found" });
        
        let app = sv.applications.find(application => application.studentEmail === studentEmail);
        if (!app) return res.json({ msg: "Application not found" });
        if (app.status === "accepted") return res.json({ msg: "You have already accepted this application" });
        if (app.status === "rejected") return res.json({ msg: "You have already rejected this application" });

        await app.updateOne({ favourite : true });
        return res.json({ msg: "Application marked favourite" });
    } catch (error) {
        console.error(error);
    }
});

// teacher can unmark applications as favourite
router.patch("/removeFavourite/:sectionId/:studentEmail", async (req, res) => {
    try {
        const { sectionId, studentEmail } = req.params;
        
        let sv = await slot.findOne({ sectionId: sectionId }).populate("applications");
        if (!sv) return res.json({ msg: "Slot not found" });
        
        let app = sv.applications.find(application => application.studentEmail === studentEmail);
        if (!app) return res.json({ msg: "Application not found" });
        if (app.status === "accepted") return res.json({ msg: "You have already accepted this application" });
        if (app.status === "rejected") return res.json({ msg: "You have already rejected this application" });

        await app.updateOne({ favourite : false });
        return res.json({ msg: "Favourite removed" });
    } catch (error) {
        console.error(error);
    }
});	

// teacher can view all applications which our marked as favourite
router.get("/viewFavourites", async (req, res) => {
    try {
        let user = await teacher.findOne({ email: req.user.email });
        let sv = await slot.find({ teacher: user._id }).populate({
            path: "applications",
            select: " -_id studentName studentEmail sectionId status studentStatement favourite" // Add the fields you want to select
        });
        
        
        if (!sv) return res.json({ msg: "No slots found" });
        let Apps = [];
        for (let slot of sv) {
            for (let app of slot.applications) {
                if (app.favourite) {
                    Apps.push(app);
                }
            }
        }
        if (Apps.length === 0) return res.json({ msg: "No favourites found" });
        return res.json({ Apps });
    } catch (error) {
        console.error(error);
    }
});


    


 






module.exports = router;



