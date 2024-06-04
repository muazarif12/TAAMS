const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'teacher', // Reference to the teacher model 
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course', // Reference to the course model
        required: true
    },
    
    teacherName: {
        type: String,
        required: false,
    },
    teacherEmail: {
        type: String,
        required: false,
    },

    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'application'
    }],

    sectionId: {
        type: String,
        required: false,
    },
     TAassigned: {
        type: Boolean,
        default: false,
    },
    description:{
        type: String,
        required: false,
    },
    requirements: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    
});

const slot = mongoose.model('slot', slotSchema);

module.exports = slot;