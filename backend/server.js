const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdf = require('pdf-parse');
const tesseract = require('tesseract.js');

const app = express();
const PORT = 3001;

// --- Middleware ---
app.use(cors({
    origin:'https://content-3tf5.vercel.app',
    ,
}));
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


// --- API Endpoints ---

// 1. PDF and OCR Text Extraction
app.post('/api/extract', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        let text;
        if (req.file.mimetype === 'application/pdf') {
            const data = await pdf(req.file.buffer);
            text = data.text;
        } else {
            const result = await tesseract.recognize(req.file.buffer, 'eng');
            text = result.data.text;
        }
        res.status(200).json({ text });
    } catch (error) {
        console.error('Extraction Error:', error);
        res.status(500).json({ error: 'Failed to extract text from the file.' });
    }
});

// 2. Simple Hashtag Suggestion
app.post('/api/suggest', (req, res) => {
    const { text } = req.body;
    if (!text) {
        return res.status(400).json({ error: 'No text provided.' });
    }
    
    // Simple logic: find long words, remove duplicates, and suggest them as hashtags.
    const words = text.split(/\s+/);
    const commonWords = new Set(['the', 'and', 'a', 'is', 'in', 'it', 'of', 'for', 'on', 'with', 'as', 'i', 'to', 'was', 'were']);
    const potentialTags = words
        .map(word => word.toLowerCase().replace(/[^a-zA-Z]/g, ''))
        .filter(word => word.length > 4 && !commonWords.has(word));

    const uniqueTags = [...new Set(potentialTags)].slice(0, 5); // Get top 5 unique tags
    const suggestions = uniqueTags.map(tag => `#${tag}`);
    
    res.status(200).json({ suggestions });
});


// --- Server Start ---
app.listen(PORT, () => {
    console.log(`✅ Lite backend server running on http://localhost:${PORT}`);
});
