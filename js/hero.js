document.addEventListener('DOMContentLoaded', function() {
    // Get hero ID from URL parameter (e.g., hero.html?id=1)
    const urlParams = new URLSearchParams(window.location.search);
    const heroId = urlParams.get('id');
    
    if (!heroId) {
        document.getElementById('hero-profile-container').innerHTML = `
            <div class="error-message">
                <p>No hero ID specified. Please return to the <a href="index.html">Heroes of Tibet page</a>.</p>
            </div>
        `;
        document.getElementById('other-heroes').style.display = 'none';
        return;
    }
    
    // Fetch heroes directly from JSON file
    fetch('../../data/heroes.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Find the requested hero
            const hero = data.heroes.find(h => h.id == heroId);
            
            if (!hero) {
                document.getElementById('hero-profile-container').innerHTML = `
                    <div class="error-message">
                        <p>Hero profile not found. Please return to the <a href="index.html">Heroes of Tibet page</a>.</p>
                    </div>
                `;
                document.getElementById('other-heroes').style.display = 'none';
                return;
            }
            
            // Update document title
            document.title = `${hero.name} - Heroes of Tibet`;
            
            // Populate the hero profile content
            document.getElementById('hero-profile-container').innerHTML = `
                <div class="hero-header">
                    <div class="hero-header-content">
                        <div class="hero-title">
                            <h1>${hero.name}</h1>
                            <div class="hero-life-span">${hero.lifespan}</div>
                        </div>
                        <div class="hero-meta">
                            <div class="hero-meta-item">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${hero.province} Province</span>
                            </div>
                        </div>
                        <div class="hero-bio">
                            <h2>Brief Introduction</h2>
                            <p>${hero.brief}</p>
                        </div>
                    </div>
                    <div class="hero-image">
                        <img src="../../${hero.image}" alt="${hero.name}">
                    </div>
                </div>
                
                <!-- Back to heroes link -->
                <div style="margin-bottom: 30px;">
                    <a href="index.html" style="display: inline-flex; align-items: center; color: var(--secondary-1); text-decoration: none;">
                        <i class="fas fa-arrow-left" style="margin-right: 10px;"></i>
                        Back to Heroes of Tibet
                    </a>
                </div>
                
                <div class="hero-sections">
                    <div class="hero-section">
                        <div class="section-title">
                            <h2>Early Childhood</h2>
                        </div>
                        <div class="section-content">
                            ${hero.background.earlyLife}
                        </div>
                    </div>
                    
                    <div class="hero-section">
                        <div class="section-title">
                            <h2>Impact on Tibetan Struggle</h2>
                        </div>
                        <div class="section-content">
                            ${hero.background.impact}
                        </div>
                    </div>
                    
                    <div class="hero-section">
                        <div class="section-title">
                            <h2>Legacy</h2>
                        </div>
                        <div class="section-content">
                            ${hero.background.legacy}
                        </div>
                    </div>
                </div>
            `;
            
            // Populate other heroes (excluding current hero)
            const otherHeroes = data.heroes
                .filter(h => h.id != heroId)
                .slice(0, 4);  // Get up to 4 other heroes
            
            const otherHeroesHTML = otherHeroes.map(otherHero => `
                <div class="other-hero-card">
                    <a href="hero.html?id=${otherHero.id}">
                        <div class="other-hero-img">
                            <img src="../../${otherHero.image}" alt="${otherHero.name}">
                        </div>
                        <div class="other-hero-card-content">
                            <h3>${otherHero.name}</h3>
                            <div class="hero-meta-mini">
                                <span>${otherHero.province}</span> | <span>${otherHero.lifespan}</span>
                            </div>
                        </div>
                    </a>
                </div>
            `).join('');
            
            document.getElementById('other-heroes-grid').innerHTML = otherHeroesHTML;
            
            // If no other heroes, hide the section
            if (otherHeroes.length === 0) {
                document.getElementById('other-heroes').style.display = 'none';
            }
        })
        .catch(error => {
            console.error('Error fetching hero data:', error);
            document.getElementById('hero-profile-container').innerHTML = `
                <div class="error-message">
                    <p>Unable to load hero profile. Please try again later.</p>
                </div>
            `;
            document.getElementById('other-heroes').style.display = 'none';
        });
});