// Tibet Votes Page JavaScript

// Store all candidates data
let allCandidates = [];
let filteredCandidates = [];

// Pagination variables
let currentPage = 1;
const candidatesPerPage = 20;

// Helper function to format text with bullet points
function formatBulletPoints(text) {
    if (!text) return '';

    // Split by newlines
    const lines = text.split('\n').filter(line => line.trim());

    // Check if lines start with dash (bullet points)
    const hasBullets = lines.some(line => line.trim().startsWith('-'));

    if (hasBullets) {
        // Convert to HTML list
        const listItems = lines
            .map(line => line.trim().replace(/^-\s*/, ''))
            .filter(line => line)
            .map(line => `<li>${line}</li>`)
            .join('');
        return `<ul style="margin: 0; padding-left: 20px;">${listItems}</ul>`;
    } else {
        // Just replace newlines with <br>
        return text.replace(/\n/g, '<br>');
    }
}

// Toggle filters visibility (for mobile)
function toggleFilters() {
    const filterBar = document.getElementById('filter-bar');
    const toggleBtn = document.getElementById('filter-toggle-btn');

    if (filterBar.classList.contains('active')) {
        filterBar.classList.remove('active');
        toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Filters';
    } else {
        filterBar.classList.add('active');
        toggleBtn.innerHTML = '<i class="fas fa-times"></i> Close';
    }
}

