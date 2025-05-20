// Only in NYC: Express + MongoDB server

// Importing all required packages
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient } = require('mongodb');
const path = require('path');

// Load .env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve index.html and other public files

// MongoDB setup
const client = new MongoClient(process.env.MONGODB_URI);
let db, entriesCollection;

// Connect to database
async function connectToDB() {
    try {
        await client.connect(); // Connect to mongoDB
        db = client.db('only-in-nyc-db'); // Selects datbase
        entriesCollection = db.collection('entries');
        console.log('Connected to MongoDB');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

// Routes

// Get all entries
app.get('/entries', async (req, res) => {
    try {
        const entries = await entriesCollection.find().sort({ timestamp: -1 }).toArray();
        res.json(entries);
    } catch (err) {
        console.error('Error fetching entries:', err);
        res.status(500).json({ error: 'Could not fetch entries' });
    }
});

// Post a new entry
// This POST route receives data from the form, validates it, and inserts it into the database
app.post('/entries', async (req, res) => {
    const { title, story, borough, timeOfDay, tags } = req.body;
    console.log('Incoming entry:', req.body); // check if working

    if (!title || !story || !borough || !timeOfDay) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const newEntry = {
        title,
        story,
        borough,
        timeOfDay,
        tags: tags || [],
        timestamp: new Date()
    };

    try {
        await entriesCollection.insertOne(newEntry);
        console.log('Entry saved:', newEntry);
        res.status(201).json(newEntry);
    } catch (err) {
        console.error('Error saving to DB:', err);
        res.status(500).json({ error: err.message || 'Failed to save entry' });
    }
});

// Start server on the defined port and connects to MongoDB 
//once server is running 
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    connectToDB();
});
