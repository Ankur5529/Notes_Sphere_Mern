const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const auth = require('../middleware/auth.middleware');

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Get all notes for a user
router.get('/', auth, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Upload a note
router.post('/upload', auth, upload.single('noteFile'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const newNote = new Note({
            userId: req.user,
            title,
            description,
            fileUrl: req.file ? `/uploads/${req.file.filename}` : null,
            fileType: req.file ? req.file.mimetype : null
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a note
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Note ID' });
        }
        const updatedNote = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.user },
            { $set: { title, description } },
            { new: true }
        );
        if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete a note
router.delete('/:id', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Note ID' });
        }
        const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user });

        if (!note) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
