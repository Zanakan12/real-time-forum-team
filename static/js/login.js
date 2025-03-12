export function loginPage() {
    const div = document.createElement("div");
    div.innerHTML = `
        <form id="login-form">
            <table class="post">
                <tr id="login-error"></tr>
                <tr>
                    <td id="login-message"></td>
                    <td style="display: flex; justify-content: space-between;">
                        <button type="button" onclick="window.location.href='/google-login'" style="background-color: rgb(37, 37, 37);">
                            <img src="/static/assets/img/google_logo.png" alt="" style="height: 2em;">
                        </button>
                        <button type="button" onclick="window.location.href='/reddit-login'" style="background-color: rgb(37, 37, 37);">
                            <img src="/static/assets/img/reddit_logo.png" alt="" style="height: 2em;">
                        </button>
                        <button type="button" onclick="window.location.href='/dis-login'" style="background-color: rgb(37, 37, 37);">
                            <img src="/static/assets/img/discord-logo.png" alt="" style="height: 2em;">
                        </button>
                    </td>
                </tr>
                <tr>
                    <td><label for="username_mail">Email:</label></td>
                    <td><input type="text" id="username_mail" name="username_mail" required placeholder="first_name"></td>
                </tr>
                <tr>
                    <td><label for="password">Mot de passe:</label></td>
                    <td><input type="password" id="password" name="password" required></td>
                </tr>
                <tr>
                    <td></td>
                    <td style="text-align: right;"><input type="submit" value="Se connecter"></td>
                </tr>
            </table>
        </form>
    `;

    // Ajout de l'événement pour intercepter la soumission du formulaire
    div.querySelector("#login-form").addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const response = await fetch("/login-validation", {
            method: "POST",
            body: formData
        });
        
        if (response.ok) {
            // Si la réponse est correcte, vérifier la redirection ou le JSON
            if (response.redirected) {
                window.location.href = response.url;
            } else {
                const responseData = await response.json(); // Si la réponse est JSON
                // Assurez-vous que le serveur renvoie un JSON avec une structure appropriée
                if (responseData.error) {
                    document.getElementById("login-error").innerText = responseData.error;
                } else {
                    // Si tout va bien, rediriger ou afficher un message de succès
                    window.location.href = responseData.redirectUrl || '/#register'; // Exemple de redirection
                }
            }
        } else {
            const errorText = await response.text();
            document.getElementById("login-error").innerText = errorText;
        }
    });

    return div;
}
