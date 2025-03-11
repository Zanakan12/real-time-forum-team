export function PostsSignaledTable(postsData) {
    const container = document.createElement("div");
    container.innerHTML = `<h1>Posts signalés</h1>`;
    
    const table = document.createElement("table");
    table.innerHTML = `
        <thead>
            <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            ${postsData.map(post => `
                <tr>
                    <td>${post.id}</td>
                    <td>${post.title}</td>
                    <td>${post.status}</td>
                    <td>
                        <button onclick='updatePost(${post.id})'>Modifier</button>
                        <button onclick='deletePost(${post.id})'>Supprimer</button>
                    </td>
                </tr>
            `).join("")}
        </tbody>
    `;
    container.appendChild(table);
    return container;
}