export function CategoriesManagePage(categoriesData) {
    const container = document.createElement("div");
    container.innerHTML = `<h2>Gestion des Catégories</h2>`;
    
    const table = document.createElement("table");
    table.innerHTML = `
        <tr>
            <th>Emoji</th>
            <th>Action</th>
        </tr>
        ${categoriesData.map(cat => `
            <tr>
                <td>${cat.name}</td>
                <td>
                    <button onclick='deleteCategory(${cat.id})'>Supprimer</button>
                </td>
            </tr>
        `).join("")}
    `;
    container.appendChild(table);
    
    return container;
}