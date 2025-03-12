document.addEventListener("DOMContentLoaded", function () {
  function checkContainer() {
    const categoriesSelectionContainer = document.getElementById(
      "categories-selection-container"
    );
    if (categoriesSelectionContainer) {
      categoriesSelectionContainer.innerHTML = `
              <form action="/" method="post">
                <table>
                  <tr><td colspan="4"><hr width="100%"></td></tr>
                  <tr><td colspan="4" style="text-align: center;">You can filter last stories by moods:</td></tr>
                  <div id="categories-container"></div>
                  <tr><td colspan="4"><input type="submit" value="Let's blend this..." id="submit-button"/></td></tr>
                  <tr><td colspan="4"><hr width="100%"></td></tr>
                </table>
              </form>
              <style>#submit-button { width: 100%; }</style>
          `;
    } else {
      setTimeout(checkContainer, 100); // Réessayer après 100ms
    }
  }
  checkContainer();
});
