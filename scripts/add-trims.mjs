// scripts/add-trims.mjs
// Adds accurate multi-trim data to every car in data/cars.json that has variants
import { readFileSync, writeFileSync } from 'fs'

// Map from car ID → trims array (only cars with 2+ meaningful options)
const TRIMS = {
  1: [ // Tesla Model 3 Long Range
    { name: 'RWD',              batterySize: 57.5, rangeKm: 513, rangeMiles: 319, priceEur: 39990, priceUsd: 42990 },
    { name: 'Long Range RWD',   batterySize: 82,   rangeKm: 702, rangeMiles: 436, priceEur: 49990, priceUsd: 52990 },
    { name: 'Long Range AWD',   batterySize: 82,   rangeKm: 629, rangeMiles: 391, priceEur: 52990, priceUsd: 55990 },
    { name: 'Performance',      batterySize: 82,   rangeKm: 528, rangeMiles: 328, priceEur: 57990, priceUsd: 61990 },
  ],
  2: [ // Hyundai IONIQ 5
    { name: 'SR RWD (58 kWh)', batterySize: 58,   rangeKm: 384, rangeMiles: 239, priceEur: 37900, priceUsd: 40900 },
    { name: 'LR RWD (77 kWh)', batterySize: 77.4, rangeKm: 507, rangeMiles: 315, priceEur: 44900, priceUsd: 47900 },
    { name: 'LR AWD (77 kWh)', batterySize: 77.4, rangeKm: 488, rangeMiles: 303, priceEur: 48900, priceUsd: 52900 },
  ],
  3: [ // Ford Mustang Mach-E
    { name: 'Select 70 kWh',   batterySize: 70,   rangeKm: 440, rangeMiles: 274, priceEur: 42990, priceUsd: 39995 },
    { name: 'Ext. Range RWD',  batterySize: 91,   rangeKm: 600, rangeMiles: 373, priceEur: 49990, priceUsd: 42995 },
    { name: 'Ext. Range AWD',  batterySize: 91,   rangeKm: 490, rangeMiles: 305, priceEur: 54990, priceUsd: 49995 },
    { name: 'GT Performance',  batterySize: 91,   rangeKm: 490, rangeMiles: 304, priceEur: 64990, priceUsd: 59995 },
  ],
  4: [ // VW ID.4
    { name: 'Pure (52 kWh)',   batterySize: 52,   rangeKm: 347, rangeMiles: 216, priceEur: 36990, priceUsd: 38995 },
    { name: 'Pro RWD',         batterySize: 77,   rangeKm: 529, rangeMiles: 329, priceEur: 44990, priceUsd: 45995 },
    { name: 'Pro AWD',         batterySize: 77,   rangeKm: 497, rangeMiles: 309, priceEur: 49990, priceUsd: 48995 },
    { name: 'GTX AWD',         batterySize: 77,   rangeKm: 497, rangeMiles: 309, priceEur: 54990, priceUsd: 49995 },
  ],
  5: [ // Kia EV6
    { name: 'SR (58 kWh)',     batterySize: 58,   rangeKm: 394, rangeMiles: 245, priceEur: 37990, priceUsd: 38995 },
    { name: 'LR RWD',          batterySize: 77.4, rangeKm: 528, rangeMiles: 328, priceEur: 41590, priceUsd: 45995 },
    { name: 'LR AWD',          batterySize: 77.4, rangeKm: 506, rangeMiles: 314, priceEur: 47990, priceUsd: 52995 },
  ],
  6: [ // Tesla Model S
    { name: 'Long Range',      batterySize: 100,  rangeKm: 652, rangeMiles: 405, priceEur: 89990, priceUsd: 74990 },
    { name: 'Plaid',           batterySize: 100,  rangeKm: 600, rangeMiles: 373, priceEur: 107990, priceUsd: 99990 },
  ],
  7: [ // Tesla Model X
    { name: 'Long Range',      batterySize: 100,  rangeKm: 576, rangeMiles: 358, priceEur: 99990, priceUsd: 79990 },
    { name: 'Plaid',           batterySize: 100,  rangeKm: 543, rangeMiles: 337, priceEur: 117990, priceUsd: 109990 },
  ],
  8: [ // Tesla Model Y
    { name: 'RWD',             batterySize: 60,   rangeKm: 455, rangeMiles: 283, priceEur: 44990, priceUsd: 44990 },
    { name: 'Long Range AWD',  batterySize: 82,   rangeKm: 533, rangeMiles: 331, priceEur: 54990, priceUsd: 52990 },
    { name: 'Performance',     batterySize: 82,   rangeKm: 514, rangeMiles: 319, priceEur: 59990, priceUsd: 57990 },
  ],
  9: [ // BMW i4
    { name: 'eDrive35',        batterySize: 70.2, rangeKm: 483, rangeMiles: 300, priceEur: 49900, priceUsd: 47900 },
    { name: 'eDrive40',        batterySize: 83.9, rangeKm: 590, rangeMiles: 367, priceEur: 58900, priceUsd: 57900 },
    { name: 'M50 xDrive',      batterySize: 83.9, rangeKm: 521, rangeMiles: 324, priceEur: 79900, priceUsd: 77900 },
  ],
  10: [ // BMW iX
    { name: 'xDrive40',        batterySize: 76.6,  rangeKm: 425, rangeMiles: 264, priceEur: 77300, priceUsd: 76000 },
    { name: 'xDrive50',        batterySize: 111.5, rangeKm: 630, rangeMiles: 391, priceEur: 98600, priceUsd: 97100 },
    { name: 'M60',             batterySize: 111.5, rangeKm: 566, rangeMiles: 352, priceEur: 133000, priceUsd: 131000 },
  ],
  11: [ // Porsche Taycan
    { name: 'Standard Battery',batterySize: 79.2, rangeKm: 590, rangeMiles: 367, priceEur: 94813, priceUsd: 90900 },
    { name: '4S',              batterySize: 93.4, rangeKm: 598, rangeMiles: 372, priceEur: 123713, priceUsd: 115000 },
    { name: 'Turbo',           batterySize: 105,  rangeKm: 562, rangeMiles: 349, priceEur: 169003, priceUsd: 160400 },
    { name: 'Turbo S',         batterySize: 105,  rangeKm: 584, rangeMiles: 363, priceEur: 196004, priceUsd: 194500 },
  ],
  12: [ // Audi e-tron GT
    { name: 'e-tron GT',       batterySize: 93.4, rangeKm: 487, rangeMiles: 303, priceEur: 105000, priceUsd: 107900 },
    { name: 'RS e-tron GT',    batterySize: 93.4, rangeKm: 472, rangeMiles: 293, priceEur: 148000, priceUsd: 150000 },
    { name: 'RS Performance',  batterySize: 105,  rangeKm: 609, rangeMiles: 378, priceEur: 175000, priceUsd: 177000 },
  ],
  13: [ // Mercedes EQS
    { name: 'EQS 350',         batterySize: 107.8, rangeKm: 688, rangeMiles: 428, priceEur: 99900, priceUsd: 99900 },
    { name: 'EQS 450+',        batterySize: 107.8, rangeKm: 800, rangeMiles: 497, priceEur: 109551, priceUsd: 104400 },
    { name: 'EQS 450 4MATIC',  batterySize: 107.8, rangeKm: 682, rangeMiles: 424, priceEur: 115000, priceUsd: 110000 },
    { name: 'EQS 580 4MATIC',  batterySize: 107.8, rangeKm: 723, rangeMiles: 449, priceEur: 135000, priceUsd: 129000 },
  ],
  14: [ // VW ID.3
    { name: 'Tour (58 kWh)',   batterySize: 58,   rangeKm: 426, rangeMiles: 265, priceEur: 35990, priceUsd: 35990 },
    { name: 'Pro S (77 kWh)',  batterySize: 77,   rangeKm: 549, rangeMiles: 341, priceEur: 42990, priceUsd: 41795 },
  ],
  15: [ // Hyundai IONIQ 6
    { name: 'SR RWD (53 kWh)', batterySize: 53,   rangeKm: 429, rangeMiles: 267, priceEur: 37900, priceUsd: 34615 },
    { name: 'LR RWD (77 kWh)', batterySize: 77.4, rangeKm: 614, rangeMiles: 382, priceEur: 43900, priceUsd: 38615 },
    { name: 'LR AWD (77 kWh)', batterySize: 77.4, rangeKm: 583, rangeMiles: 362, priceEur: 49900, priceUsd: 44615 },
  ],
  16: [ // BMW i7
    { name: 'eDrive60',        batterySize: 101.7, rangeKm: 625, rangeMiles: 388, priceEur: 116900, priceUsd: 105700 },
    { name: 'xDrive60',        batterySize: 101.7, rangeKm: 591, rangeMiles: 367, priceEur: 126900, priceUsd: 119700 },
    { name: 'M70 xDrive',      batterySize: 101.7, rangeKm: 560, rangeMiles: 348, priceEur: 185900, priceUsd: 184900 },
  ],
  17: [ // BMW i5
    { name: 'eDrive40',        batterySize: 81.2, rangeKm: 582, rangeMiles: 362, priceEur: 66300, priceUsd: 65900 },
    { name: 'xDrive40',        batterySize: 84,   rangeKm: 516, rangeMiles: 321, priceEur: 72800, priceUsd: 72300 },
    { name: 'M60 xDrive',      batterySize: 84,   rangeKm: 455, rangeMiles: 283, priceEur: 111200, priceUsd: 110700 },
  ],
  18: [ // BMW iX1
    { name: 'eDrive20',        batterySize: 64.7, rangeKm: 440, rangeMiles: 274, priceEur: 43900, priceUsd: 43400 },
    { name: 'xDrive30',        batterySize: 64.7, rangeKm: 417, rangeMiles: 259, priceEur: 48100, priceUsd: 47600 },
  ],
  19: [ // BMW iX2
    { name: 'eDrive20',        batterySize: 64.7, rangeKm: 449, rangeMiles: 279, priceEur: 48900, priceUsd: 48400 },
    { name: 'xDrive30',        batterySize: 64.7, rangeKm: 417, rangeMiles: 259, priceEur: 52900, priceUsd: 52400 },
  ],
  21: [ // Mercedes EQA
    { name: 'EQA 250+',        batterySize: 70.5, rangeKm: 560, rangeMiles: 348, priceEur: 52297, priceUsd: 50000 },
    { name: 'EQA 350 4MATIC',  batterySize: 70.5, rangeKm: 461, rangeMiles: 287, priceEur: 60000, priceUsd: 58000 },
  ],
  22: [ // Mercedes EQB
    { name: 'EQB 250+',        batterySize: 70.5, rangeKm: 520, rangeMiles: 323, priceEur: 53000, priceUsd: 50000 },
    { name: 'EQB 350 4MATIC',  batterySize: 70.5, rangeKm: 487, rangeMiles: 303, priceEur: 60680, priceUsd: 58000 },
  ],
  24: [ // Mercedes EQE
    { name: 'EQE 300',         batterySize: 90.6, rangeKm: 631, rangeMiles: 392, priceEur: 73000, priceUsd: 70000 },
    { name: 'EQE 350+',        batterySize: 90.6, rangeKm: 660, rangeMiles: 410, priceEur: 80609, priceUsd: 75000 },
    { name: 'EQE 500 4MATIC',  batterySize: 90.6, rangeKm: 574, rangeMiles: 357, priceEur: 94000, priceUsd: 89000 },
  ],
  25: [ // Mercedes EQE SUV
    { name: 'EQE SUV 350+',          batterySize: 90.6, rangeKm: 590, rangeMiles: 367, priceEur: 79000, priceUsd: 75000 },
    { name: 'EQE SUV 500 4MATIC',    batterySize: 90.6, rangeKm: 516, rangeMiles: 321, priceEur: 95000, priceUsd: 90000 },
  ],
  26: [ // VW ID.5
    { name: 'Pro RWD',         batterySize: 77,   rangeKm: 530, rangeMiles: 329, priceEur: 45990, priceUsd: 45990 },
    { name: 'GTX AWD',         batterySize: 77,   rangeKm: 497, rangeMiles: 309, priceEur: 55990, priceUsd: 55990 },
  ],
  27: [ // VW ID. Buzz
    { name: 'Pro (77 kWh)',    batterySize: 77,   rangeKm: 423, rangeMiles: 263, priceEur: 54990, priceUsd: 59995 },
    { name: 'LWB Pro+',        batterySize: 86,   rangeKm: 461, rangeMiles: 286, priceEur: 73990, priceUsd: 69995 },
  ],
  28: [ // VW ID.7
    { name: 'Pro (77 kWh)',    batterySize: 77,   rangeKm: 621, rangeMiles: 386, priceEur: 55990, priceUsd: 55990 },
    { name: 'Pro S (91 kWh)',  batterySize: 91,   rangeKm: 709, rangeMiles: 441, priceEur: 62990, priceUsd: 62990 },
    { name: 'GTX AWD',         batterySize: 86,   rangeKm: 621, rangeMiles: 386, priceEur: 63990, priceUsd: 63990 },
  ],
  29: [ // Audi Q4 e-tron
    { name: '40 (52 kWh)',     batterySize: 52,   rangeKm: 347, rangeMiles: 216, priceEur: 39900, priceUsd: 41900 },
    { name: '45 RWD',          batterySize: 82,   rangeKm: 541, rangeMiles: 336, priceEur: 46900, priceUsd: 48900 },
    { name: '50 quattro AWD',  batterySize: 82,   rangeKm: 520, rangeMiles: 323, priceEur: 53900, priceUsd: 55900 },
  ],
  30: [ // Audi Q8 e-tron
    { name: 'Q8 50 e-tron',    batterySize: 95,   rangeKm: 491, rangeMiles: 305, priceEur: 78900, priceUsd: 80900 },
    { name: 'Q8 55 e-tron',    batterySize: 114,  rangeKm: 582, rangeMiles: 362, priceEur: 92900, priceUsd: 94900 },
    { name: 'SQ8 e-tron',      batterySize: 114,  rangeKm: 494, rangeMiles: 307, priceEur: 108900, priceUsd: 110900 },
  ],
  31: [ // Škoda Enyaq
    { name: 'Enyaq 50',        batterySize: 62,   rangeKm: 380, rangeMiles: 236, priceEur: 38990, priceUsd: 38490 },
    { name: 'Enyaq 60',        batterySize: 77,   rangeKm: 534, rangeMiles: 332, priceEur: 44990, priceUsd: 44490 },
    { name: 'Enyaq 85x AWD',   batterySize: 82,   rangeKm: 545, rangeMiles: 339, priceEur: 50990, priceUsd: 50490 },
    { name: 'iV RS',           batterySize: 82,   rangeKm: 545, rangeMiles: 339, priceEur: 58990, priceUsd: 58490 },
  ],
  32: [ // CUPRA Born
    { name: '58 kWh',          batterySize: 58,   rangeKm: 476, rangeMiles: 296, priceEur: 34990, priceUsd: 34490 },
    { name: '77 kWh',          batterySize: 77,   rangeKm: 540, rangeMiles: 335, priceEur: 37990, priceUsd: 37490 },
    { name: 'e-Boost 82 kWh',  batterySize: 82,   rangeKm: 570, rangeMiles: 354, priceEur: 42990, priceUsd: 42490 },
  ],
  33: [ // Porsche Macan Electric
    { name: '4 (100 kWh)',     batterySize: 100,  rangeKm: 613, rangeMiles: 381, priceEur: 81853, priceUsd: 75000 },
    { name: '4S (100 kWh)',    batterySize: 100,  rangeKm: 591, rangeMiles: 367, priceEur: 95000, priceUsd: 90000 },
    { name: 'Turbo',           batterySize: 100,  rangeKm: 575, rangeMiles: 357, priceEur: 115000, priceUsd: 109000 },
  ],
  34: [ // BYD Atto 3
    { name: 'Standard (50 kWh)', batterySize: 49.92, rangeKm: 320, rangeMiles: 199, priceEur: 32990, priceUsd: 32490 },
    { name: 'Extended (60 kWh)', batterySize: 60.5,  rangeKm: 420, rangeMiles: 261, priceEur: 37990, priceUsd: 37490 },
  ],
  35: [ // BYD Seal
    { name: 'SR RWD (58 kWh)', batterySize: 58.56, rangeKm: 520, rangeMiles: 323, priceEur: 39990, priceUsd: 39490 },
    { name: 'LR RWD (82 kWh)', batterySize: 82.56, rangeKm: 570, rangeMiles: 354, priceEur: 44990, priceUsd: 44490 },
    { name: 'Perf. AWD',       batterySize: 82.56, rangeKm: 520, rangeMiles: 323, priceEur: 49990, priceUsd: 49490 },
  ],
  36: [ // BYD Dolphin
    { name: 'Standard (45 kWh)', batterySize: 44.9, rangeKm: 340, rangeMiles: 211, priceEur: 29990, priceUsd: 29490 },
    { name: 'Boost (60 kWh)',    batterySize: 60.4, rangeKm: 427, rangeMiles: 265, priceEur: 34990, priceUsd: 34490 },
  ],
  37: [ // MG4
    { name: 'Standard (64 kWh)', batterySize: 64,   rangeKm: 435, rangeMiles: 270, priceEur: 27990, priceUsd: 27490 },
    { name: 'Extended (77 kWh)', batterySize: 77,   rangeKm: 520, rangeMiles: 323, priceEur: 31990, priceUsd: 31490 },
    { name: 'Trophy Extended',   batterySize: 77,   rangeKm: 515, rangeMiles: 320, priceEur: 35490, priceUsd: 34990 },
  ],
  38: [ // MG ZS EV
    { name: 'Standard (51 kWh)', batterySize: 51,   rangeKm: 320, rangeMiles: 199, priceEur: 31990, priceUsd: 31490 },
    { name: 'LR (72.6 kWh)',     batterySize: 72.6, rangeKm: 440, rangeMiles: 274, priceEur: 36990, priceUsd: 36490 },
  ],
  39: [ // MG Marvel R
    { name: 'Performance RWD',   batterySize: 70,   rangeKm: 402, rangeMiles: 250, priceEur: 35990, priceUsd: 35490 },
    { name: 'Performance AWD',   batterySize: 70,   rangeKm: 370, rangeMiles: 230, priceEur: 39990, priceUsd: 39490 },
  ],
  40: [ // Renault Megane E-Tech
    { name: 'EV40 (40 kWh)',     batterySize: 40,   rangeKm: 300, rangeMiles: 186, priceEur: 33490, priceUsd: 32990 },
    { name: 'EV60 Comfort',      batterySize: 60,   rangeKm: 450, rangeMiles: 280, priceEur: 37990, priceUsd: 37490 },
    { name: 'EV60 Optimum',      batterySize: 60,   rangeKm: 470, rangeMiles: 292, priceEur: 40490, priceUsd: 39990 },
  ],
  44: [ // Smart #1
    { name: 'Pure (62 kWh)',    batterySize: 62,   rangeKm: 400, rangeMiles: 249, priceEur: 36990, priceUsd: 36490 },
    { name: 'Pro+ (66 kWh)',    batterySize: 66,   rangeKm: 420, rangeMiles: 261, priceEur: 40990, priceUsd: 40490 },
    { name: 'BRABUS',           batterySize: 66,   rangeKm: 400, rangeMiles: 249, priceEur: 47990, priceUsd: 47490 },
  ],
  45: [ // Smart #3
    { name: 'Pro+ (66 kWh)',    batterySize: 66,   rangeKm: 455, rangeMiles: 283, priceEur: 40990, priceUsd: 40490 },
    { name: 'BRABUS',           batterySize: 66,   rangeKm: 440, rangeMiles: 273, priceEur: 49990, priceUsd: 49490 },
  ],
  49: [ // Toyota bZ4X
    { name: 'FWD (71.4 kWh)',   batterySize: 71.4, rangeKm: 516, rangeMiles: 321, priceEur: 42990, priceUsd: 42990 },
    { name: 'AWD (71.4 kWh)',   batterySize: 71.4, rangeKm: 466, rangeMiles: 290, priceEur: 46990, priceUsd: 46990 },
  ],
  50: [ // Lexus RZ
    { name: 'RZ 300e FWD',      batterySize: 71.4, rangeKm: 480, rangeMiles: 299, priceEur: 57900, priceUsd: 56900 },
    { name: 'RZ 450e AWD',      batterySize: 71.4, rangeKm: 440, rangeMiles: 274, priceEur: 63900, priceUsd: 61150 },
  ],
  52: [ // Genesis GV60
    { name: 'SR RWD',           batterySize: 58,   rangeKm: 381, rangeMiles: 237, priceEur: 47900, priceUsd: 41350 },
    { name: 'LR RWD',           batterySize: 77.4, rangeKm: 481, rangeMiles: 299, priceEur: 53900, priceUsd: 47350 },
    { name: 'LR AWD',           batterySize: 77.4, rangeKm: 451, rangeMiles: 280, priceEur: 57900, priceUsd: 51350 },
    { name: 'Sport Plus AWD',   batterySize: 77.4, rangeKm: 432, rangeMiles: 268, priceEur: 65900, priceUsd: 59350 },
  ],
  55: [ // Volvo EX30
    { name: 'Core (51 kWh)',    batterySize: 51,   rangeKm: 344, rangeMiles: 214, priceEur: 34990, priceUsd: 37990 },
    { name: 'Plus (69 kWh)',    batterySize: 69,   rangeKm: 480, rangeMiles: 298, priceEur: 40990, priceUsd: 43990 },
    { name: 'Perf. AWD',        batterySize: 69,   rangeKm: 460, rangeMiles: 286, priceEur: 48990, priceUsd: 51990 },
  ],
  56: [ // Volvo EX90
    { name: 'Plus AWD',         batterySize: 107,  rangeKm: 580, rangeMiles: 360, priceEur: 84990, priceUsd: 84990 },
    { name: 'Ultra AWD',        batterySize: 107,  rangeKm: 590, rangeMiles: 367, priceEur: 92990, priceUsd: 91990 },
    { name: 'Perf. AWD',        batterySize: 107,  rangeKm: 560, rangeMiles: 348, priceEur: 105990, priceUsd: 101990 },
  ],
  57: [ // Volvo C40 Recharge
    { name: 'Single Motor RWD', batterySize: 82,   rangeKm: 520, rangeMiles: 323, priceEur: 50890, priceUsd: 49890 },
    { name: 'Twin Motor AWD',   batterySize: 78,   rangeKm: 465, rangeMiles: 289, priceEur: 57890, priceUsd: 56890 },
  ],
  58: [ // Volvo XC40 Recharge
    { name: 'Standard (52 kWh)', batterySize: 52,  rangeKm: 417, rangeMiles: 259, priceEur: 40990, priceUsd: 40990 },
    { name: 'Extended (82 kWh)', batterySize: 82,  rangeKm: 534, rangeMiles: 332, priceEur: 51990, priceUsd: 51990 },
    { name: 'Twin Motor AWD',    batterySize: 78,  rangeKm: 484, rangeMiles: 301, priceEur: 57990, priceUsd: 57990 },
  ],
  59: [ // Polestar 2
    { name: 'SR Single Motor',  batterySize: 69,   rangeKm: 496, rangeMiles: 308, priceEur: 44990, priceUsd: 44990 },
    { name: 'LR Single Motor',  batterySize: 82,   rangeKm: 635, rangeMiles: 395, priceEur: 54990, priceUsd: 54990 },
    { name: 'LR Dual Motor',    batterySize: 82,   rangeKm: 592, rangeMiles: 368, priceEur: 60990, priceUsd: 60990 },
    { name: 'Performance',      batterySize: 82,   rangeKm: 575, rangeMiles: 357, priceEur: 69990, priceUsd: 67900 },
  ],
  60: [ // Polestar 3
    { name: 'Long Range',       batterySize: 111,  rangeKm: 628, rangeMiles: 390, priceEur: 89990, priceUsd: 89990 },
    { name: 'LR Performance',   batterySize: 111,  rangeKm: 600, rangeMiles: 373, priceEur: 97990, priceUsd: 97990 },
  ],
  61: [ // Polestar 4
    { name: 'SR RWD',           batterySize: 94,   rangeKm: 543, rangeMiles: 337, priceEur: 59990, priceUsd: 59990 },
    { name: 'LR RWD',           batterySize: 100,  rangeKm: 614, rangeMiles: 382, priceEur: 69990, priceUsd: 69990 },
    { name: 'LR Performance',   batterySize: 100,  rangeKm: 590, rangeMiles: 367, priceEur: 79990, priceUsd: 75900 },
  ],
  63: [ // Fisker Ocean
    { name: 'Sport (71 kWh)',   batterySize: 71.4, rangeKm: 440, rangeMiles: 273, priceEur: 37499, priceUsd: 37499 },
    { name: 'Ultra (113 kWh)',  batterySize: 113,  rangeKm: 707, rangeMiles: 440, priceEur: 63999, priceUsd: 63999 },
    { name: 'Extreme AWD',      batterySize: 113,  rangeKm: 630, rangeMiles: 391, priceEur: 68999, priceUsd: 68999 },
  ],
  64: [ // Lucid Air
    { name: 'Pure',             batterySize: 88,   rangeKm: 644, rangeMiles: 400, priceEur: 77900, priceUsd: 70000 },
    { name: 'Grand Touring',    batterySize: 112,  rangeKm: 837, rangeMiles: 520, priceEur: 138900, priceUsd: 138000 },
    { name: 'Sapphire',         batterySize: 118,  rangeKm: 715, rangeMiles: 444, priceEur: 247000, priceUsd: 249000 },
  ],
  69: [ // Peugeot e-3008
    { name: 'SR (73 kWh)',      batterySize: 73,   rangeKm: 527, rangeMiles: 327, priceEur: 42990, priceUsd: 42490 },
    { name: 'LR (98 kWh)',      batterySize: 98,   rangeKm: 700, rangeMiles: 435, priceEur: 51990, priceUsd: 51490 },
  ],
  71: [ // Fiat 500e
    { name: 'Action (24 kWh)', batterySize: 23.8, rangeKm: 190, rangeMiles: 118, priceEur: 24990, priceUsd: 24490 },
    { name: 'Passion (42 kWh)',batterySize: 42,   rangeKm: 320, rangeMiles: 199, priceEur: 29990, priceUsd: 29490 },
    { name: 'La Prima Cabrio', batterySize: 42,   rangeKm: 310, rangeMiles: 193, priceEur: 37990, priceUsd: 37490 },
  ],
  74: [ // MINI Cooper SE
    { name: 'SE (29 kWh)',     batterySize: 28.9, rangeKm: 235, rangeMiles: 146, priceEur: 33900, priceUsd: 30900 },
    { name: 'E (40.7 kWh)',    batterySize: 40.7, rangeKm: 305, rangeMiles: 190, priceEur: 36900, priceUsd: 33900 },
  ],
  75: [ // MINI Aceman
    { name: 'E (42.5 kWh)',    batterySize: 42.5, rangeKm: 310, rangeMiles: 193, priceEur: 36900, priceUsd: 35900 },
    { name: 'SE (54.2 kWh)',   batterySize: 54.2, rangeKm: 406, rangeMiles: 252, priceEur: 40900, priceUsd: 39900 },
  ],
}

// Read, update, and write both JSON files
const data = JSON.parse(readFileSync('data/cars.json', 'utf8'))
let added = 0
for (const car of data.cars) {
  const trims = TRIMS[car.id]
  if (trims) {
    car.trims = trims
    added++
  }
}
writeFileSync('data/cars.json', JSON.stringify(data, null, 2))
writeFileSync('public/cars.json', JSON.stringify(data, null, 2))
console.log(`Done — added trims to ${added} cars.`)
