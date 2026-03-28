// ==================== TraveLux – Travel Recommendation Application ====================
// This file handles page navigation, search functionality, and contact form submission

// ==================== GLOBAL VARIABLES ====================
let travelData = null;

// ==================== PAGE NAVIGATION ====================
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById('page-' + pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update active link in navigation
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.dataset.page === pageId) {
            link.classList.add('active-link');
        } else {
            link.classList.remove('active-link');
        }
    });
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Hide results section when leaving home page
    if (pageId !== 'home') {
        const resultsSection = document.getElementById('results-section');
        if (resultsSection) {
            resultsSection.classList.remove('active');
        }
    }
}

// ==================== FETCH TRAVEL DATA ====================
async function fetchTravelData() {
    try {
        const response = await fetch('travel_recommendation_api.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log('Travel data loaded successfully:', data);
        travelData = data;
        return data;
    } catch (error) {
        console.error('Error fetching travel data:', error);
        return null;
    }
}

// ==================== CREATE RESULT CARD ====================
function createResultCard(place, index) {
    const card = document.createElement('div');
    card.className = 'result-card';
    card.style.animationDelay = `${index * 0.08}s`;
    
    // Handle missing or placeholder images
    let imageUrl = place.imageUrl;
    if (!imageUrl || imageUrl.includes('enter_your_image')) {
        // Use fallback images based on place type or name
        const fallbackImages = {
            'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800&q=80',
            'Melbourne': 'https://images.unsplash.com/photo-1514395462725-fb4566210144?w=800&q=80',
            'Tokyo': 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&q=80',
            'Kyoto': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
            'Rio de Janeiro': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80',
            'São Paulo': 'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?w=800&q=80',
            'Angkor Wat': 'https://images.unsplash.com/photo-1539650116574-75c0b3b6f3b3?w=800&q=80',
            'Taj Mahal': 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
            'Bora Bora': 'https://images.unsplash.com/photo-1589197331516-4d84b72ebde3?w=800&q=80',
            'Copacabana': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800&q=80'
        };
        
        // Try to find a matching fallback image
        for (const [key, url] of Object.entries(fallbackImages)) {
            if (place.name.includes(key)) {
                imageUrl = url;
                break;
            }
        }
        
        // Default fallback if no match found
        if (!imageUrl || imageUrl.includes('enter_your_image')) {
            imageUrl = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80';
        }
    }
    
    card.innerHTML = `
        <div class="card-img-wrap">
            <img src="${imageUrl}" alt="${escapeHtml(place.name)}" loading="lazy"
                 onerror="this.src='https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=60'">
        </div>
        <div class="card-body">
            <h3 class="card-name">${escapeHtml(place.name)}</h3>
            <p class="card-desc">${escapeHtml(place.description)}</p>
        </div>
    `;
    
    return card;
}

// ==================== ESCAPE HTML TO PREVENT XSS ====================
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ==================== SEARCH FUNCTIONALITY ====================
async function searchRecommendations() {
    const searchInput = document.getElementById('searchInput');
    const rawInput = searchInput.value.trim();
    
    if (!rawInput) {
        alert('Please enter a search term (beach, temple, or country)');
        return;
    }
    
    // Ensure we're on the home page
    showPage('home');
    
    const keyword = rawInput.toLowerCase();
    const grid = document.getElementById('results-grid');
    const section = document.getElementById('results-section');
    const countEl = document.getElementById('resultsCount');
    
    // Clear previous results and show loading state
    if (grid) grid.innerHTML = '<div class="no-results"><span>🔍</span>Searching for recommendations...</div>';
    if (section) section.classList.add('active');
    
    // Load data if not already loaded
    let data = travelData;
    if (!data) {
        data = await fetchTravelData();
        if (!data) {
            if (grid) grid.innerHTML = '<div class="no-results"><span>⚠️</span>Failed to load travel data. Please refresh the page.</div>';
            if (countEl) countEl.textContent = 'Error';
            return;
        }
    }
    
    let results = [];
    
    // Check for beach-related keywords
    if (keyword.includes('beach') || keyword.includes('beaches')) {
        if (data.beaches && Array.isArray(data.beaches)) {
            results = data.beaches.map(beach => ({
                name: beach.name,
                imageUrl: beach.imageUrl,
                description: beach.description
            }));
        }
    }
    // Check for temple-related keywords
    else if (keyword.includes('temple') || keyword.includes('temples')) {
        if (data.temples && Array.isArray(data.temples)) {
            results = data.temples.map(temple => ({
                name: temple.name,
                imageUrl: temple.imageUrl,
                description: temple.description
            }));
        }
    }
    // Check for country-related keywords
    else if (keyword.includes('country') || keyword.includes('countries')) {
        if (data.countries && Array.isArray(data.countries)) {
            data.countries.forEach(country => {
                if (country.cities && Array.isArray(country.cities)) {
                    country.cities.forEach(city => {
                        results.push({
                            name: city.name,
                            imageUrl: city.imageUrl,
                            description: city.description
                        });
                    });
                }
            });
        }
    }
    // No matching keyword
    else {
        if (grid) {
            grid.innerHTML = `
                <div class="no-results">
                    <span>✨ No results found</span>
                    Try searching for: <strong>beach</strong>, <strong>temple</strong>, or <strong>country</strong>
                </div>`;
        }
        if (countEl) countEl.textContent = '0 found';
        if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
    }
    
    // Display results
    if (results.length === 0) {
        if (grid) {
            grid.innerHTML = `
                <div class="no-results">
                    <span>🏝️ No recommendations found</span>
                    Try a different search term like "beach", "temple", or "country"
                </div>`;
        }
        if (countEl) countEl.textContent = '0 found';
    } else {
        if (grid) {
            grid.innerHTML = '';
            results.forEach((place, index) => {
                grid.appendChild(createResultCard(place, index));
            });
        }
        if (countEl) countEl.textContent = `${results.length} found`;
    }
    
    // Scroll to results
    if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ==================== CLEAR SEARCH RESULTS ====================
function clearResults() {
    const searchInput = document.getElementById('searchInput');
    const grid = document.getElementById('results-grid');
    const section = document.getElementById('results-section');
    const countEl = document.getElementById('resultsCount');
    
    // Clear search input
    if (searchInput) searchInput.value = '';
    
    // Clear results grid
    if (grid) grid.innerHTML = '';
    
    // Hide results section
    if (section) section.classList.remove('active');
    
    // Reset count
    if (countEl) countEl.textContent = '0 found';
    
    console.log('Search results cleared');
}

// ==================== CONTACT FORM SUBMISSION ====================
function handleContactSubmit() {
    const nameInput = document.getElementById('contactName');
    const emailInput = document.getElementById('contactEmail');
    const messageInput = document.getElementById('contactMessage');
    const successMsg = document.getElementById('successMsg');
    
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';
    const message = messageInput ? messageInput.value.trim() : '';
    
    // Validate form fields
    if (!name) {
        alert('Please enter your name');
        if (nameInput) nameInput.focus();
        return;
    }
    
    if (!email) {
        alert('Please enter your email address');
        if (emailInput) emailInput.focus();
        return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address (e.g., name@example.com)');
        if (emailInput) emailInput.focus();
        return;
    }
    
    if (!message) {
        alert('Please enter your message');
        if (messageInput) messageInput.focus();
        return;
    }
    
    // Show success message
    if (successMsg) {
        successMsg.style.display = 'block';
        
        // Clear form fields
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (messageInput) messageInput.value = '';
        
        // Hide success message after 5 seconds
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 5000);
    }
    
    // Log the submission (in a real app, this would send to a server)
    console.log('Contact form submitted:', { name, email, message });
}

// ==================== INITIALIZE APPLICATION ====================
async function initializeApp() {
    console.log('Initializing WanderLux Travel Recommendation App...');
    
    // Load travel data
    await fetchTravelData();
    
    // Set up page navigation
    const navBrand = document.querySelector('.nav-brand');
    if (navBrand) {
        navBrand.addEventListener('click', () => showPage('home'));
    }
    
    // Set up navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.dataset.page;
            if (pageId) showPage(pageId);
        });
    });
    
    // Set up search button
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', searchRecommendations);
    }
    
    // Set up clear button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearResults);
    }
    
    // Set up search input with Enter key
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchRecommendations();
            }
        });
    }
    
    // Set up contact form submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.addEventListener('click', handleContactSubmit);
    }
    
    // Show home page by default
    showPage('home');
    
    console.log('App initialized successfully!');
}

// ==================== START THE APPLICATION ====================
// Wait for DOM to be fully loaded before initializing
document.addEventListener('DOMContentLoaded', initializeApp);
