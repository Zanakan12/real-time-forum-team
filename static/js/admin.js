export async function adminPanel() {
  const div = document.createElement("div");
  div.innerHTML = `
      <main>
          <h2>Admin Interface</h2>

          <!-- Liste des utilisateurs -->
          <section>
              <h2>User List</h2>
              <table border="1" cellpadding="5" cellspacing="0">
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Actions</th>
                      </tr>
                  </thead>
                  <tbody id="user-list">
                      <tr><td colspan="5">Loading...</td></tr>
                  </tbody>
              </table>
          </section>

          <!-- Gestion des catégories -->
          <section>
              <h2>Manage Categories</h2>
              <table border="1" cellpadding="5" cellspacing="0">
                  <thead>
                      <tr>
                          <th>Emoji</th>
                          <th>Action</th>
                      </tr>
                  </thead>
                  <tbody id="category-list">
                      <tr><td colspan="2">Loading...</td></tr>
                  </tbody>
              </table>
              <textarea id="new-mood" rows="1.5" cols="4"></textarea>
              <button id="add-mood">Add</button>
          </section>

          <!-- Liste des posts signalés -->
          <section>
              <h1>Posts with Non-standard Statuses</h1>
              <table border="1" cellpadding="10" cellspacing="0">
                  <thead>
                      <tr>
                          <th>ID</th>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Action</th>
                      </tr>
                  </thead>
                  <tbody id="post-list">
                      <tr><td colspan="4">Loading...</td></tr>
                  </tbody>
              </table>
          </section>
      </main>`;

  console.log("✅ Admin Panel HTML ajouté");

  await loadAdminData(div); // Charge les données DANS div

  return div;
}

// Fonction pour charger les données depuis l'API
async function loadAdminData(div) {
  try {
    const response = await fetch("/admin");
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Erreur inconnue");
    }

    console.log("✅ Données reçues :", data);

    // 🔥 On récupère les éléments directement DANS `div`
    const userList = div.querySelector("#user-list");
    const categoryList = div.querySelector("#category-list");
    const postList = div.querySelector("#post-list");

    if (!userList || !categoryList || !postList) {
      console.error("Erreur : Un élément est manquant dans `div` !");
      return;
    }

    // Remplissage des utilisateurs
    userList.innerHTML = data.users
      .map(
        (user) => `
          <tr>
            <td>${user.id}</td>
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>
              <select onchange="updateUserRole(${user.id}, this.value)">
                <option value="admin" ${
                  user.role === "admin" ? "selected" : ""
                }>Admin</option>
                <option value="moderator" ${
                  user.role === "moderator" ? "selected" : ""
                }>Moderator</option>
                <option value="user" ${
                  user.role === "user" ? "selected" : ""
                }>User</option>
                <option value="banned" ${
                  user.role === "banned" ? "selected" : ""
                }>Banned</option>
              </select>
            </td>
            <td><button onclick="deleteUser(${user.id})">Delete</button></td>
          </tr>`
      )
      .join("");

    // Remplissage des catégories (moods)
    if (data.moods) {
      categoryList.innerHTML = data.moods
        .map(
          (mood) => `
      <tr>
        <td>${mood.name}</td>
        <td><button class="delete-mood" data-id="${mood.id}">Delete</button></td>
      </tr>`
        )
        .join("");
    }

    // Remplissage des posts signalés
    if (data.posts) {
      postList.innerHTML = data.posts
        .map(
          (post) => `
          <tr>
            <td>${post.id}</td>
            <td>${post.title}</td>
            <td>
              <select onchange="updatePostStatus(${post.id}, this.value)">
                <option value="published" ${
                  post.status === "published" ? "selected" : ""
                }>Published</option>
                <option value="draft" ${
                  post.status === "draft" ? "selected" : ""
                }>Draft</option>
                <option value="pending" ${
                  post.status === "pending" ? "selected" : ""
                }>Pending</option>
                <option value="irrelevant" ${
                  post.status === "irrelevant" ? "selected" : ""
                }>Irrelevant</option>
                <option value="obscene" ${
                  post.status === "obscene" ? "selected" : ""
                }>Obscene</option>
                <option value="illegal" ${
                  post.status === "illegal" ? "selected" : ""
                }>Illegal</option>
                <option value="insulting" ${
                  post.status === "insulting" ? "selected" : ""
                }>Insulting</option>
              </select>
            </td>
            <td><button onclick="deletePost(${post.id})">Delete</button></td>
          </tr>`
        )
        .join("");
    }

    // Activation du bouton pour ajouter une catégorie
    div.querySelector("#add-mood").addEventListener("click", addMood);
  } catch (error) {
    console.error("❌ Erreur lors du chargement des données admin:", error);
  }
}

// Fonction pour mettre à jour le rôle d'un utilisateur
async function updateUserRole(userId, newRole) {
  await fetch("/admin", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `user_id=${userId}&role=${newRole}`,
  });
  await loadAdminData();
}

// Fonction pour supprimer un utilisateur
async function deleteUser(userId) {
  await fetch("/admin", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `delete_id=${userId}`,
  });
  await loadAdminData();
}

// Fonction pour ajouter une catégorie (mood)
async function addMood() {
  const moodInput = document.querySelector("#new-mood");
  const moodText = moodInput.value;
  if (!moodText.trim()) return;

  await fetch("/admin", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `emoji=${encodeURIComponent(moodText)}`,
  });

  moodInput.value = "";
  await loadAdminData();
}

// Fonction pour supprimer une catégorie (mood)
async function deleteMood(moodId) {
  await fetch("/admin", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `moodID=${moodId}`,
  });
  await loadAdminData();
}

// Fonction pour mettre à jour le statut d'un post
async function updatePostStatus(postId, newStatus) {
  await fetch("/admin", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `post_id=${postId}&status=${newStatus}`,
  });
  await loadAdminData(div);
}

// Fonction pour supprimer un post
async function deletePost(postId) {
  await fetch("/admin", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `deletepost_id=${postId}`,
  });
  await loadAdminData();
}

// document.addEventListener("DOMContentLoaded", () => {
//   console.log("loaded")
//   document.addEventListener("click", (event) => {
//     if (event.target.classList.contains("delete-mood")) {
//       const moodId = event.target.dataset.id;
//       console.log(`🗑️ Suppression du mood ID: ${moodId}`);
//       deleteMood(moodId);
//     }
//   });
// });