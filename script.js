const authors = ["Alice", "Bob", "Charlie", "David", "Eva"];
const colors = ["#FF6B6B", "#4ECDC4", "#FFD93D", "#6A4C93", "#FF8C42"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function fetchPosts() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/posts');
    if (!response.ok) throw new Error('Failed to fetch posts');

    let posts = await response.json();
    posts = shuffleArray(posts);
    displayPosts(posts.slice(0, 10));
  } catch (error) {
    document.getElementById('posts-container').innerHTML =
      `<p class="error">Error fetching posts! Please try again later.</p>`;
  }
}

function displayPosts(posts) {
  const container = document.getElementById('posts-container');
  container.innerHTML = "";

  posts.forEach(function(post){
    const author = getRandomItem(authors);
    const color = getRandomItem(colors);

    const postDiv = document.createElement('div');
    postDiv.classList.add('post-card');
    postDiv.innerHTML = `
      <div class="post-header">
        <div class="avatar" style="background-color: ${color}">${author[0]}</div>
        <strong>${author}</strong>
      </div>
      <h3>${post.title}</h3>
      <p>${post.body}</p>
      <button class="like-btn">❤️ Like</button>
    `;
    container.appendChild(postDiv);
  });

  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.textContent = btn.textContent.includes("Liked") ? "❤️ Like" : "❤️ Liked";
    });
  });
}

fetchPosts();
