
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
  postElement.id = `post-${post.id}`;
  postElement.classList.add("post-container");

  postElement.innerHTML = `
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
    <button type="button" class="like-button" data-post-id="${post.id}">
        <span>${post.likes_count}</span>
        <img src="/static/assets/img/like.png" alt="Like">
    </button>
    <button type="button" class="dislike-button" data-post-id="${post.id}">
        <span>${post.dislikes_count}</span>
        <img src="/static/assets/img/dislike.png" alt="Dislike">
    </button>
</div>

            <div id="comments-${post.id}" class="comments-container">
                <h3>Commentaires</h3>
            </div>

            <div id="comment-input-${post.id}" class="comment-form">
                <input id="content-${post.id}" type="text" placeholder="Make a comment here ..." required>
                <input type="submit" id="send-btn-${post.id}" value="Send">
            </div>

            <input type="hidden" value="${post.id}">
            <button type="submit" class="delete-btn">🗑️</button>
        </div>
  `;

  postsContainer.appendChild(postElement);

  fetchComments(post.id);

  // 🔥 Ajout de l'écouteur d'événement après insertion
  document.getElementById(`send-btn-${post.id}`).addEventListener("click", (event) => {
    event.preventDefault();
    sendComment(post.id);
  });
}



document.addEventListener("click", (event) => {
  const buttonLike = event.target.closest(".like-button");
  const buttonDislike = event.target.closest(".dislike-button");
  let action = null;
  let postId;
  if (buttonLike) {
    action = "like";
    postId = buttonLike.dataset.postId;
  } else if (buttonDislike) {
    action = "dislike";
    postId = buttonDislike.dataset.postId;
  }

  if (!action) return;

  event.preventDefault();


  const data = new FormData();
  data.append("post_id", postId);
  data.append("like-dislike", action);

  fetch("/likes-dislikes-validation", {
    method: "POST",
    body: data
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        let counter;
        if (action === "like") {
          counter = buttonLike.querySelector("span");
        } else {
          counter = buttonDislike.querySelector("span");
        }
        counter.textContent = data.newCount;
      } else {
        alert("Error updating like/dislike");
      }
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
          <div class="><small>${new Date(comment.created_at).toLocaleString()}</small></div>
          <button onclick="deleteComment(${comment.id})">🗑️</button>
      `;

      commentsContainer.appendChild(commentElement);

      console.log("📸 Vérification de la photo pour :", comment.username);
    });

  } catch (error) {
    console.error("Erreur de requête fetch:", error);
  }
}


function sendComment(id) {
  const content = document.getElementById(`content-${id}`);
  const contentValue = document.getElementById(`content-${id}`).value;
  content.value = "";
  const data = new FormData();
  data.append("post_id", id);
  data.append("content", contentValue);
  fetch("/comment-validation", {
    method: "POST",
    body: data
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        fetchComments(id);
      } else {
        alert("Error sending comment");
      }
    });
}
