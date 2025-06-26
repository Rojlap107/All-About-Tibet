// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize back to top button
    initBackToTopButton();

    // Typing animation for hero text
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        const firstLine = "One Platform.";
        const secondLine = "Every Story.";
        let charIndex = 0;
        let currentLine = 1;
        
        // Create line elements
        const line1 = document.createElement('div');
        line1.className = 'typing-line';
        const line2 = document.createElement('div');
        line2.className = 'typing-line';
        
        // Add lines to the container
        typingText.appendChild(line1);
        typingText.appendChild(line2);
        
        function typeText() {
            if (currentLine === 1) {
                // Typing the first line
                if (charIndex < firstLine.length) {
                    const currentChar = firstLine.charAt(charIndex);
                    line1.textContent += currentChar;
                    charIndex++;
                    
                    // Determine the delay for the next character - faster now
                    let delay = 40;  // Base typing speed (milliseconds) - faster than before
                    
                    // Add minimal pause after punctuation
                    if (currentChar === '.' || currentChar === ',') {
                        delay = 100;  // Shorter pause after punctuation
                    } else if (currentChar === ' ') {
                        delay = 60;  // Shorter pause after spaces
                    }
                    
                    // Minimal random variation
                    delay += Math.random() * 20 - 10;
                    
                    setTimeout(typeText, delay);
                } else {
                    // First line complete, immediately start second line (no pause)
                    charIndex = 0;
                    currentLine = 2;
                    setTimeout(typeText, 20); // Minimal transition between lines
                }
            } else {
                // Typing the second line
                if (charIndex < secondLine.length) {
                    const currentChar = secondLine.charAt(charIndex);
                    line2.textContent += currentChar;
                    charIndex++;
                    
                    // Determine the delay for the next character - faster now
                    let delay = 40;  // Base typing speed (milliseconds) - faster than before
                    
                    // Add minimal pause after punctuation
                    if (currentChar === '.' || currentChar === ',') {
                        delay = 100;  // Shorter pause after punctuation
                    } else if (currentChar === ' ') {
                        delay = 60;  // Shorter pause after spaces
                    }
                    
                    // Minimal random variation
                    delay += Math.random() * 20 - 10;
                    
                    setTimeout(typeText, delay);
                } else {
                    // Animation completed - no cursor needed
                }
            }
        }
        
        // Start the typing animation almost immediately
        setTimeout(typeText, 200);
    }
    
    // Load heroes gallery on homepage if it exists
    const heroesGallery = document.querySelector('.heroes-gallery');
    if (heroesGallery) {
        fetch('data/heroes.json')
            .then(response => response.json())
            .then(data => {
                // Clear existing content
                heroesGallery.innerHTML = '';
                
                // Sort heroes by ID (highest to lowest)
                const allHeroes = data.heroes.sort((a, b) => (a.id > b.id) ? -1 : 1);
                
                // Display up to 10 heroes in the gallery
                const featuredHeroes = allHeroes.slice(0, 10);
                
                // Create hero profiles
                featuredHeroes.forEach(hero => {
                    const heroProfile = document.createElement('div');
                    heroProfile.className = 'hero-profile';
                    
                    heroProfile.innerHTML = `
                        <a href="pages/heroes/hero.html?id=${hero.id}">
                            <div class="image-container">
                                <img src="${hero.image}" alt="${hero.name}">
                            </div>
                            <h3>${hero.name}</h3>
                        </a>
                    `;
                    
                    heroesGallery.appendChild(heroProfile);
                });
            })
            .catch(error => {
                console.error('Error fetching heroes data:', error);
                heroesGallery.innerHTML = '<p>Unable to load heroes. Please check back later.</p>';
            });
    }
    
    // Load blog posts dynamically on the homepage
    const blogGrid = document.getElementById('blog-grid');
    if (blogGrid) {
        fetch('data/blogs.json')
            .then(response => response.json())
            .then(data => {
                // Clear existing content
                blogGrid.innerHTML = '';
                
                // Sort blogs by date (newest first)
                const sortedBlogs = [...data.blogs].sort((a, b) => {
                    const dateA = new Date(a.date);
                    const dateB = new Date(b.date);
                    return dateB - dateA;
                });
                
                // Display the latest 3 blog posts
                const latestPosts = sortedBlogs.slice(0, 3);
                
                latestPosts.forEach(post => {
                    const blogCard = document.createElement('div');
                    blogCard.className = 'blog-card';
                    
                    // Calculate reading time if not provided
                    let readTime = post.readTime;
                    if ((!post.readTime || post.readTime === '') && post.content) {
                        const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
                        const minutes = Math.ceil(wordCount / 200);
                        readTime = `${minutes} min read`;
                    } else if ((!post.readTime || post.readTime === '') && post.excerpt) {
                        const excerptWordCount = post.excerpt.split(/\s+/).length;
                        const minutes = Math.ceil(excerptWordCount / 200);
                        readTime = `${minutes} min read`;
                    }
                    
                    blogCard.innerHTML = `
                        <div class="blog-card-image-container">
                            <a href="pages/blog/${post.url}">
                                <img src="${post.image}" alt="${post.title}">
                            </a>
                        </div>
                        <div class="blog-content">
                            <h3><a href="pages/blog/${post.url}">${post.title}</a></h3>
                            <p>${post.excerpt}</p>
                            <div class="blog-meta">
                                <span class="author">${post.author}</span>
                                <span class="read-time">${readTime}</span>
                            </div>
                            <a href="pages/blog/${post.url}" class="read-more">Read More</a>
                        </div>
                    `;
                    
                    blogGrid.appendChild(blogCard);
                });
            })
            .catch(error => {
                console.error('Error fetching blog data:', error);
                blogGrid.innerHTML = '<p>Unable to load blog posts. Please try again later.</p>';
            });
    }
    
    // Menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const overlayMenu = document.querySelector('.overlay-menu');
    
    if (menuToggle && overlayMenu) {
        menuToggle.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event from bubbling to document
            this.classList.toggle('active');
            overlayMenu.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });
        
        // Handle dropdown click in the menu
        const dropdowns = overlayMenu.querySelectorAll('.dropdown');
        dropdowns.forEach(dropdown => {
            const dropdownLink = dropdown.querySelector('a');
            dropdownLink.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent navigation
                e.stopPropagation(); // Prevent event from bubbling
                dropdown.classList.toggle('active');
            });
        });
        
        // Close menu when a regular link is clicked (not dropdown toggles)
        const menuLinks = overlayMenu.querySelectorAll('li:not(.dropdown) > a, .submenu a');
        menuLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                overlayMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
        
        // Close menu when clicking on the overlay (outside of menu items)
        overlayMenu.addEventListener('click', function(e) {
            // Only close if clicked directly on the overlay, not on menu items
            if (e.target === overlayMenu) {
                menuToggle.classList.remove('active');
                overlayMenu.classList.remove('active');
                document.body.classList.remove('no-scroll');
            }
        });
    }
    
    // Handle logo size and visibility on scroll
    const logo = document.querySelector('.logo');
    const logoImg = document.querySelector('.logo img');
    const header = document.querySelector('header');
    let lastScrollTop = 0;
    
    if (logo && header) {
        // Check if current page is admin.html
        const isAdminPage = window.location.pathname.includes('admin.html');
        
        if (!isAdminPage) {
            window.addEventListener('scroll', function() {
                let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                
                // At threshold 1: Shrink the logo
                if (scrollTop > 50) {
                    if (logoImg) logoImg.style.maxHeight = '40px';
                    header.classList.add('scrolled');
                } else {
                    if (logoImg) logoImg.style.maxHeight = '60px';
                    header.classList.remove('scrolled');
                }
                
                // At threshold 2: Hide logo when scrolling down past threshold
                if (scrollTop > 100) {
                    logo.style.opacity = '0';
                    logo.style.transform = 'translateY(-20px)';
                } else {
                    logo.style.opacity = '1';
                    logo.style.transform = 'translateY(0)';
                }
                
                lastScrollTop = scrollTop;
            });
        }
    }
    
    // Add fade-in animation for elements when they enter viewport
    const fadeElements = document.querySelectorAll('.fade-in');
    if (fadeElements.length > 0) {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        fadeElements.forEach(element => {
            observer.observe(element);
        });
    }

    // Handle newsletter signup using Google Forms
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        // Check if we have a saved Google Form URL
        const googleFormUrl = localStorage.getItem('google_form_url');
        
        if (googleFormUrl) {
            // Replace form with Google Form
            newsletterForm.innerHTML = `
                <div class="google-form-container">
                    <a href="${googleFormUrl}" target="_blank" class="action-button">Subscribe to Newsletter</a>
                    <p class="form-note">Click the button to open our newsletter signup form</p>
                </div>
            `;
        } else {
            // Keep form but add a notice
            const submitBtn = newsletterForm.querySelector('button[type="submit"]');
            
            if (submitBtn) {
                // Prevent form submission
                newsletterForm.addEventListener('submit', function(e) {
                    e.preventDefault();
                    alert('Newsletter subscription is not set up yet. Please check back later.');
                });
            }
        }
    }

    // Function to initialize back to top button
    function initBackToTopButton() {
        // Create the back to top button element
        const backToTopButton = document.createElement('a');
        backToTopButton.className = 'back-to-top';
        backToTopButton.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        backToTopButton.setAttribute('aria-label', 'Back to top');
        backToTopButton.setAttribute('role', 'button');

        // Append to body
        document.body.appendChild(backToTopButton);

        // Show/hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('show');
            } else {
                backToTopButton.classList.remove('show');
            }
        });

        // Scroll to top when clicked
        backToTopButton.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});