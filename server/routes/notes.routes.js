const router = require('express').Router();
const mongoose = require('mongoose');
const Note = require('../models/Note');
const auth = require('../middleware/auth.middleware');
const { upload } = require('../config/upload');

// Initialize GridFS bucket
let gfsBucket;
mongoose.connection.once('open', () => {
    gfsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
        bucketName: 'notes_files'
    });
});

// ── GET /api/notes — Fetch all notes for a user (paginated) ─────────────────
router.get('/', auth, async (req, res) => {
    try {
        const page  = parseInt(req.query.page)  || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip  = (page - 1) * limit;

        const [notes, total] = await Promise.all([
            Note.find({ userId: req.user })
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Note.countDocuments({ userId: req.user }),
        ]);

        res.json({
            notes,
            currentPage:  page,
            totalPages:   Math.ceil(total / limit),
            totalNotes:   total,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── GET /api/notes/file/:id — Stream file from GridFS ────────────────────────
router.get('/file/:id', async (req, res) => {
    try {
        if (!gfsBucket) {
            return res.status(500).json({ message: 'Storage not initialized.' });
        }
        const fileId = new mongoose.Types.ObjectId(req.params.id);
        const files = await gfsBucket.find({ _id: fileId }).toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ message: 'File not found.' });
        }

        const file = files[0];
        // Read contentType from metadata (modern GridFS) or fallback to basic extension check
        let contentType = file.metadata?.contentType;
        if (!contentType) {
            if (file.filename.endsWith('.pdf')) contentType = 'application/pdf';
            else if (file.filename.endsWith('.png')) contentType = 'image/png';
            else if (file.filename.endsWith('.jpg') || file.filename.endsWith('.jpeg')) contentType = 'image/jpeg';
            else contentType = 'application/octet-stream';
        }

        // Set proper headers so PDFs open in browser, images display, etc.
        res.set('Content-Type', contentType);
        res.set('Content-Disposition', `inline; filename="${file.filename}"`);
        
        const readStream = gfsBucket.openDownloadStream(fileId);
        readStream.pipe(res);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── POST /api/notes/upload — Upload a note (file goes to GridFS) ─────────────
router.post('/upload', auth, upload.single('noteFile'), async (req, res) => {
    try {
        const { title, description } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ message: 'Title is required.' });
        }

        let fileUrl = null;
        let cloudinaryPublicId = null; // We keep this field name in schema but use it to store GridFS ID
        let fileType = null;

        // If a file was attached, upload it directly to MongoDB via GridFS
        if (req.file && gfsBucket) {
            try {
                // Open upload stream to GridFS and save contentType in metadata
                const uploadStream = gfsBucket.openUploadStream(req.file.originalname, {
                    metadata: { contentType: req.file.mimetype }
                });
                
                // Write the buffer from memory into the database
                uploadStream.end(req.file.buffer);

                // Wait for the stream to finish writing
                await new Promise((resolve, reject) => {
                    uploadStream.on('finish', resolve);
                    uploadStream.on('error', reject);
                });

                // Generate URL that points to our own server's GET /file/:id route
                fileUrl = `${process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5000'}/api/notes/file/${uploadStream.id}`;
                cloudinaryPublicId = uploadStream.id.toString(); // Store GridFS ID for deletion later
                fileType = req.file.mimetype;
            } catch (uploadErr) {
                console.error('GridFS upload error:', uploadErr);
                return res.status(500).json({ message: 'File storage failed. Please try again.' });
            }
        }

        const newNote = new Note({
            userId: req.user,
            title:  title.trim(),
            description: description?.trim() || '',
            fileUrl,
            fileType,
            cloudinaryPublicId, // Contains GridFS File ID
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (err) {
        console.error('Upload route error:', err);
        res.status(500).json({ message: err.message });
    }
});

// ── PUT /api/notes/:id — Update a note's title/description ───────────────────
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, description } = req.body;
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Note ID.' });
        }
        const updatedNote = await Note.findOneAndUpdate(
            { _id: req.params.id, userId: req.user },
            { $set: { title, description } },
            { new: true }
        );
        if (!updatedNote) return res.status(404).json({ message: 'Note not found.' });
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── DELETE /api/notes/:id — Delete note + remove file from GridFS ────────────
router.delete('/:id', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Invalid Note ID.' });
        }
        const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.user });
        if (!note) return res.status(404).json({ message: 'Note not found.' });

        // Clean up file from MongoDB GridFS if it exists
        if (note.cloudinaryPublicId && mongoose.Types.ObjectId.isValid(note.cloudinaryPublicId) && gfsBucket) {
            try {
                const fileId = new mongoose.Types.ObjectId(note.cloudinaryPublicId);
                await gfsBucket.delete(fileId);
            } catch (cleanupErr) {
                console.error('GridFS cleanup error:', cleanupErr.message);
                // Non-fatal, keep going
            }
        }

        res.json({ message: 'Note deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── PUT /api/notes/:id/pin — Toggle pin status ───────────────────────────────
router.put('/:id/pin', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid Note ID.' });
        const note = await Note.findOne({ _id: req.params.id, userId: req.user });
        if (!note) return res.status(404).json({ message: 'Note not found.' });
        
        note.isPinned = !note.isPinned;
        const updatedNote = await note.save();
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── PUT /api/notes/:id/share — Toggle share status ───────────────────────────
router.put('/:id/share', auth, async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid Note ID.' });
        const note = await Note.findOne({ _id: req.params.id, userId: req.user });
        if (!note) return res.status(404).json({ message: 'Note not found.' });
        
        note.isShared = !note.isShared;
        const updatedNote = await note.save();
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ── GET /api/notes/shared/:id — Fetch a publicly shared note ─────────────────
router.get('/shared/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid Note ID.' });
        const note = await Note.findOne({ _id: req.params.id, isShared: true }).populate('userId', 'name');
        if (!note) return res.status(404).json({ message: 'Note not found or not shared.' });
        
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
