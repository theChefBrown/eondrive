import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const carsPath = join(root, 'data', 'cars.json');
const raw = readFileSync(carsPath, 'utf8').replace(/^\uFEFF/, '');
const db = JSON.parse(raw);

const newCars = [
  {
    id: 120, brand: 'Kia', model: 'Niro EV', description: 'Long Range', year: 2024,
    rangeKm: 463, rangeMiles: 253, batterySize: 64.8, priceEur: 41990, priceUsd: 40990,
    image: '/images/cars/kia-niro-ev.webp', specFile: 'kia-niro-ev.json',
    trims: [
      { name: 'Air (64.8 kWh)', batterySize: 64.8, rangeKm: 463, rangeMiles: 253, priceEur: 39990, priceUsd: 38990 },
      { name: 'Wind (64.8 kWh)', batterySize: 64.8, rangeKm: 463, rangeMiles: 253, priceEur: 41990, priceUsd: 40990 },
      { name: 'Wave (64.8 kWh)', batterySize: 64.8, rangeKm: 463, rangeMiles: 253, priceEur: 44990, priceUsd: 43990 }
    ]
  },
  {
    id: 121, brand: 'Kia', model: 'Soul EV', description: '64 kWh Long Range', year: 2022,
    rangeKm: 452, rangeMiles: 243, batterySize: 64, priceEur: 37990, priceUsd: 35990,
    image: '/images/cars/kia-soul-ev.webp', specFile: 'kia-soul-ev.json',
    trims: [
      { name: 'Standard (39.2 kWh)', batterySize: 39.2, rangeKm: 277, rangeMiles: 172, priceEur: 32990, priceUsd: 30990 },
      { name: 'Long Range (64 kWh)', batterySize: 64, rangeKm: 452, rangeMiles: 243, priceEur: 37990, priceUsd: 35990 }
    ]
  },
  {
    id: 122, brand: 'Honda', model: 'e', description: 'Advance', year: 2022,
    rangeKm: 222, rangeMiles: 137, batterySize: 35.5, priceEur: 36990, priceUsd: 36990,
    image: '/images/cars/honda-e.webp', specFile: 'honda-e.json',
    trims: [
      { name: 'Honda e (144 hp)', batterySize: 35.5, rangeKm: 222, rangeMiles: 137, priceEur: 34990, priceUsd: 34990 },
      { name: 'Honda e Advance (154 hp)', batterySize: 35.5, rangeKm: 222, rangeMiles: 137, priceEur: 36990, priceUsd: 36990 }
    ]
  },
  {
    id: 123, brand: 'BMW', model: 'i3', description: '120 Ah', year: 2021,
    rangeKm: 316, rangeMiles: 153, batterySize: 42.2, priceEur: 42000, priceUsd: 45000,
    image: '/images/cars/bmw-i3.webp', specFile: 'bmw-i3.json',
    trims: [
      { name: 'i3 120 Ah (2019-2022)', batterySize: 42.2, rangeKm: 316, rangeMiles: 196, priceEur: 42000, priceUsd: 45000 },
      { name: 'i3s 120 Ah', batterySize: 42.2, rangeKm: 298, rangeMiles: 153, priceEur: 45000, priceUsd: 48000 }
    ]
  },
  {
    id: 124, brand: 'Mercedes', model: 'EQS SUV 450+', description: 'Luxury 3-Row SUV', year: 2024,
    rangeKm: 609, rangeMiles: 378, batterySize: 108.4, priceEur: 109990, priceUsd: 114900,
    image: '/images/cars/mercedes-eqs-suv.webp', specFile: 'mercedes-eqs-suv.json',
    trims: [
      { name: 'EQS SUV 450+ RWD', batterySize: 108.4, rangeKm: 609, rangeMiles: 378, priceEur: 109990, priceUsd: 114900 },
      { name: 'EQS SUV 450 4MATIC', batterySize: 108.4, rangeKm: 563, rangeMiles: 350, priceEur: 119990, priceUsd: 124900 },
      { name: 'EQS SUV 580 4MATIC', batterySize: 108.4, rangeKm: 545, rangeMiles: 339, priceEur: 139990, priceUsd: 144900 }
    ]
  },
  {
    id: 125, brand: 'Audi', model: 'RS e-tron GT', description: 'Performance Flagship', year: 2024,
    rangeKm: 495, rangeMiles: 307, batterySize: 105, priceEur: 148400, priceUsd: 148000,
    image: '/images/cars/audi-rs-etron-gt.webp', specFile: 'audi-rs-etron-gt.json',
    trims: [
      { name: 'RS e-tron GT (475 kW)', batterySize: 105, rangeKm: 495, rangeMiles: 307, priceEur: 148400, priceUsd: 148000 },
      { name: 'RS e-tron GT Performance (630 kW)', batterySize: 105, rangeKm: 472, rangeMiles: 293, priceEur: 175000, priceUsd: 177000 }
    ]
  },
  {
    id: 126, brand: 'Ford', model: 'F-150 Lightning', description: 'Extended Range AWD', year: 2024,
    rangeKm: 515, rangeMiles: 320, batterySize: 131, priceEur: 56990, priceUsd: 49995,
    image: '/images/cars/ford-f150-lightning.webp', specFile: 'ford-f150-lightning.json',
    trims: [
      { name: 'Pro Standard Range', batterySize: 98, rangeKm: 370, rangeMiles: 230, priceEur: 47990, priceUsd: 41990 },
      { name: 'XLT Extended Range', batterySize: 131, rangeKm: 515, rangeMiles: 320, priceEur: 53990, priceUsd: 49995 },
      { name: 'Platinum Extended Range', batterySize: 131, rangeKm: 515, rangeMiles: 320, priceEur: 79990, priceUsd: 74995 }
    ]
  },
  {
    id: 127, brand: 'Renault', model: 'Scenic E-Tech', description: '87 kWh Long Range', year: 2024,
    rangeKm: 625, rangeMiles: 388, batterySize: 87, priceEur: 39990, priceUsd: 43990,
    image: '/images/cars/renault-scenic-e-tech.webp', specFile: 'renault-scenic-e-tech.json',
    trims: [
      { name: 'Techno 60 kWh', batterySize: 60, rangeKm: 430, rangeMiles: 267, priceEur: 35990, priceUsd: 38990 },
      { name: 'Techno 87 kWh', batterySize: 87, rangeKm: 625, rangeMiles: 388, priceEur: 39990, priceUsd: 43990 },
      { name: 'Iconic 87 kWh', batterySize: 87, rangeKm: 625, rangeMiles: 388, priceEur: 44990, priceUsd: 47990 }
    ]
  },
  {
    id: 128, brand: 'Opel', model: 'Frontera Electric', description: 'Affordable Electric SUV', year: 2024,
    rangeKm: 305, rangeMiles: 190, batterySize: 44, priceEur: 28990, priceUsd: 32990,
    image: '/images/cars/opel-frontera-electric.webp', specFile: 'opel-frontera-electric.json',
    trims: [
      { name: 'Standard (44 kWh)', batterySize: 44, rangeKm: 305, rangeMiles: 190, priceEur: 28990, priceUsd: 32990 },
      { name: 'Extended (54 kWh)', batterySize: 54, rangeKm: 420, rangeMiles: 261, priceEur: 33990, priceUsd: 37990 }
    ]
  },
  {
    id: 129, brand: 'Opel', model: 'Grandland Electric', description: 'Long Range FWD', year: 2024,
    rangeKm: 533, rangeMiles: 331, batterySize: 82, priceEur: 44990, priceUsd: 49990,
    image: '/images/cars/opel-grandland-electric.webp', specFile: 'opel-grandland-electric.json',
    trims: [
      { name: 'GS (73 kWh)', batterySize: 73, rangeKm: 452, rangeMiles: 281, priceEur: 40990, priceUsd: 44990 },
      { name: 'GS Long Range (82 kWh)', batterySize: 82, rangeKm: 533, rangeMiles: 331, priceEur: 44990, priceUsd: 49990 },
      { name: 'GSe AWD (82 kWh)', batterySize: 82, rangeKm: 475, rangeMiles: 295, priceEur: 52990, priceUsd: 57990 }
    ]
  },
  {
    id: 130, brand: 'Fiat', model: 'Grande Panda Electric', description: 'Affordable City EV', year: 2024,
    rangeKm: 320, rangeMiles: 199, batterySize: 44, priceEur: 26990, priceUsd: 29990,
    image: '/images/cars/fiat-grande-panda-electric.webp', specFile: 'fiat-grande-panda-electric.json',
    trims: [
      { name: 'Electric (44 kWh)', batterySize: 44, rangeKm: 320, rangeMiles: 199, priceEur: 26990, priceUsd: 29990 },
      { name: 'La Prima (44 kWh)', batterySize: 44, rangeKm: 320, rangeMiles: 199, priceEur: 30990, priceUsd: 33990 }
    ]
  },
  {
    id: 131, brand: 'DS', model: '3 E-Tense', description: 'Premium Electric Compact', year: 2024,
    rangeKm: 402, rangeMiles: 250, batterySize: 54, priceEur: 37990, priceUsd: 41990,
    image: '/images/cars/ds3-e-tense.webp', specFile: 'ds3-e-tense.json',
    trims: [
      { name: 'DS 3 (54 kWh)', batterySize: 54, rangeKm: 402, rangeMiles: 250, priceEur: 37990, priceUsd: 41990 },
      { name: 'DS 3 Performance Line (54 kWh)', batterySize: 54, rangeKm: 390, rangeMiles: 242, priceEur: 41990, priceUsd: 45990 }
    ]
  },
  {
    id: 132, brand: 'Lancia', model: 'Ypsilon Electric', description: 'Italian Premium EV', year: 2024,
    rangeKm: 403, rangeMiles: 250, batterySize: 54, priceEur: 35990, priceUsd: 39990,
    image: '/images/cars/lancia-ypsilon-electric.webp', specFile: 'lancia-ypsilon-electric.json',
    trims: [
      { name: 'Ypsilon (54 kWh)', batterySize: 54, rangeKm: 403, rangeMiles: 250, priceEur: 35990, priceUsd: 39990 },
      { name: 'Ypsilon Cassina (54 kWh)', batterySize: 54, rangeKm: 403, rangeMiles: 250, priceEur: 41990, priceUsd: 45990 }
    ]
  },
  {
    id: 133, brand: 'Leapmotor', model: 'C10', description: 'Electric SUV', year: 2024,
    rangeKm: 420, rangeMiles: 261, batterySize: 69.9, priceEur: 36400, priceUsd: 39990,
    image: '/images/cars/leapmotor-c10.webp', specFile: 'leapmotor-c10.json',
    trims: [
      { name: 'C10 FWD (69.9 kWh)', batterySize: 69.9, rangeKm: 420, rangeMiles: 261, priceEur: 36400, priceUsd: 39990 },
      { name: 'C10 AWD (69.9 kWh)', batterySize: 69.9, rangeKm: 390, rangeMiles: 242, priceEur: 40400, priceUsd: 43990 }
    ]
  },
  {
    id: 134, brand: 'MG', model: 'Cyberster', description: 'Electric Sports Roadster', year: 2024,
    rangeKm: 536, rangeMiles: 333, batterySize: 77, priceEur: 52990, priceUsd: 56990,
    image: '/images/cars/mg-cyberster.webp', specFile: 'mg-cyberster.json',
    trims: [
      { name: 'Standard AWD (77 kWh)', batterySize: 77, rangeKm: 536, rangeMiles: 333, priceEur: 52990, priceUsd: 56990 },
      { name: 'GT AWD Trophy (77 kWh)', batterySize: 77, rangeKm: 502, rangeMiles: 312, priceEur: 57990, priceUsd: 61990 }
    ]
  },
  {
    id: 135, brand: 'BYD', model: 'Tang', description: '7-Seat Electric SUV', year: 2024,
    rangeKm: 530, rangeMiles: 329, batterySize: 108.8, priceEur: 69990, priceUsd: 74990,
    image: '/images/cars/byd-tang.webp', specFile: 'byd-tang.json',
    trims: [
      { name: 'AWD Standard (108.8 kWh)', batterySize: 108.8, rangeKm: 530, rangeMiles: 329, priceEur: 69990, priceUsd: 74990 },
      { name: 'AWD Premium (108.8 kWh)', batterySize: 108.8, rangeKm: 530, rangeMiles: 329, priceEur: 79990, priceUsd: 84990 }
    ]
  },
  {
    id: 136, brand: 'BYD', model: 'Seal U', description: 'Compact Electric SUV', year: 2024,
    rangeKm: 430, rangeMiles: 267, batterySize: 82.56, priceEur: 37990, priceUsd: 40990,
    image: '/images/cars/byd-seal-u.webp', specFile: 'byd-seal-u.json',
    trims: [
      { name: 'Comfort FWD (82.56 kWh)', batterySize: 82.56, rangeKm: 430, rangeMiles: 267, priceEur: 37990, priceUsd: 40990 },
      { name: 'Excellence FWD (82.56 kWh)', batterySize: 82.56, rangeKm: 420, rangeMiles: 261, priceEur: 42990, priceUsd: 45990 }
    ]
  },
  {
    id: 137, brand: 'BYD', model: 'Atto 2', description: 'Affordable City EV', year: 2025,
    rangeKm: 312, rangeMiles: 194, batterySize: 45.1, priceEur: 24990, priceUsd: 27990,
    image: '/images/cars/byd-atto-2.webp', specFile: 'byd-atto-2.json',
    trims: [
      { name: 'Active (45.1 kWh)', batterySize: 45.1, rangeKm: 312, rangeMiles: 194, priceEur: 24990, priceUsd: 27990 },
      { name: 'Comfort (45.1 kWh)', batterySize: 45.1, rangeKm: 312, rangeMiles: 194, priceEur: 27990, priceUsd: 30990 }
    ]
  },
  {
    id: 138, brand: 'NIO', model: 'ES6', description: 'Smart Electric SUV', year: 2024,
    rangeKm: 447, rangeMiles: 278, batterySize: 75, priceEur: 47990, priceUsd: 50990,
    image: '/images/cars/nio-es6.webp', specFile: 'nio-es6.json',
    trims: [
      { name: 'Standard (75 kWh)', batterySize: 75, rangeKm: 447, rangeMiles: 278, priceEur: 47990, priceUsd: 50990 },
      { name: 'Long Range (100 kWh)', batterySize: 100, rangeKm: 575, rangeMiles: 357, priceEur: 54990, priceUsd: 57990 }
    ]
  },
  {
    id: 139, brand: 'NIO', model: 'EL6', description: 'Smart Electric Coupe SUV', year: 2024,
    rangeKm: 426, rangeMiles: 265, batterySize: 75, priceEur: 47990, priceUsd: 50990,
    image: '/images/cars/nio-el6.webp', specFile: 'nio-el6.json',
    trims: [
      { name: 'Standard (75 kWh)', batterySize: 75, rangeKm: 426, rangeMiles: 265, priceEur: 47990, priceUsd: 50990 },
      { name: 'Long Range (100 kWh)', batterySize: 100, rangeKm: 551, rangeMiles: 342, priceEur: 54990, priceUsd: 57990 }
    ]
  },
  {
    id: 140, brand: 'Zeekr', model: '007', description: 'Ultra-Performance Sedan', year: 2024,
    rangeKm: 544, rangeMiles: 338, batterySize: 100, priceEur: 44990, priceUsd: 47990,
    image: '/images/cars/zeekr-007.webp', specFile: 'zeekr-007.json',
    trims: [
      { name: 'RWD (75 kWh)', batterySize: 75, rangeKm: 450, rangeMiles: 280, priceEur: 39990, priceUsd: 42990 },
      { name: 'AWD Performance (100 kWh)', batterySize: 100, rangeKm: 544, rangeMiles: 338, priceEur: 44990, priceUsd: 47990 }
    ]
  },
  {
    id: 141, brand: 'Hyundai', model: 'IONIQ 9', description: '3-Row Family SUV', year: 2025,
    rangeKm: 620, rangeMiles: 385, batterySize: 110.3, priceEur: 59990, priceUsd: 62990,
    image: '/images/cars/hyundai-ioniq9.webp', specFile: 'hyundai-ioniq9.json',
    trims: [
      { name: 'Standard 2WD (110.3 kWh)', batterySize: 110.3, rangeKm: 620, rangeMiles: 385, priceEur: 59990, priceUsd: 62990 },
      { name: 'Long Range AWD (110.3 kWh)', batterySize: 110.3, rangeKm: 580, rangeMiles: 360, priceEur: 69990, priceUsd: 72990 },
      { name: 'Performance AWD N Line', batterySize: 110.3, rangeKm: 555, rangeMiles: 345, priceEur: 79990, priceUsd: 82990 }
    ]
  },
  {
    id: 142, brand: 'Hyundai', model: 'Casper Electric', description: 'Compact City EV', year: 2024,
    rangeKm: 315, rangeMiles: 196, batterySize: 49, priceEur: 28990, priceUsd: 31990,
    image: '/images/cars/hyundai-casper-electric.webp', specFile: 'hyundai-casper-electric.json',
    trims: [
      { name: 'Standard (35 kWh)', batterySize: 35, rangeKm: 237, rangeMiles: 147, priceEur: 24990, priceUsd: 26990 },
      { name: 'Long Range (49 kWh)', batterySize: 49, rangeKm: 315, rangeMiles: 196, priceEur: 28990, priceUsd: 31990 }
    ]
  },
  {
    id: 143, brand: 'Honda', model: 'Prologue', description: 'AWD Electric SUV', year: 2024,
    rangeKm: 476, rangeMiles: 296, batterySize: 85, priceEur: 48990, priceUsd: 47400,
    image: '/images/cars/honda-prologue.webp', specFile: 'honda-prologue.json',
    trims: [
      { name: 'EX AWD (85 kWh)', batterySize: 85, rangeKm: 476, rangeMiles: 296, priceEur: 48990, priceUsd: 47400 },
      { name: 'Touring AWD (85 kWh)', batterySize: 85, rangeKm: 476, rangeMiles: 296, priceEur: 54990, priceUsd: 53400 }
    ]
  },
  {
    id: 144, brand: 'Xpeng', model: 'G6', description: 'Ultra-Fast Charging SUV', year: 2024,
    rangeKm: 570, rangeMiles: 354, batterySize: 87.5, priceEur: 44990, priceUsd: 47990,
    image: '/images/cars/xpeng-g6.webp', specFile: 'xpeng-g6.json',
    trims: [
      { name: 'RWD Standard (66 kWh)', batterySize: 66, rangeKm: 435, rangeMiles: 270, priceEur: 39990, priceUsd: 41990 },
      { name: 'AWD Long Range (87.5 kWh)', batterySize: 87.5, rangeKm: 570, rangeMiles: 354, priceEur: 44990, priceUsd: 47990 },
      { name: 'AWD Performance (87.5 kWh)', batterySize: 87.5, rangeKm: 530, rangeMiles: 329, priceEur: 49990, priceUsd: 52990 }
    ]
  },
  {
    id: 145, brand: 'Škoda', model: 'Enyaq Coupe iV', description: 'RS SUV Coupe', year: 2024,
    rangeKm: 545, rangeMiles: 339, batterySize: 82, priceEur: 50990, priceUsd: 54990,
    image: '/images/cars/skoda-enyaq-coupe.webp', specFile: 'skoda-enyaq-coupe.json',
    trims: [
      { name: 'Coupe 60 (58 kWh)', batterySize: 58, rangeKm: 412, rangeMiles: 256, priceEur: 43990, priceUsd: 46990 },
      { name: 'Coupe 85x AWD (82 kWh)', batterySize: 82, rangeKm: 520, rangeMiles: 323, priceEur: 47990, priceUsd: 50990 },
      { name: 'Coupe RS (82 kWh)', batterySize: 82, rangeKm: 545, rangeMiles: 339, priceEur: 50990, priceUsd: 54990 }
    ]
  },
  {
    id: 146, brand: 'Volkswagen', model: 'ID.2', description: 'Affordable Entry EV', year: 2025,
    rangeKm: 450, rangeMiles: 280, batterySize: 56, priceEur: 24990, priceUsd: 27990,
    image: '/images/cars/vw-id2.webp', specFile: 'volkswagen-id2.json',
    trims: [
      { name: 'Standard (38 kWh)', batterySize: 38, rangeKm: 310, rangeMiles: 193, priceEur: 24990, priceUsd: 25990 },
      { name: 'Long Range (56 kWh)', batterySize: 56, rangeKm: 450, rangeMiles: 280, priceEur: 29990, priceUsd: 31990 }
    ]
  },
  {
    id: 147, brand: 'Porsche', model: 'Taycan Sport Turismo', description: '4S Electric Estate', year: 2024,
    rangeKm: 616, rangeMiles: 383, batterySize: 105, priceEur: 95990, priceUsd: 99900,
    image: '/images/cars/porsche-taycan-sport-turismo.webp', specFile: 'porsche-taycan-sport-turismo.json',
    trims: [
      { name: 'Sport Turismo (105 kWh)', batterySize: 105, rangeKm: 616, rangeMiles: 383, priceEur: 95990, priceUsd: 99900 },
      { name: '4S Sport Turismo (105 kWh)', batterySize: 105, rangeKm: 590, rangeMiles: 366, priceEur: 119990, priceUsd: 122900 },
      { name: 'Turbo Sport Turismo (105 kWh)', batterySize: 105, rangeKm: 543, rangeMiles: 337, priceEur: 169990, priceUsd: 172900 }
    ]
  },
  {
    id: 148, brand: 'Mazda', model: 'EZ-6', description: 'Electric Sedan', year: 2024,
    rangeKm: 552, rangeMiles: 343, batterySize: 68.8, priceEur: 41990, priceUsd: 44990,
    image: '/images/cars/mazda-ez6.webp', specFile: 'mazda-ez6.json',
    trims: [
      { name: 'EZ-6 Standard (68.8 kWh)', batterySize: 68.8, rangeKm: 552, rangeMiles: 343, priceEur: 41990, priceUsd: 44990 },
      { name: 'EZ-6 Premium (68.8 kWh)', batterySize: 68.8, rangeKm: 545, rangeMiles: 339, priceEur: 45990, priceUsd: 48990 }
    ]
  },
  {
    id: 149, brand: 'Renault', model: 'Kangoo E-Tech', description: 'Electric People Carrier', year: 2022,
    rangeKm: 300, rangeMiles: 186, batterySize: 45, priceEur: 35990, priceUsd: 39990,
    image: '/images/cars/renault-kangoo-e-tech.webp', specFile: 'renault-kangoo-e-tech.json',
    trims: [
      { name: 'EV45 (45 kWh)', batterySize: 45, rangeKm: 300, rangeMiles: 186, priceEur: 35990, priceUsd: 39990 },
      { name: 'EV45 Techno (45 kWh)', batterySize: 45, rangeKm: 300, rangeMiles: 186, priceEur: 38990, priceUsd: 41990 }
    ]
  }
];

