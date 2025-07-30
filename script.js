// Simple fade-in animation for content
document.addEventListener('DOMContentLoaded', function() {
    const contentBlock = document.querySelector('.content-block');
    if (contentBlock) {
        contentBlock.style.opacity = '0';
        contentBlock.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            contentBlock.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            contentBlock.style.opacity = '1';
            contentBlock.style.transform = 'translateY(0)';
        }, 100);
    }
});

// Navigation between home and projects
const viewProjectsBtn = document.getElementById('viewProjectsBtn');
const backBtn = document.getElementById('backBtn');
const homeSection = document.getElementById('home');
const projectsSection = document.getElementById('projects');

viewProjectsBtn.addEventListener('click', function(e) {
    e.preventDefault();
    showProjects();
});

backBtn.addEventListener('click', function() {
    showHome();
});

function showProjects() {
    homeSection.style.opacity = '0';
    homeSection.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
        homeSection.style.display = 'none';
        projectsSection.classList.add('active');
        loadProjects(); // Load projects every time
    }, 300);
}

function showHome() {
    projectsSection.classList.remove('active');
    
    setTimeout(() => {
        projectsSection.style.display = 'none';
        homeSection.style.display = 'flex';
        homeSection.style.opacity = '1';
        homeSection.style.transform = 'translateY(0)';
    }, 300);
}

// YouTube API Configuration
const YOUTUBE_API_KEY = 'AIzaSyAmDGZteUr9ef8Z_acIQxAnHRFLPvX0X70'; // Replace with your actual API key
const CHANNEL_ID = 'kotev_ex'; // Replace with your actual channel ID

// Load YouTube projects
async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    
    // Show loading
    projectsGrid.innerHTML = `
        <div class="loading">
            <div class="loading-spinner"></div>
            <p>Loading projects...</p>
        </div>
    `;
    
    try {
        // First, get channel ID from username
        const channelResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=kotev_ex&type=channel&key=${YOUTUBE_API_KEY}`);
        const channelData = await channelResponse.json();
        
        let channelId = CHANNEL_ID;
        if (channelData.items && channelData.items.length > 0) {
            channelId = channelData.items[0].id.channelId;
        }
        
        // Get videos from channel
        const videosResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=12&order=date&type=video&key=${YOUTUBE_API_KEY}`);
        const videosData = await videosResponse.json();
        
        if (!videosData.items || videosData.items.length === 0) {
            // Show no videos message
            projectsGrid.innerHTML = `
                <div class="no-videos">
                    <div class="no-videos-icon">
                        <i class="fas fa-video-slash"></i>
                    </div>
                    <h3>Brak filmów</h3>
                    <p>Nie znaleziono żadnych filmów na kanale YouTube.</p>
                    <a href="https://www.youtube.com/@kotev_ex" target="_blank" class="btn">
                        <i class="fab fa-youtube"></i> Sprawdź kanał YouTube
                    </a>
                </div>
            `;
            return;
        }
        
        // Get detailed video information including statistics
        const videoIds = videosData.items.map(item => item.id.videoId).join(',');
        const detailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${YOUTUBE_API_KEY}`);
        const detailsData = await detailsResponse.json();
        
        // Process videos
        const projects = detailsData.items.map(video => {
            const snippet = video.snippet;
            const stats = video.statistics;
            
            return {
                id: video.id,
                title: snippet.title,
                description: snippet.description.length > 150 ? snippet.description.substring(0, 150) + '...' : snippet.description,
                thumbnail: snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url || snippet.thumbnails.default?.url,
                videoId: video.id,
                views: formatViews(stats.viewCount),
                date: formatDate(snippet.publishedAt)
            };
        });
        
        // Render projects
        projectsGrid.innerHTML = projects.map(project => `
            <div class="project-card" onclick="openVideo('${project.videoId}')">
                <div class="project-thumbnail">
                    <img src="${project.thumbnail}" alt="${project.title}" onerror="this.src='https://via.placeholder.com/400x225/1a1a2e/ffffff?text=Video+Thumbnail'">
                    <div class="play-button">
                        <i class="fas fa-play"></i>
                    </div>
                </div>
                <div class="project-info">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-meta">
                        <div class="project-views">
                            <i class="fas fa-eye"></i>
                            <span>${project.views}</span>
                        </div>
                        <div class="project-date">
                            <i class="fas fa-clock"></i>
                            <span>${project.date}</span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Add fade-in animation to project cards
        const projectCards = document.querySelectorAll('.project-card');
        projectCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
    } catch (error) {
        console.error('Error loading projects:', error);
        
        // Show error message
        projectsGrid.innerHTML = `
            <div class="no-videos">
                <div class="no-videos-icon">
                    <i class="fas fa-exclamation-triangle"></i>
                </div>
                <h3>Błąd ładowania</h3>
                <p>Nie udało się załadować filmów z YouTube. Sprawdź połączenie z internetem.</p>
                <a href="https://www.youtube.com/@kotev_ex" target="_blank" class="btn">
                    <i class="fab fa-youtube"></i> Sprawdź kanał YouTube
                </a>
            </div>
        `;
    }
}

// Helper functions
function formatViews(viewCount) {
    const views = parseInt(viewCount);
    if (views >= 1000000) {
        return (views / 1000000).toFixed(1) + 'M';
    } else if (views >= 1000) {
        return (views / 1000).toFixed(1) + 'K';
    }
    return views.toString();
}

function formatDate(publishedAt) {
    const date = new Date(publishedAt);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
}

// Open YouTube video
function openVideo(videoId) {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    window.open(url, '_blank');
}

// Add hover effects for social links
document.querySelectorAll('.social-link').forEach(link => {
    link.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px) scale(1.1)';
    });
    
    link.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Add click effect for the button
document.querySelector('.btn').addEventListener('click', function() {
    this.style.transform = 'scale(0.95)';
    setTimeout(() => {
        this.style.transform = 'scale(1)';
    }, 150);
}); 