// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load heroes data and populate the grid
    const heroesGrid = document.querySelector('.heroes-grid');
    
    if (heroesGrid) {
        // Show loading state
        heroesGrid.innerHTML = `
            <div class="loading-indicator">
                <div class="spinner"></div>
                <p>Loading heroes...</p>
            </div>
        `;
        
        // Directly fetch from JSON file
        fetch('../../data/heroes.json')
            .then(response => response.json())
            .then(data => {
                // Clear loading indicator
                heroesGrid.innerHTML = '';
                
                // Display heroes in alternating layout
                data.heroes.forEach((hero, index) => {
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
    
    // Initialize filter and sort functionality
    function initializeFilters() {
        const provinceFilter = document.getElementById('province-filter');
        const sortBy = document.getElementById('sort-by');
        const heroSections = document.querySelectorAll('.hero-section');
        
        // Filter by province
        if (provinceFilter) {
            provinceFilter.addEventListener('change', function() {
                const selectedProvince = this.value;
                
                // If the default "Filter by Province" option is selected, show all
                if (this.selectedIndex === 0) {
                    heroSections.forEach((section, index) => {
                        section.style.display = 'block';
                        // Reset alternating pattern
                        if (index % 2 === 0) {
                            section.classList.remove('right');
                            section.classList.add('left');
                        } else {
                            section.classList.remove('left');
                            section.classList.add('right');
                        }
                    });
                    return;
                }
                
                // Filter and adjust classes for alternating pattern
                let visibleCount = 0;
                heroSections.forEach(section => {
                    if (selectedProvince === 'all' || section.dataset.province === selectedProvince) {
                        section.style.display = 'block';
                        
                        // Adjust alternating pattern based on visible count
                        if (visibleCount % 2 === 0) {
                            section.classList.remove('right');
                            section.classList.add('left');
                        } else {
                            section.classList.remove('left');
                            section.classList.add('right');
                        }
                        visibleCount++;
                    } else {
                        section.style.display = 'none';
                    }
                });
            });
        }
        
        // Sort functionality
        if (sortBy) {
            sortBy.addEventListener('change', function() {
                const selectedSort = this.value;
                const heroesGrid = document.querySelector('.heroes-grid');
                const sectionsArray = Array.from(heroSections);
                
                // Sort based on selected option
                if (this.selectedIndex === 0 || selectedSort === 'name') {
                    sectionsArray.sort((a, b) => {
                        const nameA = a.querySelector('h3').textContent.trim();
                        const nameB = b.querySelector('h3').textContent.trim();
                        return nameA.localeCompare(nameB);
                    });
                } else if (selectedSort === 'dob') {
                    sectionsArray.sort((a, b) => {
                        const yearA = parseInt(a.querySelector('.hero-lifespan').textContent.split('-')[0]);
                        const yearB = parseInt(b.querySelector('.hero-lifespan').textContent.split('-')[0]);
                        return yearA - yearB;
                    });
                }
                
                // Reappend sorted sections and update alternating pattern
                sectionsArray.forEach((section, index) => {
                    // Update alternating pattern
                    if (index % 2 === 0) {
                        section.classList.remove('right');
                        section.classList.add('left');
                    } else {
                        section.classList.remove('left');
                        section.classList.add('right');
                    }
                    heroesGrid.appendChild(section);
                });
            });
        }
    }
});