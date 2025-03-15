document.addEventListener("DOMContentLoaded", function () {
  function fetchAndUpdatePosts(postsContainer) {
    fetch("/?format=json")
      .then((response) => response.json())
      .then((data) => {
        console.log("📩 Données reçues :", data.mostRecentPosts);

        postsContainer.innerHTML = ""; // ✅ Vide le contenu actuel uniquement si l'élément existe

        data.mostRecentPosts.forEach((post) => {
          const dateObj = new Date(post.created_at);
          const formattedDate = dateObj.toLocaleString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "UTC",
          });

          const postElement = document.createElement("div");
          postElement.innerHTML = `
            <form id="form-${post.id}" action="/post-update-validation" method="post">
              <table class="post">
                <tr>
                  <td class="username">
                    <div class="photo-chat"></div>
                    <div class="username">${post.user.username}</div>
                  </td>
                  <td><span>${post.categories ? post.categories : ""}</span></td>
                  <td> <button id="modif-post-${post.id}" type="button" class="modif-post">✏️ Modifier</button></td>
                </tr>
                <tr>
                  <td colspan="3" class="written">
                    Posté le ${formattedDate}
                  </td>
                </tr>
                <tr>
                  <td colspan="3" class="postcontent">
                    <input type="hidden" name="post_id" value="${post.id}">
                    <div id="textarea-container-${post.id}">
                      <div id="textarea-${post.id}" name="content">${post.body}</div>
                    </div>
                    
                  </td>
                </tr>
                <tr>
                  <td colspan="3" style="text-align: center;">
                    <img src="${post.image_path}" alt="Post Image" style="max-width: 500px; height: auto;" />
                  </td>
                </tr>
                <td class="post-status" style="font-style: italic;">Status: ${post.status}</td>
              </table>
            </form>
            <form action="/post-delete-validation" method="post" style="display: inline;">
              <input type="hidden" name="post_id" value="${post.id}">
              <button type="submit">🗑️</button>
            </form>
          `;

          postsContainer.appendChild(postElement);

          // Gestion de la modification du post
          const textContainer = document.getElementById(`textarea-container-${post.id}`);
          const modifPostBtn = document.getElementById(`modif-post-${post.id}`);

          let isEditing = false;

          modifPostBtn.addEventListener("click", () => {
            if (!isEditing) {
              // Mode édition
              const currentText = textContainer.innerText.trim();
              textContainer.innerHTML = `
                <textarea id="textarea-${post.id}" name="content" rows="3" cols="50">${currentText}</textarea>
              `;
              modifPostBtn.innerText = "💾 Enregistrer";
              isEditing = true;
            } else {
              // Mode sauvegarde
              const textareaElement = document.getElementById(`textarea-${post.id}`);
              if (textareaElement && textareaElement.tagName === "TEXTAREA") {
                const newText = textareaElement.value.trim();
                console.log("💾 Texte sauvegardé :", newText);

                fetch("/post-update-validation", {
                  method: "POST",
                  headers: { "Content-Type": "application/x-www-form-urlencoded" },
                  body: new URLSearchParams({ post_id: post.id, content: newText }),
                })
                  .then((response) => response.json())
                  .then((data) => {
                    if (data.success === "true") {
                      textContainer.innerHTML = `<div id="textarea-${post.id}" name="content">${newText}</div>`;
                      modifPostBtn.innerText = "✏️ Modifier";
                      isEditing = false;
                      console.log("✅ Mise à jour réussie :", data.message);
                    } else {
                      console.error("❌ Erreur :", data.message);
                    }
                  })
                  .catch((error) => console.error("❌ Erreur réseau :", error));
              }
            }
          });
        });

        // Mise à jour dynamique des catégories
        const categoriesContainer = document.getElementById("categories-selection-container");
        if (categoriesContainer) {
          categoriesContainer.innerHTML = ""; // ✅ Vide le contenu actuel uniquement si l'élément existe
          if (data.moods) {
            data.moods.forEach((category) => {
              const categoryElement = document.createElement("li");
              categoryElement.textContent = category.name;
              categoriesContainer.appendChild(categoryElement);
            });
          }
        }
      })
      .catch((error) => console.error("❌ Erreur lors de la récupération des données :", error));
  }

  let postsContainer = document.getElementById("lastposts-container");

  if (postsContainer) {
    fetchAndUpdatePosts(postsContainer);
  } else {
    console.warn("⚠️ L'élément #lastposts-container n'existe pas au chargement du DOM, attente...");

    // Observer si l'élément est ajouté dynamiquement
    const observer = new MutationObserver(() => {
      postsContainer = document.getElementById("lastposts-container");
      if (postsContainer) {
        console.log("✅ L'élément #lastposts-container a été détecté !");
        observer.disconnect(); // Arrêter l'observation
        fetchAndUpdatePosts(postsContainer);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }
});
