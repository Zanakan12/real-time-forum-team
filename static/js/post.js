export async function loadPosts() {
    const response = await fetch("/api/posts");
    const posts = await response.json();

    const container = document.getElementById("post-container");
    if (!container) return;

    container.innerHTML = "";

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

export async function createPost(body, imageFile = null) {
    const formData = new FormData();
    formData.append("body", body);
    if (imageFile) formData.append("image", imageFile);

    const response = await fetch("/post/validate", {
        method: "POST",
        body: formData,
    });

    const data = await response.json();
    if (data.success) {
        loadPosts();
    } else {
        alert(data.error);
    }
}

export async function updatePost(postId, content) {
    const response = await fetch("/post/update", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `post_id=${postId}&content=${encodeURIComponent(content)}`
    });

    const data = await response.json();
    if (data.success) {
        loadPosts();
    } else {
        alert(data.error);
    }
}

export async function deletePost(postId) {
    const response = await fetch("/post/delete", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `post_id=${postId}`
    });

    const data = await response.json();
    if (data.success) {
        loadPosts();
    } else {
        alert(data.error);
    }
}
