"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
const PORT = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, '../public')));
app.use('/images', express_1.default.static(path_1.default.join(__dirname, '../public/images')));
// Endpoint to get all cars
app.get('/api/cars', (req, res) => {
    try {
        const filePath = path_1.default.join(__dirname, '../data/cars.json');
        console.log('Reading cars from:', filePath);
        if (!fs_1.default.existsSync(filePath)) {
            console.error('cars.json file not found at:', filePath);
            return res.status(500).json({ error: 'Cars data file not found' });
        }
        const fileContent = fs_1.default.readFileSync(filePath, 'utf-8');
        console.log('File content length:', fileContent.length);
        const carsData = JSON.parse(fileContent);
        console.log('Number of cars loaded:', carsData.cars.length);
        res.json(carsData);
    }
    catch (error) {
        console.error('Error reading cars data:', error);
        res.status(500).json({ error: 'Error loading cars data' });
    }
});
// Endpoint to get car specifications
app.get('/api/specs/:filename', (req, res) => {
    try {
        // Sanitize the filename to prevent directory traversal
        const filename = req.params.filename.replace(/\.\./g, '').replace(/[^a-zA-Z0-9\-_.]/g, '');
        const specPath = path_1.default.join(__dirname, '../data/specs', filename);
        if (!fs_1.default.existsSync(specPath)) {
            return res.status(404).json({ error: 'Specification not found' });
        }
        const specData = fs_1.default.readFileSync(specPath, 'utf-8');
        res.setHeader('Content-Type', 'application/json');
        res.send(specData);
    }
    catch (error) {
        console.error('Error reading specification file:', error);
        res.status(500).json({ error: 'Error loading specification' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
