export async function profilePage() {
  const div = document.createElement("div");

  // Structure HTML avec profil, image et mise à jour du nom
  div.innerHTML = `
      <!-- Photo de profil -->
      <div id="profile-container">
        <img id="profile-image" alt="Photo de profil" class="profile-image">
        <div id="username-profile"></div>
      </div>
      <!-- Formulaire d'upload -->
      <form id="uploadForm">
    <input id="username-form" name="username" type="hidden">
    
    <!-- Label personnalisé pour l'upload -->
    <label for="imageInput" class="custom-file-upload"></label>
    <input type="file" name="image" id="imageInput" accept="image/*" required>

    <!-- Aperçu de l'image -->
    <img id="preview" alt="Aperçu de l'image" style="max-width: 200px; display: none; margin-top: 10px;">
    
    <button id="submit-image" type="submit">Envoyer</button>
</form>
      <p id="responseMessage"></p>

      <!-- Formulaire de mise à jour du nom -->
      <div id="update-form-container" style="display: none;">
          <h2>Update user name</h2>
          <form id="update-form">
              <table>
                  <tr>
                      <td><label for="current_name">Current name :</label></td>
                      <td><input type="text" id="current_name" name="current_name" readonly /></td>
                  </tr>
                  <tr>
                      <td><label for="new_name">New name :</label></td>
                      <td><input id="new_name" name="new_name" required type="text" placeholder="Enter new name here" /></td>
                  </tr>
                  <tr>
                      <td colspan="2">
                          <input type="hidden" name="user_id" id="user_id" />
                          <input type="submit" value="Update" />
                          <button type="button" id="cancel-update">Cancel</button>
                      </td>
                  </tr>
              </table>
          </form>
      </div>

      <button id="update-profile-btn">Update Profile</button>

      <!-- Conteneur des derniers posts -->
      <div id="last-posts-container"></div>
  `;
  document.body.appendChild(div);
  // Charger les infos de l'utilisateur
  await loadUserProfile(div);

  return div;
}

async function loadUserProfile(div) {
  try {
    const response = await fetch("/profile-data");
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || "Erreur inconnue");
    }

    // 🔹 Vérifie que chaque élément existe avant de l'utiliser
    const userRoleEl = div.querySelector("#user-role");
    const notificationCountEl = div.querySelector("#notification-count");
    const profileImage = div.querySelector("#profile-image");
    const postsContainer = div.querySelector("#last-posts-container");
    const usernameEl = div.querySelector("#username-profile");

    if (usernameEl) usernameEl.textContent = data.username;
    if (userRoleEl) userRoleEl.textContent = `Role: ${data.userRole}`;
    if (notificationCountEl)
      notificationCountEl.textContent = `Notifications: ${data.notificationCount}`;
    if (profileImage)
      profileImage.src = `static/assets/img/${data.username}/profileImage.png`;

    if (usernameEl) usernameEl.textContent = data.username || "Rafta";

    // 🔹 Vérifier et afficher les posts récents
    if (postsContainer) {
      postsContainer.innerHTML =
        "<h3>Last Posts</h3>" +
        data.mostRecentPosts
          .map(
            (post) => ` <form id="form-${
              post.id
            }" action="/post-update-validation" method="post">
            <table id="post" class="post">
              <tr>
                <td id="post-header" class="username">
                  <div class="photo-chat"></div>
                  <div class="username">${post.user.username}</div>
                </td>
                <td>
                  <span>${post.categories ? post.categories : ""}</span>
                </td>
              </tr>
              <tr>
                <td colspan="3" class="written" style="font-style: italic; padding-bottom: 1.3rem;">
                  Posté le ${newDate(post.created_at)}
                </td>
              </tr>
              <tr>
                <td colspan="3" class="postcontent">
                  <input type="hidden" name="post_id" value="${post.id}">
                  <div id="textarea-container-${post.id}">
                    <div id="textarea-${post.id}" name="content">${
              post.body
            }</div>
                  </div>
                  <button id="modif-post-${
                    post.id
                  }" type="button">✏️ Modifier</button>
                </td>
              </tr>
              <tr>
                <td colspan="3" style="text-align: center;">
                  <img src="${
                    post.image_path
                  }" alt="Post Image" style="max-width: 500px; height: auto;" />
                </td>
              </tr>
              <td class="post-status" class="written" style="font-style: italic;"> Status: ${
                post.status
              }</td>
            </table>
          </form>
          <form action="/post-delete-validation" method="post" style="display: inline;">
            <input type="hidden" name="post_id" value="${post.id}">
            <button type="submit">🗑️</button>
          </form>
        `
          )
          .join("");
    }
  } catch (error) {
    console.error("❌ Erreur lors du chargement du profil :", error);
    const responseMessage = div.querySelector("#responseMessage");
    if (responseMessage) {
      responseMessage.textContent = "Failed to load profile data.";
      responseMessage.style.color = "red";
    }
  }
}

