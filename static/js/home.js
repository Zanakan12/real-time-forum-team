let username = "rafta";

export function homePage() {
  const div = document.createElement("div");
  div.innerHTML = `
      <h4> ${username}, tell us a story...</h4>
      
      <div id="newpost-container"></div>
      <div id="categories-selection-container"></div>
      <div id="lastposts-container"></div>
      <div id="chat-messages" class="fold">
              <div id="all-users" class="hidden">
                  <h3>en ligne:</h3>
                  <ul id="users-online" name="user"></ul>
                  <h3>hors ligne :</h3>
                  <ul id="users-offline"></ul>
              </div>

              <div id="chat" class="hidden">
                  <div id="header-chat">
                    <div id="photo-chat"></div>
                    <div id="name-chat"></div>   
                    <div id="reduce-chat">_</div>
                    <div id="close-chat">x</div>
                  </div>
                  <ul id="messages"></ul>

                  <div id="chat-input-container">
                      <input id="message" type="text" placeholder="Écrivez un message">
                      <input id="send-msg-button" type="button">
                  </div>
              </div>
      </div>
    `;

  return div;
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("/?format=json") // Appel de l'API JSON
    .then((response) => response.json())
    .then((data) => {
      console.log("Données reçues :", data.mostRecentPosts);

      let allData = data;
      // Met à jour la liste des posts dynamiquement
      const postsContainer = document.getElementById("lastposts-container");
      postsContainer.innerHTML = ""; // Vide le contenu actuel

      allData.mostRecentPosts.forEach((post) => {
        console.log("pas d'erreur", post);
        const postElement = document.createElement("div");
        postElement.classList.add("post");
        postElement.innerHTML = `
                  <table id="post" class="post">
                  <tr><td class="posttitle">${post.title}</td><td class="username">User123</td><td><span>Category 1</span></td></tr>
                  <tr><td colspan="3" class="written" style="font-style: italic; padding-bottom: 1.3rem;">Written at ${post.date}</td></tr>
                  <tr><td colspan="3" class="postcontent" style="padding: 1.5rem;">
                    <form action="/post-update-validation" method="post">
                      <input type="hidden" name="post_id" value="1">
                      <textarea id="textarea-1" name="content" rows="" cols="">This is an example post content.</textarea>
                      <button type="submit">✏️</button>
                    </form>
                  </td></tr>
                  <tr><td colspan="3" style="text-align: center; padding-top: 2rem;">
                    <img src="/static/assets/img/pexels-photo-1229042.jpeg" alt="Post Image" style="max-width: 500px; height: auto;" />
                  </td></tr>
                </table>
              `;
        postsContainer.appendChild(postElement);
      });

      // Met à jour la liste des catégories dynamiquement
      const categoriesContainer = document.getElementById(
        "categories-selection-container"
      );
      categoriesContainer.innerHTML = ""; // Vide le contenu actuel

      data.moods.forEach((category) => {
        const categoryElement = document.createElement("li");
        categoryElement.textContent = category.name;
        categoriesContainer.appendChild(categoryElement);
      });
    })
    .catch((error) =>
      console.error("Erreur lors de la récupération des données :", error)
    );
});
