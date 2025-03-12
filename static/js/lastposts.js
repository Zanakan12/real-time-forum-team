document.addEventListener("DOMContentLoaded", function () {
  function checkContainer() {
    const lastPostsContainer = document.getElementById("lastposts-container");
    if (lastPostsContainer) {
      lastPostsContainer.innerHTML = `
            <table class="post">
              <tr><td colspan="3">Loading posts...</td></tr>
            </table>
          `;
      setTimeout(() => {
        lastPostsContainer.innerHTML = `
                <table class="post">
                  <tr><td class="posttitle">Example Post</td><td class="username">User123</td><td><span>Category 1</span></td></tr>
                  <tr><td colspan="3" class="written" style="font-style: italic; padding-bottom: 1.3rem;">Written at 2025-03-09</td></tr>
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
      }, 1000);
    } else {
      setTimeout(checkContainer, 100); // Réessayer après 100ms
    }
  }
  checkContainer();
});
