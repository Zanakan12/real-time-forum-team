
export function fetchAndUpdatePosts(postsContainer) {
  fetch("/?format=json")
    .then((response) => response.json())
    .then((data) => {
      if (data.mostRecentPosts === null) {
        console.warn("⚠️ Aucun post trouvé dans la base de données.");
        return;
      }

      if (!postsContainer) {
        return
      } // ✅ Vide le contenu actuel uniquement si l'élément existe
      postsContainer.innerHTML = ""; // ✅ Vide seulement si l'élément existe
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
        appendPost(post, formattedDate, postsContainer)

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

export function appendPost(post, formattedDate, postsContainer) {

  const postElement = document.createElement("div");
  postElement.id = "post-format"
  postElement.innerHTML = `
    <form id="form-${post.id}" action="/post-update-validation" method="post">
        <div class="post">
            <div class="post-header">
                <div class="photo-chat"></div>
                <div class="username">${post.user.username}</div>
                <span class="category">${post.categories ? post.categories : ""}</span>
                <button id="modif-post-${post.id}" type="button" class="modif-post">✏️ Modifier</button>
            </div>

            <div class="post-meta">
                Posté le ${formattedDate}
            </div>

            <div class="post-content">
                <input type="hidden" name="post_id" value="${post.id}">
                <div id="textarea-container-${post.id}">
                    <div id="textarea-${post.id}" name="content">${post.body}</div>
                </div>
            </div>

            <div class="post-image">
                <img src="${post.image_path}" alt="Post Image" />
            </div>

            <div class="post-status">
                <em>Status: ${post.status}</em>
            </div>

            

            <div class="likes-buttons">
                <form class="like-form" data-id="${post.id}" data-type="like">
                    <button type="button" class="like-button">
                        <span>${post.likes_count}</span>
                        <img src="/static/assets/img/like.png" alt="Like">
                    </button>
                </form>
                <form class="dislike-form" data-id="${post.id}" data-type="dislike">
                    <button type="button" class="dislike-button">
                        <span>${post.dislikes_count}</span>
                        <img src="/static/assets/img/dislike.png" alt="Dislike">
                    </button>
                </form>
            </div>

            <div id="comments-${post.id}" class="comments-container">
                <h3>Commentaires</h3>
            </div>

            <form id="comment-input" action="/comment-validation" method="post" class="comment-form">
                <input type="hidden" name="post_id" value="${post.id}">
                <input id="content" name="content" type="text" placeholder="Make a comment here ..." required>
                <input type="submit" value="Send">
            </form>
        </div>
        <form action="/post-delete-validation" method="post" class="post-delete-form">
                <input type="hidden" name="post_id" value="${post.id}">
                <button type="submit" class="delete-btn">🗑️</button>
          </form>
    </form>
`;

  postsContainer.appendChild(postElement);
  fetchComments(post.id);
}


document.querySelectorAll(".like-button, .dislike-button").forEach(button => {
  button.addEventListener("click", (event) => {
    event.preventDefault();
    const form = button.closest("form");
    const formData = new FormData(form);

    fetch("/likes-dislikes-validation", {
      method: "POST",
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          const counter = form.querySelector("span");
          counter.textContent = data.newCount;
        } else {
          alert("Error updating like/dislike");
        }
      });
  });
});




async function fetchComments(postId) {
  console.log("🔍 Récupération des commentaires pour le post", postId);
  try {
    const response = await fetch(`/api/comments?post_id=${postId}`);
    const data = await response.json();
    if (!data.success) {
      console.error("Erreur lors de la récupération des commentaires:", data.message);
      return;
    }


    // Sélectionne l'élément où afficher les commentaires
    const commentsContainer = document.getElementById(`comments-${postId}`);
    if (!commentsContainer) {
      console.error("Container de commentaires introuvable !");
      return;
    }

    // Vide le container avant d'ajouter les nouveaux commentaires
    commentsContainer.innerHTML = "";

    // Boucle sur chaque commentaire et l'affiche
    data.comments.forEach(comment => {
      const commentElement = document.createElement("div");
      commentElement.classList.add("comment");

      commentElement.innerHTML = `
          <div class="photo-comment"></div>
          <div class="comment-username">${comment.username}</div>
          <p class="comment-content">${comment.content}</p>
          <div class="date"><small>${new Date(comment.created_at).toLocaleString()}</small></div>
          <button onclick="deleteComment(${comment.id})">🗑️</button>
      `;

      commentsContainer.appendChild(commentElement);

      console.log("📸 Vérification de la photo pour :", comment.username);
    });

  } catch (error) {
    console.error("Erreur de requête fetch:", error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const commentForm = document.querySelector("#comment-input");

  if (commentForm) {
      commentForm.addEventListener("submit", async (event) => {
          event.preventDefault();

          const formData = new FormData(commentForm);
          const postId = formData.get("post_id");

          try {
              const response = await fetch("/api/comments", {
                  method: "POST",
                  body: formData
              });

              const data = await response.json();
              if (data.success) {
                  console.log("✅ Commentaire ajouté !");
                  fetchComments(postId); // Rafraîchit la liste des commentaires
                  commentForm.reset();
              } else {
                  alert("❌ Erreur: " + data.message);
              }
          } catch (error) {
              console.error("❌ Erreur de requête fetch:", error);
          }
      });
  } else {
      console.warn("❌ Le formulaire #comment-input n'a pas été trouvé !");
  }
});
