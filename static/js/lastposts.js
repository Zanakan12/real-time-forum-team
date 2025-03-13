document.addEventListener("DOMContentLoaded", function () {
  fetch("/?format=json") // Appel de l'API JSON
    .then((response) => response.json())
    .then((data) => {
      console.log("Données reçues :", data.mostRecentPosts);

      let allData = data;
      const postsContainer = document.getElementById("lastposts-container");
      postsContainer.innerHTML = ""; // Vide le contenu actuel

      allData.mostRecentPosts.forEach((post) => {
        console.log("Pas d'erreur", post);
        const dateStr = post.created_at;
        const dateObj = new Date(dateStr);

        const formattedDate = dateObj.toLocaleString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "UTC",
        });

        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
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
                Posté le ${formattedDate}
              </td>
            </tr>
            <tr>
              <td colspan="3" class="postcontent">
                <form action="/post-update-validation" method="post">
                  <input type="hidden" name="post_id" value="${post.id}">
                  <div id="textarea-container-${post.id}">
                    <div id="textarea-${post.id}" name="content">${
          post.body
        }</div>
                  </div>
                  <button id="modif-post-${
                    post.id
                  }" type="button">✏️ Modifier</button>
                </form>
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
          <form action="/post-delete-validation" method="post" style="display: inline;">
            <input type="hidden" name="post_id" value="${post.id}">
            <button type="submit">🗑️</button>
          </form>
        `;

        postsContainer.appendChild(postElement);

        // Gestion de la modification du post
        const textContainer = document.getElementById(
          `textarea-container-${post.id}`
        );
        const modifPostBtn = document.getElementById(`modif-post-${post.id}`);

        let isEditing = false; // Permet de savoir si on est en mode édition

        modifPostBtn.addEventListener("click", () => {
          if (!isEditing) {
            // On passe en mode édition
            const currentText = textContainer.innerText.trim();
            textContainer.innerHTML = `
              <textarea id="textarea-${post.id}" name="content" rows="3" cols="50">${currentText}</textarea>
            `;
            modifPostBtn.innerText = "💾 Enregistrer";
            isEditing = true;
          } else {
            // On sauvegarde le texte
            const textareaElement = document.getElementById(
              `textarea-${post.id}`
            );
            if (textareaElement && textareaElement.tagName === "TEXTAREA") {
              const newText = textareaElement.value.trim();
              console.log("Texte sauvegardé :", newText); // Debug
              textContainer.innerHTML = `<div id="textarea-${post.id}" name="content">${newText}</div>`;
              modifPostBtn.innerText = "✏️ Modifier";
              isEditing = false;
            }
          }
        });
      });

      // Met à jour la liste des catégories dynamiquement
      const categoriesContainer = document.getElementById(
        "categories-selection-container"
      );
      categoriesContainer.innerHTML = ""; // Vide le contenu actuel
      if (data.moods !== null) {
        data.moods.forEach((category) => {
          const categoryElement = document.createElement("li");
          categoryElement.textContent = category.name;
          categoriesContainer.appendChild(categoryElement);
        });
      }
    })
    .catch((error) =>
      console.error("Erreur lors de la récupération des données :", error)
    );
});