function newDate(date) {
  const dateStr = date;
  const dateObj = new Date(dateStr);

  const formattedDate = dateObj.toLocaleString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
  return formattedDate;
}

document.addEventListener("DOMContentLoaded", () => {
  const requestForm = document.getElementById("moderator-form");
  const responseMessage = document.getElementById("responseMessage");

  if (requestForm) {
    requestForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Empêche le rechargement de la page

      try {
        const response = await fetch("/user-request-validation", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        });

        const data = await response.json();

        if (data.success) {
          responseMessage.textContent = "✅ Request successfully sent!";
          responseMessage.style.color = "green";
        } else {
          responseMessage.textContent = `❌ Error: ${data.error}`;
          responseMessage.style.color = "red";
        }
      } catch (error) {
        console.error("❌ Error:", error);
        responseMessage.textContent = "❌ An unexpected error occurred!";
        responseMessage.style.color = "red";
      }
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const updateForm = document.getElementById("update-form");
  const responseMessage = document.getElementById("responseMessage");

  if (updateForm) {
    updateForm.addEventListener("submit", async (event) => {
      event.preventDefault(); // Empêche le rechargement de la page

      const formData = new FormData(updateForm);
      const newName = formData.get("new_name");

      if (!newName.trim()) {
        responseMessage.textContent = "❌ Le champ 'new_name' est vide";
        responseMessage.style.color = "red";
        return;
      }

      try {
        const response = await fetch("/update-name", {
          method: "POST",
          body: new URLSearchParams(formData),
        });

        const data = await response.json();

        if (data.success) {
          responseMessage.textContent = "✅ Nom mis à jour avec succès!";
          responseMessage.style.color = "green";
          document.getElementById("username-profile").textContent = newName;
        } else {
          responseMessage.textContent = `❌ Erreur: ${data.error}`;
          responseMessage.style.color = "red";
        }
      } catch (error) {
        console.error("❌ Erreur :", error);
        responseMessage.textContent = "❌ Une erreur inattendue est survenue!";
        responseMessage.style.color = "red";
      }
    });
  }
});

function waitForElement(selector, callback) {
  const observer = new MutationObserver((mutations) => {
    if (document.querySelector(selector)) {
      observer.disconnect();
      callback();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Attendre que #uploadForm soit dans le DOM
waitForElement("#uploadForm", () => {
  const uploadForm = document.getElementById("uploadForm");

  if (!uploadForm) {
    console.error("❌ Le formulaire d'upload n'a pas été trouvé !");
    return;
  }

  uploadForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // ❌ Empêche le rechargement de la page

    const imageInput = document.getElementById("imageInput");
    const file = imageInput?.files[0]; // 📂 Récupère l'image

    if (!file) {
      alert("❌ Veuillez sélectionner une image.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/upload-profile-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        responseMessage.textContent = "✅ Image mise à jour avec succès !";
        responseMessage.style.color = "green";

        // ✅ Met à jour l'image de profil sans recharger la page
        const profileImage = document.getElementById("profile-image")
        profileImage.src = `/${data.image}`; // Ajoute un timestamp pour éviter le cache
      } else {
        responseMessage.textContent = `❌ Erreur : ${data.error}`;
        responseMessage.style.color = "red";
      }
    } catch (error) {
      console.error("❌ Erreur d'upload :", error);
      alert("❌ Une erreur s'est produite.");
    }
  });
});

// Attendre que #imageInput soit dans le DOM
waitForElement("#imageInput", () => {
  const imageInput = document.getElementById("imageInput");

  if (!imageInput) {
    console.error("❌ L'élément #imageInput n'a pas été trouvé !");
    return;
  }

  imageInput.addEventListener("change", function (event) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById("preview");
        preview.src = e.target.result;
        preview.style.display = "block";
      };
      reader.readAsDataURL(file);
    }
  });
});
