import express from 'express';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the root
app.use(express.static(__dirname));

// Bridge to Vercel API routes
app.all('/api/:category/:function', async (req, res) => {
    const { category, function: funcName } = req.params;
    const apiPath = path.resolve(__dirname, 'api', category, `${funcName}.js`);
    const apiUri = pathToFileURL(apiPath).href;

    if (fs.existsSync(apiPath)) {
        try {
            // ESM dynamic import with cache busting
            const module = await import(apiUri + `?update=${Date.now()}`);
            const handler = module.default;
            
            if (typeof handler === 'function') {
                await handler(req, res);
            } else {
                throw new Error('API module does not export a default function');
            }
        } catch (error) {
            console.error(`Error in API route /api/${category}/${funcName}:`, error);
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(404).json({ success: false, error: 'API route not found' });
    }
});

// Single depth API routes (e.g. /api/health)
app.get('/api/:endpoint', async (req, res) => {
    const apiPath = path.resolve(__dirname, 'api', `${req.params.endpoint}.js`);
    const apiUri = pathToFileURL(apiPath).href;
    
    if (fs.existsSync(apiPath)) {
        try {
            const module = await import(apiUri + `?update=${Date.now()}`);
            const handler = module.default;
            await handler(req, res);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.status(404).json({ success: false, error: 'API route not found' });
    }
});

app.listen(PORT, () => {
    console.log(`\n🚀 GreenTrack Unified Server Running at http://localhost:${PORT}`);
    console.log(`📂 Static files and /api routes integrated.\n`);
});
