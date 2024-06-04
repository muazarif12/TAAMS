const mongoose = require('mongoose');

const teacherCourseSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course',
        required: true
    },
    //add sectionID
    
});

const teacherCourse = mongoose.model('teacherCourse', teacherCourseSchema);

module.exports = teacherCourse;
