import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/images', express.static(path.join(__dirname, '../public/images')));

// Endpoint to get all cars
app.get('/api/cars', (req, res) => {
    try {
        const filePath = path.join(__dirname, '../data/cars.json');
        console.log('Reading cars from:', filePath);
        
        if (!fs.existsSync(filePath)) {
            console.error('cars.json file not found at:', filePath);
            return res.status(500).json({ error: 'Cars data file not found' });
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        console.log('File content length:', fileContent.length);
        
        const carsData = JSON.parse(fileContent);
        console.log('Number of cars loaded:', carsData.cars.length);
        
        res.json(carsData);
    } catch (error) {
        console.error('Error reading cars data:', error);
        res.status(500).json({ error: 'Error loading cars data' });
    }
});

// Endpoint to get car specifications
app.get('/api/specs/:filename', (req, res) => {
    try {
        // Sanitize the filename to prevent directory traversal
        const filename = req.params.filename.replace(/\.\./g, '').replace(/[^a-zA-Z0-9\-_.]/g, '');
        const specPath = path.join(__dirname, '../data/specs', filename);
        
        if (!fs.existsSync(specPath)) {
            return res.status(404).json({ error: 'Specification not found' });
        }

        const specData = fs.readFileSync(specPath, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.send(specData);
    } catch (error) {
        console.error('Error reading specification file:', error);
        res.status(500).json({ error: 'Error loading specification' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
