// Constants for calculations
const OPTIMAL_TEMP_MIN = 20;
const OPTIMAL_TEMP_MAX = 25;

class RangeCalculator {
    constructor() {
        this.useMetric = true; // Default to metric units (km/EUR)
        this.initializeElements();
        this.initializeEventListeners();
        this.loadCars();
    }

    initializeElements() {
        this.carSelector = document.getElementById('carModelSelector');
        this.carImage = document.getElementById('selectedCarImage');
        this.temperatureSlider = document.getElementById('temperatureSlider');
        this.temperatureValue = document.getElementById('temperatureValue');
        this.drivingStyles = document.querySelectorAll('input[name="drivingStyle"]');
        this.acCheckbox = document.getElementById('acCheckbox');
        this.rangeResult = document.getElementById('rangeResult');
        this.sliderTrack = document.getElementById('temperatureSliderTrack');
        this.unitSwitch = document.getElementById('unitSwitch');
        this.rangeUnit = document.getElementById('rangeUnit');
        this.priceUnit = document.querySelectorAll('.price-unit');
    }

    initializeEventListeners() {
        this.carSelector.addEventListener('change', () => this.updateCarSelection());
        this.temperatureSlider.addEventListener('input', () => this.updateTemperature());
        this.drivingStyles.forEach(radio => {
            radio.addEventListener('change', () => this.calculateRange());
        });
        this.acCheckbox.addEventListener('change', () => this.calculateRange());
        this.unitSwitch.addEventListener('change', () => this.handleUnitSwitch());
    }

    async loadCars() {
        try {
            const response = await fetch('/api/cars');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (!data || !data.cars || !Array.isArray(data.cars)) {
                throw new Error('Invalid data format');
            }
            this.cars = data.cars;
            this.populateCarSelector();
        } catch (error) {
            console.error('Error loading cars:', error);
            this.carSelector.innerHTML = '<option value="">Error loading cars</option>';
        }
    }

    populateCarSelector() {
        this.carSelector.innerHTML = '<option value="">Select a car</option>';
        if (this.cars && Array.isArray(this.cars)) {
            // Sort cars by brand and model
            const sortedCars = [...this.cars].sort((a, b) => {
                const brandCompare = a.brand.localeCompare(b.brand);
                return brandCompare !== 0 ? brandCompare : a.model.localeCompare(b.model);
            });
            
            sortedCars.forEach(car => {
                const option = document.createElement('option');
                option.value = car.id;
                option.textContent = `${car.brand} ${car.model} - ${car.description}`;
                this.carSelector.appendChild(option);
            });
        }
    }

    updateCarSelection() {
        const selectedCar = this.getSelectedCar();
        if (selectedCar) {
            this.carImage.src = selectedCar.image;
            this.carImage.alt = `${selectedCar.brand} ${selectedCar.model}`;
            this.carImage.style.display = 'block';
            this.calculateRange();
        } else {
            this.carImage.style.display = 'none';
            this.rangeResult.textContent = '0';
        }
    }

    updateTemperature() {
        const temp = parseInt(this.temperatureSlider.value);
        this.temperatureValue.textContent = `${temp}°C`;
        
        // Calculate the percentage for gradient
        const percentage = ((temp - (-30)) / (40 - (-30))) * 100;
        
        // Define colors for cold and warm
        const coldColor = '#89CFF0';  // Light blue
        const warmColor = '#FFB6B6';  // Light red/pink
        
        // Create gradient based on temperature
        if (temp <= 0) {
            // Cold gradient (blue shades)
            const gradient = `linear-gradient(90deg, ${coldColor} ${percentage}%, #E3F4FE ${percentage}%)`;
            this.sliderTrack.style.background = gradient;
        } else {
            // Warm gradient (red shades)
            const gradient = `linear-gradient(90deg, ${warmColor} ${percentage}%, #FFE4E1 ${percentage}%)`;
            this.sliderTrack.style.background = gradient;
        }
        
        this.calculateRange();
    }

