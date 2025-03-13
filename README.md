<<<<<<< HEAD
# eondrive
Ev Range Comparison &amp; Range calculator
=======
# EV Range Calculator

A simple web application to compare the ranges of different electric vehicles. This project is built using TypeScript, Express.js, and basic frontend technologies (HTML, JavaScript, and Tailwind CSS).

## Project Structure

```
ev-range-calculator/
├── src/
│   └── server.ts           # TypeScript backend server
├── public/
│   ├── index.html         # Main HTML file
│   └── js/
│       └── main.js        # Frontend JavaScript
├── data/
│   └── cars.json         # Sample car data
├── package.json          # Node.js dependencies
├── tsconfig.json        # TypeScript configuration
├── Dockerfile          # Docker configuration
└── README.md          # Project documentation
```

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- npm (comes with Node.js)
- Docker (optional)

### Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript code:
   ```bash
   npm run build
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. Visit `http://localhost:3000` in your browser

### Running with Docker

1. Build the Docker image:
   ```bash
   docker build -t ev-range-calculator .
   ```

2. Run the container:
   ```bash
   docker run -p 3000:3000 ev-range-calculator
   ```

3. Visit `http://localhost:3000` in your browser

## Features

- View a list of electric vehicles with their specifications
- Compare up to 3 vehicles side by side
- Responsive design that works on mobile and desktop
- Simple miles/$ ratio calculation for basic efficiency comparison

## Data Structure

The car data is stored in `data/cars.json` and includes the following information for each vehicle:
- Brand
- Model
- Range (in miles)
- Battery size (in kWh)
- Year
- Price (in USD)

## Learning Resources

If you're new to the technologies used in this project, here are some helpful resources:

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Docker Getting Started Guide](https://docs.docker.com/get-started/)

## Next Steps

- Convert the data storage to MongoDB
- Add filtering and sorting capabilities
- Implement user authentication
- Add more detailed vehicle specifications
- Create an admin interface for data management
>>>>>>> a23f75c (Initial commit)
