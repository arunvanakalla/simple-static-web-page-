const authors = ["Alice", "Bob", "Charlie", "David", "Eva"];
const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#6A4C93", "#FF8C42"];
const devtoTags = ["javascript", "webdev", "css", "react", "beginners", "typescript", "html", "programming"]; // used to randomize topics

let allPosts = []; // Store all loaded posts
let filteredPosts = []; // Store filtered posts for search
let currentSearchTerm = ''; // Track current search term

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function fetchPosts(append = false) {
  try {
    const container = document.getElementById('posts-container');
    if (!append) {
      container.innerHTML = `<div class="loading-spinner">Loading articles…</div>`;
      allPosts = []; // Reset posts array for new fetch
    } else {
      container.innerHTML += `<div class="loading-spinner">Loading more articles…</div>`;
    }
    
    const randomTag = getRandomItem(devtoTags);
    const randomPage = Math.floor(Math.random() * 5) + 1; // 1..5
    const url = `https://dev.to/api/articles?per_page=50&page=${randomPage}&tag=${encodeURIComponent(randomTag)}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch posts');

    let posts = await response.json();
    posts = shuffleArray(posts);
    
    if (append) {
      allPosts = [...allPosts, ...posts];
    } else {
      allPosts = posts;
    }
    
    // Apply current search filter if any
    if (currentSearchTerm) {
      filteredPosts = filterPosts(allPosts, currentSearchTerm);
      displayPosts(filteredPosts.slice(0, 12));
    } else {
      displayPosts(allPosts.slice(0, 12));
    }
  } catch (error) {
    document.getElementById('posts-container').innerHTML =
      `<div class="error-container">
        <p class="error">❌ Error fetching posts!</p>
        <button class="retry-btn" onclick="fetchPosts()">🔄 Retry</button>
      </div>`;
  }
}

function displayPosts(posts) {
  const container = document.getElementById('posts-container');
  container.innerHTML = "";

  posts.forEach(function(post){
    const authorName = (post.user && (post.user.name || post.user.username)) || 'Unknown';
    const color = getRandomItem(colors);
    const readableDate = post.published_at ? new Date(post.published_at).toLocaleDateString() : '';
    const readingTime = post.reading_time_minutes ? `${post.reading_time_minutes} min read` : '';
    const tags = Array.isArray(post.tag_list) ? post.tag_list.slice(0, 3) : [];

    const postDiv = document.createElement('div');
    postDiv.classList.add('post-card');
    postDiv.innerHTML = `
      <div class="post-header">
        <div class="avatar" style="background-color: ${color}">${authorName[0]}</div>
        <strong>${authorName}</strong>
      </div>
      <h3>${post.title}</h3>
      <p>${post.description || ''}</p>
      <div class="post-meta">${[readableDate, readingTime].filter(Boolean).join(' • ')}</div>
      ${tags.length ? `<div class="tags">${tags.map(t => `<span class=\"tag\">#${t}</span>`).join('')}</div>` : ''}
      <div class="post-actions">
        <a href="${post.url}" target="_blank" rel="noopener" class="read-link">🔗 Read on DEV.to</a>
        <button class="like-btn">❤️ Like</button>
      </div>
    `;
    container.appendChild(postDiv);
  });

  document.querySelectorAll('button.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = btn.textContent.includes("Liked") ? "❤️ Like" : "❤️ Liked";
    });
  });
}

// Search functionality
function filterPosts(posts, searchTerm) {
  if (!searchTerm.trim()) return posts;
  
  const term = searchTerm.toLowerCase();
  return posts.filter(post => 
    post.title.toLowerCase().includes(term) ||
    (post.description && post.description.toLowerCase().includes(term)) ||
    (post.tag_list && post.tag_list.some(tag => tag.toLowerCase().includes(term)))
  );
}

function performSearch(searchTerm) {
  currentSearchTerm = searchTerm;
  
  if (searchTerm.trim()) {
    filteredPosts = filterPosts(allPosts, searchTerm);
    if (filteredPosts.length === 0) {
      displayNoResults(searchTerm);
    } else {
      displayPosts(filteredPosts.slice(0, 12));
    }
  } else {
    filteredPosts = [];
    displayPosts(allPosts.slice(0, 12));
  }
}

function displayNoResults(searchTerm) {
  const container = document.getElementById('posts-container');
  container.innerHTML = `
    <div class="no-results">
      <h3>🔍 No articles found</h3>
      <p>No articles match your search for "<strong>${searchTerm}</strong>"</p>
      <p>Try different keywords or <button class="retry-btn" onclick="fetchPosts()">🔄 Get New Articles</button></p>
    </div>
  `;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  fetchPosts();
  
  // Add event listeners for buttons
  const refreshBtn = document.getElementById('refresh-btn');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const searchInput = document.getElementById('search-input');
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => fetchPosts(false));
  }
  
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => fetchPosts(true));
  }
  
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      performSearch(e.target.value);
    });
  }
});
