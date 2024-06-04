const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    slot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'slot',
        required: true
    },
    // sectionId: {
    //     type: String,
    //     required: false
    // },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'course',
        required: true
    },
    status: {
        type: String,
        default: "Pending",
        required: true
    },
    studentStatement: {
        type: String,
        required: true
    },
    favourite: {
        type: Boolean,
        default: false,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

module.exports = mongoose.model('application', applicationSchema);
