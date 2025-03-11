export async function loadPosts() {
    const response = await fetch("/api/posts"); // Récupère les posts via l'API Go
    const posts = await response.json();

    const container = document.getElementById("post-container");
    if (!container) return; // Vérification de sécurité

    container.innerHTML = ""; // On vide avant d'afficher les nouveaux posts

    posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.classList.add("post");

        postElement.innerHTML = `
            <h2>${post.title}</h2>
            <p>Par <strong>${post.username}</strong></p>
            <p>${post.body}</p>
        `;

        container.appendChild(postElement);
    });
}