// Append to DB
db.cars.push(...newCars);
writeFileSync(carsPath, JSON.stringify(db, null, 4), 'utf8');

// Sync to public and dist
const pubCarsPath = join(root, 'public', 'cars.json');
writeFileSync(pubCarsPath, JSON.stringify(db, null, 4), 'utf8');

const distCarsPath = join(root, 'dist', 'cars.json');
if (existsSync(distCarsPath)) {
  writeFileSync(distCarsPath, JSON.stringify(db, null, 4), 'utf8');
}

// Copy all new spec files to public/specs and dist/specs
import { readdirSync } from 'fs';
const specsDir = join(root, 'data', 'specs');
const pubSpecsDir = join(root, 'public', 'specs');
const distSpecsDir = join(root, 'dist', 'specs');

if (!existsSync(pubSpecsDir)) mkdirSync(pubSpecsDir, { recursive: true });
if (!existsSync(distSpecsDir)) mkdirSync(distSpecsDir, { recursive: true });

for (const f of readdirSync(specsDir)) {
  copyFileSync(join(specsDir, f), join(pubSpecsDir, f));
  if (existsSync(distSpecsDir)) copyFileSync(join(specsDir, f), join(distSpecsDir, f));
}

console.log(`✓ Total cars in DB: ${db.cars.length}`);
console.log(`✓ New cars added: ${newCars.length}`);
console.log(`✓ Spec files synced to public/ and dist/`);
