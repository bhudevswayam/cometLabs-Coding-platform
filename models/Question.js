const mongoose = require('mongoose')

const questionUploadSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    }
})

module.exports = mongoose.model('Question', questionUploadSchema)
