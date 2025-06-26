// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load heroes data and populate the grid
    const heroesGrid = document.querySelector('.heroes-grid');
    const paginationContainer = document.querySelector('.pagination');
    
    // Pagination settings
    const heroesPerPage = 10;
    let currentPage = 1;
    let allHeroes = [];
    let filteredHeroes = [];
    
    if (heroesGrid) {
        // Show loading state
        heroesGrid.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading heroes...</p>
            </div>
        `;
        
        // Get page from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get('page');
        if (pageParam && !isNaN(parseInt(pageParam))) {
            currentPage = parseInt(pageParam);
        }
        
        // Directly fetch from JSON file
        fetch('../../data/heroes.json')
            .then(response => response.json())
            .then(data => {
                // Store all heroes
                allHeroes = data.heroes;
                filteredHeroes = [...allHeroes];
                
                // Display heroes for current page
                displayHeroesForPage(currentPage);
                
                // Setup pagination
                setupPagination();
                
                // Initialize filtering and sorting functionality
                initializeFilters();
            })
            .catch(error => {
                console.error('Error fetching heroes data:', error);
                heroesGrid.innerHTML = `
                    <div class="error-message">
                        <p>Unable to load heroes. Please try again later.</p>
                    </div>
                `;
            });
    }
    
    // Function to display heroes for the specified page
    function displayHeroesForPage(page) {
        // Clear previous content
        heroesGrid.innerHTML = '';
        
        // Calculate start and end index for current page
        const startIndex = (page - 1) * heroesPerPage;
        const endIndex = Math.min(startIndex + heroesPerPage, filteredHeroes.length);
        
        // Get heroes for current page
        const heroesForPage = filteredHeroes.slice(startIndex, endIndex);
        
        if (heroesForPage.length === 0) {
            heroesGrid.innerHTML = `
                <div class="error-message">
                    <p>No heroes found matching your criteria.</p>
                </div>
            `;
            return;
        }
        
        // Display heroes in alternating layout
        heroesForPage.forEach((hero, index) => {
            const isEven = index % 2 === 0;
            const position = isEven ? 'left' : 'right';
            
            // Create hero section wrapper
            const heroSection = document.createElement('div');
            heroSection.className = `hero-section ${position}`;
            heroSection.dataset.province = hero.province.toLowerCase().replace(/[^\w\s]/gi, '');
            
            // Link to full profile
            const heroLink = `hero.html?id=${hero.id}`;
            
            // Create content structure with image on alternating sides
            heroSection.innerHTML = `
                <div class="hero-container">
                    <div class="hero-image">
                        <img src="../../${hero.image}" alt="${hero.name}">
                    </div>
                    <div class="hero-content-side">
                        <div class="hero-content-inner">
                            <h3>${hero.name}</h3>
                            <div class="hero-meta">
                                <span class="hero-lifespan">${hero.lifespan}</span>
                                <span class="hero-province">${hero.province}</span>
                            </div>
                            <p class="hero-brief">${hero.brief}</p>
                            <a href="${heroLink}" class="view-profile-btn">View Full Profile</a>
                        </div>
                    </div>
                </div>
            `;
            
            heroesGrid.appendChild(heroSection);
        });
    }
    
    // Function to set up pagination controls
    function setupPagination() {
        if (!paginationContainer) return;
        
        // Clear current pagination
        paginationContainer.innerHTML = '';
        
        // Calculate number of pages
        const totalPages = Math.ceil(filteredHeroes.length / heroesPerPage);
        
        if (totalPages <= 1) {
            // Hide pagination if only one page
            paginationContainer.parentElement.style.display = 'none';
            return;
        } else {
            paginationContainer.parentElement.style.display = 'flex';
        }
        
        // Add previous button
        const prevButton = document.createElement('button');
        prevButton.className = `pagination-button ${currentPage === 1 ? 'disabled' : ''}`;
        prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
        prevButton.setAttribute('aria-label', 'Previous page');
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                navigateToPage(currentPage - 1);
            }
        });
        paginationContainer.appendChild(prevButton);
        
        // Determine which page buttons to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);
        
        // Adjust start if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }
        
        // Add first page button if not starting at 1
        if (startPage > 1) {
            const firstButton = document.createElement('button');
            firstButton.className = 'pagination-button';
            firstButton.textContent = '1';
            firstButton.addEventListener('click', () => navigateToPage(1));
            paginationContainer.appendChild(firstButton);
            
            // Add ellipsis if needed
            if (startPage > 2) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
        }
        
        // Add page buttons
        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `pagination-button ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => navigateToPage(i));
            paginationContainer.appendChild(pageButton);
        }
        
        // Add last page button if not ending at last page
        if (endPage < totalPages) {
            // Add ellipsis if needed
            if (endPage < totalPages - 1) {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'pagination-ellipsis';
                ellipsis.textContent = '...';
                paginationContainer.appendChild(ellipsis);
            }
            
            const lastButton = document.createElement('button');
            lastButton.className = 'pagination-button';
            lastButton.textContent = totalPages;
            lastButton.addEventListener('click', () => navigateToPage(totalPages));
            paginationContainer.appendChild(lastButton);
        }
        
        // Add next button
        const nextButton = document.createElement('button');
        nextButton.className = `pagination-button ${currentPage === totalPages ? 'disabled' : ''}`;
        nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
        nextButton.setAttribute('aria-label', 'Next page');
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                navigateToPage(currentPage + 1);
            }
        });
        paginationContainer.appendChild(nextButton);
        
        // Add page info
        const paginationInfo = document.createElement('div');
        paginationInfo.className = 'pagination-info';
        paginationInfo.textContent = `Showing ${Math.min(filteredHeroes.length, (currentPage-1)*heroesPerPage+1)}-${Math.min(filteredHeroes.length, currentPage*heroesPerPage)} of ${filteredHeroes.length} heroes`;
        paginationContainer.parentElement.appendChild(paginationInfo);
    }
    
    // Function to navigate to a specific page
    function navigateToPage(page) {
        // Update URL without reloading the page
        const url = new URL(window.location);
        url.searchParams.set('page', page);
        window.history.pushState({}, '', url);
        
        // Update current page and display heroes
        currentPage = page;
        displayHeroesForPage(currentPage);
        
        // Update pagination
        setupPagination();
        
        // Scroll to top of heroes grid
        heroesGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Initialize filter and sort functionality
    function initializeFilters() {
        const provinceFilter = document.getElementById('province-filter');
        const sortBy = document.getElementById('sort-by');
        
        // Province filter temporarily disabled
        /* 
        if (provinceFilter) {
            provinceFilter.addEventListener('change', function() {
                const selectedProvince = this.value;
                
                // Filter heroes based on province
                if (selectedProvince === 'all' || this.selectedIndex === 0) {
                    filteredHeroes = [...allHeroes];
                } else {
                    filteredHeroes = allHeroes.filter(hero => 
                        hero.province.toLowerCase().replace(/[^\w\s]/gi, '') === selectedProvince
                    );
                }
                
                // Reset to first page and update display
                currentPage = 1;
                displayHeroesForPage(currentPage);
                setupPagination();
            });
        }
        */
        
        // Sort functionality
        if (sortBy) {
            sortBy.addEventListener('change', function() {
                const selectedSort = this.value;
                
                // Sort based on selected option
                if (this.selectedIndex === 0 || selectedSort === 'name') {
                    filteredHeroes.sort((a, b) => a.name.localeCompare(b.name));
                } else if (selectedSort === 'dob') {
                    filteredHeroes.sort((a, b) => {
                        const yearA = parseInt(a.lifespan.split('-')[0]);
                        const yearB = parseInt(b.lifespan.split('-')[0]);
                        return yearA - yearB;
                    });
                } else if (selectedSort === 'recent') {
                    filteredHeroes.sort((a, b) => b.id - a.id);
                }
                
                // Update display with sorted heroes
                displayHeroesForPage(currentPage);
            });
        }
    }
});