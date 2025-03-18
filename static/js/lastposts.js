
export function fetchAndUpdatePosts(postsContainer) {
  fetch("/?format=json")
    .then((response) => response.json())
    .then((data) => {
      //console.log("📩 Données reçues :", data.mostRecentPosts);

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
              <table class="post">
                <tr>
                  <td class="username">
                    <div class="photo-chat" style="background-image: url('/static/assets/img/${post.user.username}/profileImage.jpg');"></div>
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
              <form action="/post-delete-validation" method="post" style="display: inline;">
              <input type="hidden" name="post_id" value="${post.id}">
              <button type="submit">🗑️</button>
            </form>
            <div class="likesbuttons">
          <form class="like-form" data-id="${post.id}" data-type="like">
              <button type="button" class="like-button" style="background: none; border: none; cursor: pointer;">
                  <span>${post.likes_count}</span>
                  <img src="/static/assets/img/like.png" alt="Like" style="width: 15px; vertical-align: middle;">
              </button>
          </form>
          <form class="dislike-form" data-id="${post.id}" data-type="dislike">
              <button type="button" class="dislike-button" style="background: none; border: none; cursor: pointer;">
                  <span>${post.dislikes_count}</span>
                  <img src="/static/assets/img/dislike.png" alt="Dislike" style="width: 15px; vertical-align: middle;">
              </button>
          </form>
      </div>
      <tr id="comment-row-${post.id}">
    <td colspan="2">
        <form action="/comment-update-validation" method="post" class="hidden">
            <input type="hidden" name="comment_id" value="${post}">
            <div id="textarea-${post.id}}" name="content" rows="" cols="">${post.comment}</div>
            <button type="submit">✏️</button>
        </form>
        <form action="/comment-delete-validation" method="post" style="text-align: right;" class="hidden">
            <input type="hidden" name="comment_id" value="${post.id}">
            <button type="submit">🗑️</button>
        </form>
    </td>
</tr>
      <form id="comment-input"action="/comment-validation" method="post">
        <input type="hidden" name="post_id" value="${post.id}">
        
            <input id="content" name="content" type="text" placeholder="Make a comment here ..." required></input>
            <input type="submit" value="Send">
        
        </form>
        </form>      
          `;

  postsContainer.appendChild(postElement);
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

  const commentForm = document.querySelector("#comment-form");
  if (commentForm) { // Vérifie si le formulaire existe
    commentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(commentForm);

      fetch("/comment-validation", {
        method: "POST",
        body: formData
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const commentList = document.querySelector("#comment-list");
            if (commentList) {
              const newComment = document.createElement("tr");
              newComment.innerHTML = `<td>${data.comment}</td><td>${data.date}</td>`;
              commentList.appendChild(newComment);
            }
            commentForm.reset();
          } else {
            alert("Error submitting comment");
          }
        });
    });
  }
});



