// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load blog posts dynamically
    const blogMain = document.getElementById('blog-main');
    const topicsList = document.getElementById('topics-list');
    const searchForm = document.querySelector('.search-form');
    const searchInput = document.querySelector('.search-form input');
    let allBlogData = null;
    let activeFilter = null;
    
    // Load blog data and initialize everything
    loadBlogData()
        .then(data => {
            allBlogData = data;
            displayBlogPosts(data.blogs);
            initializeTopics(data.blogs);
            initializeSearch();
        })
        .catch(error => {
            console.error('Error initializing blog page:', error);
            showError();
        });
    
    // Function to load blog data directly from JSON file
    function loadBlogData() {
        return fetch('../../data/blogs.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            });
    }
    
    // Function to display blog posts
    function displayBlogPosts(posts, filter = null) {
        if (!blogMain) return;
        
        // Clear loading indicator
        blogMain.innerHTML = '';
        
        // Sort posts by date (newest first)
        const sortedPosts = [...posts].sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
        });
        
        // Filter posts if a tag filter is provided
        const filteredPosts = filter ? 
            sortedPosts.filter(post => post.tags && post.tags.includes(filter)) : 
            sortedPosts;
        
        if (filteredPosts.length === 0) {
            blogMain.innerHTML = `
                <div class="message">
                    <p>No posts found for the selected topics</p>
                    <button id="clear-filter" class="action-button">Show All Posts</button>
                </div>
            `;
            
            // Add event listener to clear filter button
            const clearFilterBtn = document.getElementById('clear-filter');
            if (clearFilterBtn) {
                clearFilterBtn.addEventListener('click', function() {
                    displayBlogPosts(allBlogData.blogs);
                    
                    // Reset tag highlight
                    const tags = document.querySelectorAll('.topic-tag');
                    tags.forEach(tag => tag.classList.remove('active'));
                    
                    // Clear selected tags array if it exists in the outer scope
                    if (typeof selectedTags !== 'undefined') {
                        selectedTags = [];
                    }
                    
                    activeFilter = null;
                });
            }
            
            return;
        }
        
        // Display filtered blog posts
        filteredPosts.forEach(post => {
            const blogPost = document.createElement('article');
            blogPost.className = 'blog-post';
            
            // Calculate reading time if not provided
            let readTime = post.readTime;
            if ((!post.readTime || post.readTime === '') && post.content) {
                // Calculate based on average reading speed of 200 words per minute
                const wordCount = post.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
                const minutes = Math.ceil(wordCount / 200);
                readTime = `${minutes} min read`;
            } else if ((!post.readTime || post.readTime === '') && post.excerpt) {
                // Estimate based on excerpt if full content not available
                const excerptWordCount = post.excerpt.split(/\s+/).length;
                const minutes = Math.ceil(excerptWordCount / 200);
                readTime = `${minutes} min read`;
            }
            
            blogPost.innerHTML = `
                <div class="blog-post-image">
                    <a href="${post.url}">
                        <img src="../../${post.image}" alt="${post.title}">
                    </a>
                </div>
                <div class="blog-post-content">
                    <h2><a href="${post.url}">${post.title}</a></h2>
                    <p>${post.excerpt}</p>
                    <div class="blog-post-meta">
                        <div class="author-date">
                            <span>By ${post.author}</span>
                            <span>${post.date}</span>
                        </div>
                        <span>${readTime}</span>
                    </div>
                    ${post.tags ? `
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                    ` : ''}
                    <a href="${post.url}" class="read-more">Continue Reading</a>
                </div>
            `;
            
            blogMain.appendChild(blogPost);
        });
    }
    
    // Function to initialize topics from blog posts
    function initializeTopics(posts) {
        if (!topicsList) return;
        
        // Extract all unique tags from posts
        const allTags = new Set();
        posts.forEach(post => {
            if (post.tags && Array.isArray(post.tags)) {
                post.tags.forEach(tag => allTags.add(tag));
            }
        });
        
        // Sort tags alphabetically
        const sortedTags = Array.from(allTags).sort();
        
        // Clear loading indicator
        topicsList.innerHTML = '';
        
        // Add a reset button at the top
        const resetButton = document.createElement('button');
        resetButton.className = 'topic-tag reset-tags';
        resetButton.textContent = 'Reset All';
        resetButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Clear all filters
            displayBlogPosts(allBlogData.blogs);
            activeFilter = null;
            
            // Remove active class from all tags
            document.querySelectorAll('.topic-tag').forEach(t => t.classList.remove('active'));
            
            // Clear selected tags array
            selectedTags = [];
        });
        topicsList.appendChild(resetButton);
        
        // Track selected tags for multi-select
        let selectedTags = [];
        
        // Create and append tag elements
        sortedTags.forEach(tag => {
            const tagElement = document.createElement('a');
            tagElement.href = '#';
            tagElement.className = 'topic-tag';
            tagElement.textContent = tag;
            tagElement.dataset.tag = tag;
            
            // Add event listener for tag filtering
            tagElement.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Toggle tag in selected tags array
                const tagIndex = selectedTags.indexOf(tag);
                if (tagIndex > -1) {
                    // Tag is already selected, remove it
                    selectedTags.splice(tagIndex, 1);
                    tagElement.classList.remove('active');
                } else {
                    // Tag is not selected, add it
                    selectedTags.push(tag);
                    tagElement.classList.add('active');
                }
                
                // If no tags are selected, show all posts
                if (selectedTags.length === 0) {
                    displayBlogPosts(allBlogData.blogs);
                    activeFilter = null;
                } else {
                    // Filter posts that have ANY of the selected tags (OR filter)
                    const filteredPosts = allBlogData.blogs.filter(post => {
                        if (!post.tags) return false;
                        return selectedTags.some(tag => post.tags.includes(tag));
                    });
                    
                    displayBlogPosts(filteredPosts);
                }
            });
            
            topicsList.appendChild(tagElement);
        });
    }
    
    // Function to initialize search functionality
    function initializeSearch() {
        if (!searchForm || !searchInput) return;
        
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const searchTerm = searchInput.value.trim().toLowerCase();
            
            if (!searchTerm) {
                // If search is empty, show all posts
                displayBlogPosts(allBlogData.blogs);
                return;
            }
            
            // Search in title, content, excerpt, and author
            const searchResults = allBlogData.blogs.filter(post => {
                const title = post.title ? post.title.toLowerCase() : '';
                const content = post.content ? post.content.toLowerCase() : '';
                const excerpt = post.excerpt ? post.excerpt.toLowerCase() : '';
                const author = post.author ? post.author.toLowerCase() : '';
                const tags = post.tags ? post.tags.join(' ').toLowerCase() : '';
                
                return title.includes(searchTerm) || 
                       content.includes(searchTerm) || 
                       excerpt.includes(searchTerm) || 
                       author.includes(searchTerm) ||
                       tags.includes(searchTerm);
            });
            
            // Display search results and clear any active tag filters
            displayBlogPosts(searchResults);
            document.querySelectorAll('.topic-tag').forEach(tag => tag.classList.remove('active'));
            
            // Add a search results message above the posts
            const searchInfo = document.createElement('div');
            searchInfo.className = 'search-results-info';
            searchInfo.innerHTML = `
                <p>Found ${searchResults.length} result${searchResults.length !== 1 ? 's' : ''} for "${searchTerm}"</p>
                <button id="clear-search" class="action-button">Clear Search</button>
            `;
            
            blogMain.insertBefore(searchInfo, blogMain.firstChild);
            
            // Add event listener to clear search button
            const clearSearchBtn = document.getElementById('clear-search');
            if (clearSearchBtn) {
                clearSearchBtn.addEventListener('click', function() {
                    searchInput.value = '';
                    displayBlogPosts(allBlogData.blogs);
                });
            }
        });
    }
    
    // Function to display error message
    function showError() {
        if (blogMain) {
            blogMain.innerHTML = `
                <div class="error-message">
                    <p>Unable to load blog posts. Please try again later.</p>
                </div>
            `;
        }
        
        if (topicsList) {
            topicsList.innerHTML = `
                <div class="error-message">
                    <p>Unable to load topics.</p>
                </div>
            `;
        }
    }
});