    getSelectedCar() {
        const selectedId = parseInt(this.carSelector.value);
        return this.cars && Array.isArray(this.cars) ? this.cars.find(car => car.id === selectedId) : null;
    }

    calculateTempFactor(temp) {
        if (temp >= OPTIMAL_TEMP_MIN && temp <= OPTIMAL_TEMP_MAX) {
            return 1.0;
        } else if (temp <= 0) {
            return 0.7; // -30% efficiency in cold weather
        } else if (temp >= 35) {
            return 0.85; // -15% efficiency in hot weather
        } else {
            // Linear interpolation for temperatures between ranges
            if (temp < OPTIMAL_TEMP_MIN) {
                return 0.7 + (0.3 * (temp / OPTIMAL_TEMP_MIN));
            } else {
                return 1.0 - (0.15 * ((temp - OPTIMAL_TEMP_MAX) / (40 - OPTIMAL_TEMP_MAX)));
            }
        }
    }

    calculateStyleFactor(temp) {
        // Get the selected driving style
        const selectedStyle = document.querySelector('input[name="drivingStyle"]:checked').value;

        // Define impact percentages for different conditions
        const impactFactors = {
            eco: {
                normal: 1.15,     // +15% in normal conditions
                extreme: 1.10     // +10% in extreme conditions
            },
            normal: {
                normal: 1.0,      // baseline
                extreme: 1.0      // baseline
            },
            sport: {
                normal: 0.80,     // -20% in normal conditions
                extreme: 0.70     // -30% in extreme conditions
            }
        };

        // Determine if we're in extreme temperature conditions
        const isExtremeTemp = temp < 0 || temp > 35;

        // Get the appropriate factor based on style and conditions
        const condition = isExtremeTemp ? 'extreme' : 'normal';
        const factor = impactFactors[selectedStyle][condition];

        console.log(`Driving style: ${selectedStyle}, Temperature: ${temp}°C, Factor: ${factor}`);
        return factor;
    }

    calculateHvacFactor(temp) {
        if (!this.acCheckbox.checked) return 1.0;
        
        if (temp <= 0) {
            return 0.8; // Heating in cold weather has bigger impact
        } else if (temp >= 25) {
            return 0.9; // AC in hot weather has moderate impact
        }
        return 0.95; // Minimal impact in mild weather
    }

    calculateRange() {
        const selectedCar = this.getSelectedCar();
        if (!selectedCar) {
            this.rangeResult.textContent = '0';
            return;
        }

        const temp = parseInt(this.temperatureSlider.value);
        const tempFactor = this.calculateTempFactor(temp);
        const styleFactor = this.calculateStyleFactor(temp);
        const hvacFactor = this.calculateHvacFactor(temp);

        let estimatedRange = selectedCar.rangeKm * tempFactor * styleFactor * hvacFactor;
        
        // Convert to miles if using imperial units
        if (!this.useMetric) {
            estimatedRange = this.kmToMiles(estimatedRange);
        }

        // Animate the range update
        this.animateRangeUpdate(Math.round(estimatedRange));
    }

    animateRangeUpdate(newRange) {
        const currentRange = parseInt(this.rangeResult.textContent) || 0;
        const diff = newRange - currentRange;
        const steps = 20;
        const increment = diff / steps;
        let current = currentRange;
        let step = 0;

        const animate = () => {
            current += increment;
            step++;
            this.rangeResult.textContent = Math.round(current);
            
            if (step < steps) {
                requestAnimationFrame(animate);
            } else {
                this.rangeResult.textContent = newRange;
            }
        };

        animate();
    }

    // Unit conversion methods
    kmToMiles(km) {
        return km * 0.621371;
    }

    milesToKm(miles) {
        return miles / 0.621371;
    }

    handleUnitSwitch() {
        this.useMetric = !this.unitSwitch.checked;
        
        // Update unit displays
        this.rangeUnit.textContent = this.useMetric ? 'km' : 'mi';

        // Recalculate range with new units
        this.calculateRange();
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RangeCalculator();
});
