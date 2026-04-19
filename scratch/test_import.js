import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testImport() {
    const category = 'carbon';
    const funcName = 'estimate';
    const apiPath = path.resolve(__dirname, 'api', category, `${funcName}.js`);
    console.log('API Path:', apiPath);

    // This is how dev-server.js does it currently
    const apiUri = `file://${apiPath}`;
    console.log('Current apiUri:', apiUri);

    try {
        const module = await import(apiUri);
        console.log('Import Success!');
    } catch (e) {
        console.error('Import Failed:', e.message);
    }

    // Improved apiUri for Windows
    const improvedUri = `file://${apiPath.replace(/\\/g, '/')}`;
    console.log('Improved apiUri:', improvedUri);
    try {
        const module = await import(improvedUri);
        console.log('Improved Import Success!');
    } catch (e) {
        console.error('Improved Import Failed:', e.message);
    }
}

testImport();
