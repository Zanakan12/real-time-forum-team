export function LastPostsPage(postsData, userData) {
    const container = document.createElement("div");
    container.innerHTML = "<h2>Derniers Posts</h2>";
    
    postsData.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        
        let categories = post.categories.map(cat => `<span>${cat}</span>`).join(" ");
        let imageSection = post.imagePath ? `<img src='${post.imagePath}' alt='Post Image' style='max-width: 500px; height: auto;' />` : "";
        
        postElement.innerHTML = `
            <h3>${post.title}</h3>
            <p class='username'>${post.user.username}</p>
            <p class='written'>Écrit le ${post.createdAt}</p>
            <p>${categories}</p>
            <p>${post.body}</p>
            ${imageSection}
        `;
        
        container.appendChild(postElement);
    });
    
    return container;
}
