const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Import models
const User = require('./models/User');
const Note = require('./models/Note');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/poznamky_db';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection Logic
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        // Tohle jsem přidal - kontrola typu připojení
        const connectionType = MONGODB_URI.includes('mongodb+srv') ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB';
        console.log(`✅ MongoDB Connected to: ${connectionType}`);
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
    }
};
connectDB();

// Middleware to check DB connection for API routes
app.use('/api', (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Service Unavailable: Database connection failed' });
    }
    next();
});

// --- API ROUTES ---

// Heartbeat for frontend to check connection
app.get('/api/heartbeat', (req, res) => res.status(200).send('OK'));

// 1. Register User
app.post('/api/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ message: 'Please provide username and password' });
        }

        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({ username, password });
        
        res.status(201).json({
            _id: user._id,
            username: user.username,
            message: 'User registered successfully'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. Login User
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                message: 'Login successful'
            });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. Delete Account
app.delete('/api/users/:id', async (req, res) => {
    try {
        const { password } = req.body;
        const userId = req.params.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user && (await user.matchPassword(password))) {
            await Note.deleteMany({ user: userId });
            await User.findByIdAndDelete(userId);
            res.json({ message: 'Account and all notes deleted successfully' });
        } else {
            res.status(401).json({ message: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 4. Get Notes (All or Important)
app.get('/api/notes', async (req, res) => {
    try {
        const { userId, important } = req.query;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        let query = { user: userId };
        if (important === 'true') {
            query.isImportant = true;
        }

        const notes = await Note.find(query).sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 5. Create Note
app.post('/api/notes', async (req, res) => {
    try {
        const { userId, title, content } = req.body;

        if (!userId || !title || !content) {
            return res.status(400).json({ message: 'Please provide all fields' });
        }

        const note = await Note.create({
            user: userId,
            title,
            content
        });

        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 6. Delete Note
app.delete('/api/notes/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }
        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 7. Toggle Importance
app.put('/api/notes/:id/importance', async (req, res) => {
    try {
        const { isImportant } = req.body;
        const note = await Note.findById(req.params.id);
        
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        note.isImportant = isImportant;
        await note.save();

        res.json(note);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Serve frontend for any other route (SPA approach)
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});