// Switch between tabs
function switchTab(tabName, event) {
    // Hide all tab contents
    const allTabs = document.querySelectorAll('.tab-content');
    allTabs.forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all tab buttons
    const allButtons = document.querySelectorAll('.tab-button');
    allButtons.forEach(button => {
        button.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName + '-tab').classList.add('active');

    // Add active class to clicked button
    if (event && event.target) {
        event.target.classList.add('active');
        // Animate the slider to the active button
        animateSlider(event.target);
    }

    // Scroll to the content section (100vh from top, which is where content starts)
    const contentSection = document.querySelector('.content-section');
    if (contentSection) {
        // Get the absolute position of the content section
        const rect = contentSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetPosition = rect.top + scrollTop;

        // Smooth scroll to the content section
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
    }
}

// Animate the slider background
function animateSlider(activeButton) {
    const slider = document.querySelector('.tab-slider');
    const navigation = document.querySelector('.tab-navigation');

    if (!slider || !activeButton) return;

    // Get button position relative to navigation container
    const navRect = navigation.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    // Calculate position and size
    const left = buttonRect.left - navRect.left;
    const width = buttonRect.width;

    // Apply styles
    slider.style.width = width + 'px';
    slider.style.left = left + 'px';
}

// Initialize slider position
function initSlider() {
    const activeButton = document.querySelector('.tab-button.active');
    if (activeButton) {
        animateSlider(activeButton);
    }
}

// Load candidates from JSON
async function loadCandidates() {
    try {
        const response = await fetch('../../data/candidates.json');
        const data = await response.json();
        // Sort candidates alphabetically by name (default sort)
        allCandidates = data.candidates.sort((a, b) => a.name.localeCompare(b.name));
        filteredCandidates = [...allCandidates];
        displayCandidates();
        populateCompareSelectors();
    } catch (error) {
        console.error('Error loading candidates:', error);
        document.getElementById('candidates-grid').innerHTML =
            '<p style="color: var(--secondary-1); text-align: center; padding: 40px;">Error loading candidates. Please try again later.</p>';
    }
}

// Display candidates in the grid
function displayCandidates() {
    const grid = document.getElementById('candidates-grid');

    if (filteredCandidates.length === 0) {
        grid.innerHTML = '<p style="color: rgba(255, 255, 255, 0.6); text-align: center; padding: 40px; grid-column: 1 / -1;">No candidates found matching your filters.</p>';
        updatePagination();
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);
    const startIndex = (currentPage - 1) * candidatesPerPage;
    const endIndex = startIndex + candidatesPerPage;
    const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

    grid.innerHTML = paginatedCandidates.map(candidate => `
        <div class="candidate-card">
            <div class="candidate-photo" onclick="openCandidateModal(${candidate.id})" style="cursor: pointer;">
                ${candidate.photo ? `<img src="${candidate.photo}" alt="${candidate.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>';">` : '<i class="fas fa-user"></i>'}
            </div>
            <div class="candidate-info">
                <div class="candidate-name">${candidate.name}</div>

                <div class="candidate-badges">
                    <div class="candidate-badge">${candidate.representing}</div>
                    ${candidate.status ? `<div class="candidate-badge status-badge">${candidate.status}</div>` : ''}
                </div>

                <div class="candidate-details">
                    <div class="detail-row">
                        <span class="detail-label">Origin:</span>
                        <span class="detail-value">${candidate.origin}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Current Address:</span>
                        <span class="detail-value">${candidate.currentAddress || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Occupation:</span>
                        <span class="detail-value">${candidate.occupation}</span>
                    </div>
                </div>

                <div class="candidate-brief">${candidate.briefBio}</div>

                <button class="know-more-btn" onclick="openCandidateModal(${candidate.id})">
                    Know More
                </button>
            </div>
        </div>
    `).join('');

    updatePagination();
}

// Update pagination controls
function updatePagination() {
    const paginationContainer = document.getElementById('pagination-controls');

    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredCandidates.length / candidatesPerPage);

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '<div class="pagination">';

    // Previous button
    if (currentPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage - 1})">Previous</button>`;
    } else {
        paginationHTML += `<button class="pagination-btn" disabled>Previous</button>`;
    }

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            paginationHTML += `<button class="pagination-btn active">${i}</button>`;
        } else {
            paginationHTML += `<button class="pagination-btn" onclick="changePage(${i})">${i}</button>`;
        }
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span class="pagination-ellipsis">...</span>`;
        }
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `<button class="pagination-btn" onclick="changePage(${currentPage + 1})">Next</button>`;
    } else {
        paginationHTML += `<button class="pagination-btn" disabled>Next</button>`;
    }

    paginationHTML += '</div>';
    paginationContainer.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    currentPage = page;
    displayCandidates();

    // Scroll to top of candidates grid
    const grid = document.getElementById('candidates-grid');
    if (grid) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Filter candidates based on selected filters
// Toggle dropdown menu
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const header = dropdown.previousElementSibling;

    // Close all other dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu.id !== dropdownId) {
            menu.classList.remove('active');
            menu.previousElementSibling.classList.remove('active');
        }
    });

    // Toggle current dropdown
    dropdown.classList.toggle('active');
    header.classList.toggle('active');
}

// Update filter label to show selected count
function updateFilterLabel(filterType) {
    const dropdownId = filterType + '-dropdown';
    const labelId = filterType + '-label';
    const dropdown = document.getElementById(dropdownId);
    const label = document.getElementById(labelId);

    const checkboxes = dropdown.querySelectorAll('input[type="checkbox"]:checked');
    const count = checkboxes.length;

    let labelText = '';
    if (filterType === 'representing') {
        labelText = count > 0 ? `Representation (${count})` : 'Representation';
    } else if (filterType === 'age') {
        labelText = count > 0 ? `Age Group (${count})` : 'Age Group';
    } else if (filterType === 'gender') {
        labelText = count > 0 ? `Gender (${count})` : 'Gender';
    }

    label.textContent = labelText;
}

// Apply filters when Search button is clicked
function applyFilters() {
    // Get selected values from checkboxes
    const representingCheckboxes = document.querySelectorAll('#representing-dropdown input[type="checkbox"]:checked');
    const representingFilters = Array.from(representingCheckboxes).map(cb => cb.value);

    const ageCheckboxes = document.querySelectorAll('#age-dropdown input[type="checkbox"]:checked');
    const ageFilters = Array.from(ageCheckboxes).map(cb => cb.value);

    const genderCheckboxes = document.querySelectorAll('#gender-dropdown input[type="checkbox"]:checked');
    const genderFilters = Array.from(genderCheckboxes).map(cb => cb.value);

    const searchQuery = document.getElementById('name-search').value.toLowerCase().trim();

    filteredCandidates = allCandidates.filter(candidate => {
        // Filter by name search
        if (searchQuery && !candidate.name.toLowerCase().includes(searchQuery)) {
            return false;
        }

        // Filter by representing (multi-select - show if ANY selected value matches)
        if (representingFilters.length > 0 && !representingFilters.includes(candidate.representing)) {
            return false;
        }

        // Filter by age group (multi-select - show if ANY selected value matches)
        if (ageFilters.length > 0 && !ageFilters.includes(candidate.ageGroup)) {
            return false;
        }

        // Filter by gender (multi-select - show if ANY selected value matches)
        if (genderFilters.length > 0 && !genderFilters.includes(candidate.gender)) {
            return false;
        }

        return true;
    });

    // Reset to page 1 when filters change
    currentPage = 1;

    // Display filtered candidates
    displayCandidates();

    // Close all dropdowns
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.classList.remove('active');
        menu.previousElementSibling.classList.remove('active');
    });

    // Close filter panel on mobile
    const filterBar = document.getElementById('filter-bar');
    const toggleBtn = document.getElementById('filter-toggle-btn');
    if (filterBar && filterBar.classList.contains('active')) {
        filterBar.classList.remove('active');
        if (toggleBtn) {
            toggleBtn.innerHTML = '<i class="fas fa-filter"></i> Filters';
        }
    }
}

// Clear all filters and reset to default
function clearAllFilters() {
    // Reset search input
    document.getElementById('name-search').value = '';

    // Clear all checkboxes
    document.querySelectorAll('.dropdown-menu input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset all filter labels
    document.getElementById('representing-label').textContent = 'Representation';
    document.getElementById('age-label').textContent = 'Age Group';
    document.getElementById('gender-label').textContent = 'Gender';

    // Apply filters (which will show all candidates)
    applyFilters();
}

// Populate compare candidate selectors
function populateCompareSelectors() {
    const selector1 = document.getElementById('candidate-1');
    const selector2 = document.getElementById('candidate-2');

    if (!selector1 || !selector2) return;

    // Clear existing options except the first one
    selector1.innerHTML = '<option value="">-- Select Candidate --</option>';
    selector2.innerHTML = '<option value="">-- Select Candidate --</option>';

    // Add candidates to both selectors
    allCandidates.forEach(candidate => {
        const option1 = document.createElement('option');
        option1.value = candidate.id;
        option1.textContent = `${candidate.name} - ${candidate.representing}`;
        selector1.appendChild(option1);

        const option2 = document.createElement('option');
        option2.value = candidate.id;
        option2.textContent = `${candidate.name} - ${candidate.representing}`;
        selector2.appendChild(option2);
    });
}

// Update comparison display
function updateComparison() {
    const candidate1Id = document.getElementById('candidate-1').value;
    const candidate2Id = document.getElementById('candidate-2').value;
    const container = document.getElementById('comparison-container');

    // If neither candidate is selected, show placeholder
    if (!candidate1Id && !candidate2Id) {
        container.innerHTML = `
            <div class="comparison-placeholder">
                <i class="fas fa-user-friends" style="font-size: 4rem; color: var(--secondary-1); margin-bottom: 20px;"></i>
                <p>Select two candidates to begin comparison</p>
            </div>
        `;
        return;
    }

    // Find selected candidates
    const candidate1 = allCandidates.find(c => c.id == candidate1Id);
    const candidate2 = allCandidates.find(c => c.id == candidate2Id);

    // Build comparison HTML
    let html = '';

    if (candidate1) {
        html += createCompareCard(candidate1);
    }

    if (candidate2) {
        html += createCompareCard(candidate2);
    }

    // If only one candidate selected, show message
    if ((candidate1 && !candidate2) || (!candidate1 && candidate2)) {
        html += `
            <div class="comparison-placeholder">
                <i class="fas fa-user-plus" style="font-size: 3rem; color: var(--secondary-1); margin-bottom: 20px;"></i>
                <p>Select a second candidate to compare</p>
            </div>
        `;
    }

    container.innerHTML = html;
}

// Create a comparison card for a candidate
function createCompareCard(candidate) {
    return `
        <div class="candidate-compare-card">
            <div class="compare-card-header">
                <h3>${candidate.name}</h3>
                <div class="compare-representing">${candidate.representing}</div>
            </div>
            <div class="compare-details">
                <div class="compare-detail-row">
                    <div class="compare-detail-label">Age Group</div>
                    <div class="compare-detail-value">${candidate.ageGroup}</div>
                </div>
                <div class="compare-detail-row">
                    <div class="compare-detail-label">Gender</div>
                    <div class="compare-detail-value">${candidate.gender}</div>
                </div>
                <div class="compare-detail-row">
                    <div class="compare-detail-label">Origin</div>
                    <div class="compare-detail-value">${candidate.origin}</div>
                </div>
                <div class="compare-detail-row">
                    <div class="compare-detail-label">Current Address</div>
                    <div class="compare-detail-value">${candidate.currentAddress || '-'}</div>
                </div>
                <div class="compare-detail-row">
                    <div class="compare-detail-label">Occupation</div>
                    <div class="compare-detail-value">${candidate.occupation}</div>
                </div>
                <div class="compare-detail-row">
                    <div class="compare-detail-label">Brief Bio</div>
                    <div class="compare-detail-value">${candidate.briefBio}</div>
                </div>
                <div class="compare-detail-row">
                    <div class="compare-detail-label">Educational Background</div>
                    <div class="compare-detail-value">${formatBulletPoints(candidate.educationalBackground)}</div>
                </div>
                <div class="compare-detail-row">
                    <div class="compare-detail-label">Work Experience</div>
                    <div class="compare-detail-value">${formatBulletPoints(candidate.workExperience)}</div>
                </div>
                <div class="compare-detail-row">
                    <div class="compare-detail-label">Other Information</div>
                    <div class="compare-detail-value">${formatBulletPoints(candidate.otherInformation)}</div>
                </div>
            </div>
        </div>
    `;
}

// Clear candidate selection
function clearCandidate(candidateNumber) {
    const selector = document.getElementById(`candidate-${candidateNumber}`);
    if (selector) {
        selector.value = '';
        updateComparison();
    }
}

// Scroll to section in Voter Education
function scrollToSection(event, sectionId) {
    event.preventDefault();

    // Remove active class from all links
    document.querySelectorAll('.education-sidebar a').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to clicked link
    event.target.classList.add('active');

    // Scroll to the section
    const section = document.getElementById(sectionId);
    const content = document.getElementById('education-scroll-content');

    if (section && content) {
        // Get the bounding rectangles to calculate proper scroll position
        const contentRect = content.getBoundingClientRect();
        const sectionRect = section.getBoundingClientRect();

        // Calculate the position of the section relative to the scrollable container
        const scrollPosition = content.scrollTop + (sectionRect.top - contentRect.top);

        content.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
        });
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Load candidates data
    loadCandidates();

    // Initialize slider position
    setTimeout(() => {
        initSlider();
    }, 100);
});

// Reinitialize slider on window resize
window.addEventListener('resize', () => {
    initSlider();
});

// Reinitialize slider on scroll (for sticky positioning)
let scrollTimeout;
window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        initSlider();
    }, 50);
});

// Open candidate detail modal
function openCandidateModal(candidateId) {
    const candidate = allCandidates.find(c => c.id === candidateId);

    if (!candidate) {
        console.error('Candidate not found');
        return;
    }

    const modalContentArea = document.getElementById('modalContentArea');

    modalContentArea.innerHTML = `
        <div class="modal-header">
            <div class="modal-photo">
                ${candidate.photo ? `<img src="${candidate.photo}" alt="${candidate.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<i class=\\'fas fa-user\\'></i>';">` : '<i class="fas fa-user"></i>'}
            </div>
            <h2 class="modal-name">${candidate.name}</h2>
            <div class="modal-badges">
                <div class="modal-badge">${candidate.representing}</div>
                <div class="modal-badge">${candidate.gender}</div>
            </div>
            <div class="modal-quick-info">
                <div class="modal-info-item">
                    <span class="modal-info-label">Age Group:</span>
                    <span class="modal-info-value">${candidate.ageGroup}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Origin:</span>
                    <span class="modal-info-value">${candidate.origin}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Occupation:</span>
                    <span class="modal-info-value">${candidate.occupation}</span>
                </div>
                <div class="modal-info-item">
                    <span class="modal-info-label">Current Address:</span>
                    <span class="modal-info-value">${candidate.currentAddress || '-'}</span>
                </div>
            </div>
        </div>
        <div class="modal-body">
            <div class="modal-section">
                <h3><i class="fas fa-user-circle"></i> Brief Biography</h3>
                <p>${candidate.briefBio}</p>
            </div>
            <div class="modal-section">
                <h3><i class="fas fa-graduation-cap"></i> Educational Background</h3>
                <div>${formatBulletPoints(candidate.educationalBackground)}</div>
            </div>
            <div class="modal-section">
                <h3><i class="fas fa-briefcase"></i> Work Experience</h3>
                <div>${formatBulletPoints(candidate.workExperience)}</div>
            </div>
            <div class="modal-section">
                <h3><i class="fas fa-info-circle"></i> Other Information</h3>
                <div>${formatBulletPoints(candidate.otherInformation)}</div>
            </div>
        </div>
    `;

    // Show modal
    const modal = document.getElementById('candidateModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close candidate detail modal
function closeModal() {
    const modal = document.getElementById('candidateModal');
    modal.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('candidateModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Hide hero text on scroll
function handleHeroTextScroll() {
    const heroText = document.querySelector('.hero-content p');
    if (!heroText) return;

    // Get scroll position
    const scrollPosition = window.scrollY;
    // Use 50vh as the threshold (half of viewport height)
    const threshold = window.innerHeight * 0.5;

    if (scrollPosition > threshold) {
        heroText.style.opacity = '0';
        heroText.style.visibility = 'hidden';
    } else {
        // Calculate opacity based on scroll position (fade effect)
        const opacity = 1 - (scrollPosition / threshold);
        heroText.style.opacity = Math.max(0, opacity);
        heroText.style.visibility = 'visible';
    }
}

// Add scroll event listener
window.addEventListener('scroll', handleHeroTextScroll);

// Initialize on page load
handleHeroTextScroll();

// Close dropdowns when clicking outside
document.addEventListener('click', function(event) {
    // Check if click is outside dropdown
    if (!event.target.closest('.custom-dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(menu => {
            menu.classList.remove('active');
            menu.previousElementSibling.classList.remove('active');
        });
    }
});

// Toggle clear search button visibility
function toggleClearButton() {
    const searchInput = document.getElementById('name-search');
    const clearButton = document.getElementById('clear-search-btn');

    if (searchInput && clearButton) {
        if (searchInput.value.trim().length > 0) {
            clearButton.style.display = 'flex';
        } else {
            clearButton.style.display = 'none';
        }
    }
}

// Clear search input
function clearSearchInput() {
    const searchInput = document.getElementById('name-search');
    const clearButton = document.getElementById('clear-search-btn');

    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }

    if (clearButton) {
        clearButton.style.display = 'none';
    }
}

// Load candidates when page loads
loadCandidates();
