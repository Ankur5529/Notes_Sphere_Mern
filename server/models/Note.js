const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    fileUrl: {
        type: String,
    },
    fileType: {
        type: String,
    },
    cloudinaryPublicId: {
        type: String,
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Note', noteSchema);
