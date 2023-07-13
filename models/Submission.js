const mongoose = require('mongoose')

const test_submission_model = new mongoose.Schema({
    problemId: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    submissionId: {
        type: String,
        required: true,
        unique: true
    },
    submissionResponse: {
        type: String,
        required: true,
        default: 'No response'
    }
})

module.exports = mongoose.model('Submission', test_submission_model)
