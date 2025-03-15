document.addEventListener("DOMContentLoaded", function () {
  function checkContainer() {
    const newPostContainer = document.getElementById("newpost-container");
    if (newPostContainer) {
      newPostContainer.innerHTML = `
            <form action="/post-validation" method="post" enctype="multipart/form-data">
              <div id="newpost-section">
                <div id="error-messages"></div>
                <div id="categories-container"></div>
                  <input id="body" name="body" type="text" placeholder="tell us a story ..." required/>
                  <div class="file-upload">
                  <input type="file" id="image-upload" name="image" accept="image/*"/>
                  <label for="image-upload">📷</label>
                  <span class="file-name">Aucune image sélectionnée</span>
                  </div>

                <input type="submit" value="Submit" />
              </div>
            </form>
          `;
    } else {
      setTimeout(checkContainer, 100); // Réessayer après 100ms
    }
  }
  checkContainer();
});

const observer = new MutationObserver(() => {
  let fileInput = document.getElementById("image-upload");
  if (fileInput) {
      fileInput.addEventListener("change", function() {
          let fileName = this.files.length > 0 ? this.files[0].name : "Aucune image sélectionnée";
          document.querySelector(".file-name").textContent = fileName;
      });
      observer.disconnect(); // On arrête l'observation une fois l'élément trouvé
  }
});

observer.observe(document.body, { childList: true, subtree: true });

