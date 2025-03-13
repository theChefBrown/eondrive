document.addEventListener('DOMContentLoaded', async () => {
    // Filter state
    let filterState = {
        makes: new Set(),
        priceRange: 100000,
        distanceRange: 800,
        sortBy: ''
    };

    // Cache original cars data
    let originalCars = [];
    const carGrid = document.getElementById('carGrid');
    const comparisonSection = document.getElementById('comparisonSection');
    const template = document.getElementById('carCardTemplate');
    const unitSwitch = document.getElementById('unitSwitch');
    const themeSwitch = document.getElementById('themeSwitch');
    const specModal = document.getElementById('specModal');
    const paginationContainer = document.getElementById('paginationContainer');
    
    let selectedCars = new Set();
    let useImperial = false;
    let currentPage = 1;
    const carsPerPage = 21;
    let allCars = [];

    // Filter Elements
    const makeFilterBtn = document.getElementById('makeFilterBtn');
    const makeFilterDropdown = document.getElementById('makeFilterDropdown');
    const makeFilterOptions = document.getElementById('makeFilterOptions');
    const priceRange = document.getElementById('priceRange');
    const distanceRange = document.getElementById('distanceRange');
    const sortBySelect = document.getElementById('sortBy');

    // Theme handling
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
        themeSwitch.checked = true;
    }

    themeSwitch.addEventListener('change', () => {
        document.documentElement.classList.toggle('dark');
    });

    // Unit conversion handling
    unitSwitch.addEventListener('change', (e) => {
        useImperial = e.target.checked;
        updateAllCards();
        updateComparison();
    });

    function formatPrice(car) {
        const price = useImperial ? car.priceUsd : car.priceEur;
        return price.toLocaleString();
    }

    function formatRange(car) {
        return useImperial ? car.rangeMiles : car.rangeKm;
    }

    function getUnitSymbols() {
        return {
            currency: useImperial ? '$' : '€',
            distance: useImperial ? 'miles' : 'km'
        };
    }

    // Modal handling
    window.closeModal = () => {
        specModal.classList.remove('flex');
        specModal.classList.add('hidden');
    };

    specModal.addEventListener('click', (e) => {
        if (e.target === specModal) {
            closeModal();
        }
    });

    async function showSpecifications(car) {
        try {
            console.log('Fetching specs for:', car.specFile);
            const response = await fetch(`/api/specs/${car.specFile}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const specs = await response.json();
            console.log('Received specs:', specs);
            
            const modalTitle = document.getElementById('modalTitle');
            const modalContent = document.getElementById('modalContent');
            
            modalTitle.textContent = `${car.brand} ${car.model} - Technical Specifications`;
            modalContent.innerHTML = '';

            // Create sections for each specification category
            for (const [category, items] of Object.entries(specs.specifications)) {
                const section = document.createElement('div');
                section.className = 'mb-6';
                section.innerHTML = `
                    <h4 class="text-lg font-semibold mb-2 dark:text-white">${category}</h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                        ${Object.entries(items).map(([key, value]) => `
                            <div class="flex justify-between py-1 border-b border-gray-200 dark:border-gray-700">
                                <span class="text-gray-600 dark:text-gray-400">${key}</span>
                                <span class="text-gray-900 dark:text-gray-200">${value}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                modalContent.appendChild(section);
            }

            specModal.classList.remove('hidden');
            specModal.classList.add('flex');
        } catch (error) {
            console.error('Error loading specifications:', error);
            alert('Failed to load car specifications. Please try again.');
        }
    }

    function initializeFilters() {
        // Get unique makes and their models
        const makes = new Map();
        originalCars.forEach(car => {
            if (!makes.has(car.brand)) {
                makes.set(car.brand, new Set());
            }
            makes.get(car.brand).add(car.model);
        });

        // Create make filter options
        makeFilterOptions.innerHTML = '';
        Array.from(makes.entries()).sort().forEach(([make, models]) => {
            const makeDiv = document.createElement('div');
            makeDiv.className = 'mb-2';
            makeDiv.innerHTML = `
                <label class="flex items-center space-x-2">
                    <input type="checkbox" class="make-checkbox form-checkbox h-4 w-4 text-blue-600" value="${make}">
                    <span class="text-sm text-gray-700 dark:text-gray-300">${make}</span>
                </label>
                <div class="ml-6 space-y-1 model-options hidden">
                    ${Array.from(models).sort().map(model => `
                        <label class="flex items-center space-x-2">
                            <input type="checkbox" class="model-checkbox form-checkbox h-3 w-3 text-blue-500" 
                                   data-make="${make}" value="${model}">
                            <span class="text-sm text-gray-600 dark:text-gray-400">${model}</span>
                        </label>
                    `).join('')}
                </div>
            `;
            makeFilterOptions.appendChild(makeDiv);
        });

        // Make filter dropdown toggle
        makeFilterBtn.addEventListener('click', () => {
            makeFilterDropdown.classList.toggle('hidden');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!makeFilterBtn.contains(e.target) && !makeFilterDropdown.contains(e.target)) {
                makeFilterDropdown.classList.add('hidden');
            }
        });

        // Make checkbox event listeners
        document.querySelectorAll('.make-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const makeDiv = e.target.closest('div');
                const modelOptions = makeDiv.querySelector('.model-options');
                const modelCheckboxes = makeDiv.querySelectorAll('.model-checkbox');

                modelOptions.classList.toggle('hidden', !e.target.checked);
                modelCheckboxes.forEach(modelCb => {
                    modelCb.checked = e.target.checked;
                    updateFilterState();
                });
            });
        });

        // Model checkbox event listeners
        document.querySelectorAll('.model-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateFilterState);
        });

        // Range slider event listeners
        priceRange.addEventListener('input', (e) => {
            document.getElementById('priceMin').textContent = `€${Number(e.target.value).toLocaleString()}`;
            filterState.priceRange = parseInt(e.target.value);
            applyFilters();
        });

        distanceRange.addEventListener('input', (e) => {
            document.getElementById('distanceMin').textContent = `${e.target.value} km`;
            filterState.distanceRange = parseInt(e.target.value);
            applyFilters();
        });

        // Sort event listener
        sortBySelect.addEventListener('change', (e) => {
            filterState.sortBy = e.target.value;
            applyFilters();
        });
    }

    function updateFilterState() {
        filterState.makes.clear();
        document.querySelectorAll('.model-checkbox:checked').forEach(checkbox => {
            filterState.makes.add(`${checkbox.dataset.make}|${checkbox.value}`);
        });
        applyFilters();
    }

    function applyFilters() {
        // Start with all cars
        allCars = [...originalCars];

        // Apply make/model filter
        if (filterState.makes.size > 0) {
            allCars = allCars.filter(car => {
                return filterState.makes.has(`${car.brand}|${car.model}`);
            });
        }

        // Apply price filter
        allCars = allCars.filter(car => {
            return useImperial ? car.priceUsd <= filterState.priceRange : car.priceEur <= filterState.priceRange;
        });

        // Apply distance filter
        allCars = allCars.filter(car => {
            return useImperial ? car.rangeMiles <= filterState.distanceRange : car.rangeKm <= filterState.distanceRange;
        });

        // Apply sorting
        if (filterState.sortBy) {
            allCars.sort((a, b) => {
                switch (filterState.sortBy) {
                    case 'price-asc':
                        return (useImperial ? a.priceUsd - b.priceUsd : a.priceEur - b.priceEur);
                    case 'price-desc':
                        return (useImperial ? b.priceUsd - a.priceUsd : b.priceEur - a.priceEur);
                    case 'range-desc':
                        return (useImperial ? b.rangeMiles - a.rangeMiles : b.rangeKm - a.rangeKm);
                    case 'battery-desc':
                        return b.batterySize - a.batterySize;
                    case 'name-asc':
                        return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
                    default:
                        return 0;
                }
            });
        }

        // Reset to first page and render
        currentPage = 1;
        renderPagination();
        renderCars();
    }

    async function fetchCars() {
        try {
            const response = await fetch('/api/cars');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            originalCars = data.cars;
            allCars = [...originalCars]; 
            console.log(`Loaded ${allCars.length} cars`);
            
            if (allCars && allCars.length > 0) {
                initializeFilters();
                renderPagination();
                renderCars(); 
            } else {
                if (carGrid) {
                    carGrid.innerHTML = '<p class="text-red-500 text-center col-span-3">No cars found.</p>';
                }
            }
        } catch (error) {
            console.error('Error fetching cars:', error);
            if (carGrid) {
                carGrid.innerHTML = '<p class="text-red-500 text-center col-span-3">Error loading cars. Please try again later.</p>';
            }
        }
    }

    function renderPagination() {
        if (!paginationContainer) {
            console.error('Pagination container not found');
            return;
        }

        const totalPages = Math.ceil(allCars.length / carsPerPage);
        
        // Clear existing pagination
        paginationContainer.innerHTML = '';
        
        // Create container for pagination controls
        const controls = document.createElement('div');
        controls.className = 'flex items-center justify-center space-x-4 mt-8 mb-8';
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '← Previous';
        prevButton.className = `px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`;
        prevButton.disabled = currentPage === 1;
        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderCars();
                renderPagination();
                // Smooth scroll to top of grid
                if (carGrid) {
                    carGrid.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };
        
        // Page numbers
        const pageNumbers = document.createElement('div');
        pageNumbers.className = 'flex items-center space-x-2';
        
        // Calculate which page numbers to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, currentPage + 2);
        
        // Always show at least 5 pages if available
        if (endPage - startPage < 4) {
            if (startPage === 1) {
                endPage = Math.min(5, totalPages);
            } else {
                startPage = Math.max(1, endPage - 4);
            }
        }
        
        // First page and ellipsis
        if (startPage > 1) {
            const firstPage = createPageButton(1);
            pageNumbers.appendChild(firstPage);
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'text-gray-600 dark:text-gray-400';
                pageNumbers.appendChild(ellipsis);
            }
        }
        
        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = createPageButton(i);
            pageNumbers.appendChild(pageButton);
        }
        
        // Last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.textContent = '...';
                ellipsis.className = 'text-gray-600 dark:text-gray-400';
                pageNumbers.appendChild(ellipsis);
            }
            const lastPage = createPageButton(totalPages);
            pageNumbers.appendChild(lastPage);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.innerHTML = 'Next →';
        nextButton.className = `px-4 py-2 rounded ${currentPage === totalPages ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white transition-colors`;
        nextButton.disabled = currentPage === totalPages;
        nextButton.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderCars();
                renderPagination();
                // Smooth scroll to top of grid
                if (carGrid) {
                    carGrid.scrollIntoView({ behavior: 'smooth' });
                }
            }
        };
        
        // Assemble pagination controls
        controls.appendChild(prevButton);
        controls.appendChild(pageNumbers);
        controls.appendChild(nextButton);
        paginationContainer.appendChild(controls);
    }

    function createPageButton(pageNum) {
        const button = document.createElement('button');
        button.textContent = pageNum;
        button.className = `w-10 h-10 rounded ${pageNum === currentPage ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900'} transition-colors`;
        button.onclick = () => {
            currentPage = pageNum;
            renderCars();
            renderPagination();
            // Smooth scroll to top of grid
            if (carGrid) {
                carGrid.scrollIntoView({ behavior: 'smooth' });
            }
        };
        return button;
    }

    function renderCars() {
        if (!carGrid || !template) {
            console.error('Required elements not found');
            return;
        }

        carGrid.innerHTML = ''; // Clear existing cars
        
        const startIndex = (currentPage - 1) * carsPerPage;
        const endIndex = startIndex + carsPerPage;
        const carsToShow = allCars.slice(startIndex, endIndex);
        
        carsToShow.forEach(car => {
            const clone = template.content.cloneNode(true);
            
            clone.querySelector('.car-name').textContent = `${car.brand} ${car.model}`;
            clone.querySelector('.car-range').textContent = formatRange(car);
            clone.querySelector('.car-battery').textContent = car.batterySize;
            clone.querySelector('.car-price').textContent = formatPrice(car);
            
            const img = clone.querySelector('.car-image');
            img.src = car.image;
            img.alt = `${car.brand} ${car.model}`;
            // img.onerror = () => {
            //     img.src = '/images/placeholder.jpg';
            //     img.alt = 'Car image not available';
            // };

            const compareBtn = clone.querySelector('.compare-btn');
            compareBtn.addEventListener('click', () => toggleComparison(car));

            const specsBtn = clone.querySelector('.specs-btn');
            specsBtn.addEventListener('click', () => showSpecifications(car));

            carGrid.appendChild(clone);
        });
    }

    function updateFilterUnits() {
        // Update price range labels
        const priceMinLabel = document.getElementById('priceMin');
        const priceMaxLabel = document.getElementById('priceMax');
        const currentPrice = priceRange.value;
        priceMinLabel.textContent = useImperial 
            ? `$${Number(currentPrice).toLocaleString()}` 
            : `€${Number(currentPrice).toLocaleString()}`;
        priceMaxLabel.textContent = useImperial ? '$100,000+' : '€100,000+';

        // Update distance range labels and values
        const distanceMinLabel = document.getElementById('distanceMin');
        const distanceMaxLabel = document.getElementById('distanceMax');
        const currentDistance = distanceRange.value;
        
        // Convert the range values
        if (useImperial) {
            distanceRange.min = '125'; // 200km in miles
            distanceRange.max = '500'; // 800km in miles
            distanceRange.step = '25';
            distanceRange.value = Math.round(currentDistance * 0.621371); // km to miles
            distanceMinLabel.textContent = `${distanceRange.value} mi`;
            distanceMaxLabel.textContent = '500+ mi';
        } else {
            distanceRange.min = '200';
            distanceRange.max = '800';
            distanceRange.step = '50';
            distanceRange.value = Math.round(currentDistance / 0.621371); // miles to km
            distanceMinLabel.textContent = `${distanceRange.value} km`;
            distanceMaxLabel.textContent = '800+ km';
        }

        // Update labels for distance range filter
        document.getElementById('distanceRangeLabel').textContent = 
            `Distance Range (${useImperial ? 'mi' : 'km'})`;

        // Update labels for price range filter
        document.getElementById('priceRangeLabel').textContent = 
            `Price Range (${useImperial ? '$' : '€'})`;

        // Re-apply filters with new units
        applyFilters();
    }

    function updateAllCards() {
        const units = getUnitSymbols();
        document.querySelectorAll('.currency-symbol').forEach(el => el.textContent = units.currency);
        document.querySelectorAll('.unit-distance').forEach(el => el.textContent = units.distance);
        
        // Update filters for new units
        updateFilterUnits();
        
        // Update visible car cards
        const startIndex = (currentPage - 1) * carsPerPage;
        const endIndex = Math.min(startIndex + carsPerPage, allCars.length);
        const visibleCars = allCars.slice(startIndex, endIndex);
        
        visibleCars.forEach((car, index) => {
            const card = carGrid.children[index];
            if (card) {
                card.querySelector('.car-range').textContent = formatRange(car);
                card.querySelector('.car-price').textContent = formatPrice(car);
            }
        });
    }

    function toggleComparison(car) {
        if (selectedCars.has(car)) {
            selectedCars.delete(car);
        } else {
            if (selectedCars.size >= 3) {
                alert('You can compare up to 3 cars at a time');
                return;
            }
            selectedCars.add(car);
        }
        updateComparison();
    }

    function updateComparison() {
        comparisonSection.innerHTML = '';
        
        if (selectedCars.size === 0) {
            comparisonSection.innerHTML = '<p class="text-gray-500 dark:text-gray-400">Select cars to compare their ranges</p>';
            return;
        }

        const units = getUnitSymbols();

        selectedCars.forEach(car => {
            const card = document.createElement('div');
            // Match the width of the main grid cards
            card.className = 'bg-white dark:bg-dark-card rounded-lg shadow p-4 w-full min-w-[300px] max-w-[400px] flex-none';
            card.innerHTML = `
                <div class="aspect-w-16 aspect-h-9 mb-4">
                    <img src="${car.image}" alt="${car.brand} ${car.model}" class="rounded-lg object-cover w-full h-64">
                </div>
                <h3 class="font-semibold dark:text-white">${car.brand} ${car.model}</h3>
                <div class="mt-2">
                    <div class="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Range:</span>
                        <span>${formatRange(car)} ${units.distance}</span>
                    </div>
                    <div class="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Battery:</span>
                        <span>${car.batterySize} kWh</span>
                    </div>
                    <div class="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>Price:</span>
                        <span>${units.currency}${formatPrice(car)}</span>
                    </div>
                    <div class="flex justify-between text-gray-600 dark:text-gray-300">
                        <span>${units.distance}/${units.currency} ratio:</span>
                        <span>${(formatRange(car) / (useImperial ? car.priceUsd : car.priceEur) * 1000).toFixed(2)}</span>
                    </div>
                </div>
                <button class="my-2 py-2 text-white hover:text-white dark:text-white dark:hover:text-white bg-red-500 px-4 rounded-lg shadow-lg w-full" onclick="removeFromComparison(${car.id})">
                    Remove
                </button>
            `;
            comparisonSection.appendChild(card);
        });
    }

    // Make removeFromComparison available globally
    window.removeFromComparison = (carId) => {
        selectedCars = new Set([...selectedCars].filter(car => car.id !== carId));
        updateComparison();
    };

    fetchCars();
});
