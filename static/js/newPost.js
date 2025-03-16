import { fetchAndUpdatePosts } from "/static/js/lastposts.js";

document.addEventListener("DOMContentLoaded", function () {
  function checkContainer() {
    const newPostContainer = document.getElementById("newpost-container");
    if (newPostContainer) {
      newPostContainer.innerHTML = `
        <div id="newpost-section">
          <div id="error-messages"></div>
          <div id="categories-container"></div>
          <input id="body" name="body" type="text" placeholder="Tell us a story ..." required/>
          <div class="file-upload">
            <input type="file" id="image-upload" name="image" accept="image/*"/>
            <label for="image-upload">📷</label>
          </div>
          <div id="image-preview"></div>
          <button id="submit-post">Submit</button>
        </div>
      `;

      const imageUpload = document.getElementById("image-upload");
      const imagePreview = document.getElementById("image-preview");
      const submitButton = document.getElementById("submit-post");
      const errorMessages = document.getElementById("error-messages");

      console.log("✅ Form loaded successfully.");

      // Prévisualisation de l'image
      imageUpload.addEventListener("change", function (event) {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (e) {
            imagePreview.innerHTML = `<img src="${e.target.result}" alt="Image Preview" style="max-width: 200px; max-height: 200px; border-radius: 10px;"/>`;
          };
          reader.readAsDataURL(file);
        } else {
          imagePreview.innerHTML = "";
        }
      });

      // Envoi AJAX
      submitButton.addEventListener("click", function () {
        const bodyText = document.getElementById("body").value;

        if (!bodyText.trim()) {
          errorMessages.innerHTML = "<p style='color:red;'>Le texte ne peut pas être vide.</p>";
          return;
        }

        console.log("📤 Envoi du post...");

        const formData = new FormData();
        formData.append("body", bodyText);
        if (imageUpload.files[0]) {
          formData.append("image", imageUpload.files[0]);
        }

        fetch("/post-validation", {
          method: "POST",
          body: formData
        })
          .then(response => {
            console.log("🔄 Réponse reçue du serveur:", response);
            return response.json();
          })
          .then(data => {
            console.log("📥 Données JSON reçues:", data);

            if (data.success) {
              console.log("✅ Post ajouté avec succès !");
              let postsContainer = document.getElementById("lastposts-container");
              fetchAndUpdatePosts(postsContainer)
              document.getElementById("body").value = "";
              imagePreview.innerHTML = "";
              imageUpload.value = "";
              errorMessages.innerHTML = "<p style='color:green;'>Post ajouté avec succès !</p>";
            } else {
              errorMessages.innerHTML = `<p style='color:red;'>Erreur : ${data.error}</p>`;
            }
          })
          .catch(error => {
            console.error("❌ Erreur AJAX :", error);
            errorMessages.innerHTML = "<p style='color:red;'>Une erreur est survenue.</p>";
          });
      });


    } else {
      setTimeout(checkContainer, 100);
    }
  }

  checkContainer();
});
