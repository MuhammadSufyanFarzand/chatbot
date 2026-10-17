import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { chatHandler } from './server-route.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());

// Chat API endpoint
app.post('/api/chat', chatHandler);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'diginixit-chatbot' });
});

// Serve static assets from project root
app.use(express.static(__dirname));

// Serve index.html on root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
    console.log(`DiginixIT Chatbot server running at http://${HOST}:${PORT}`);
});
