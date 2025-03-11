export async function RegisterPage() {
    // Création du conteneur principal
    const div = document.createElement("div");

    // Récupérer les données dynamiquement depuis l'API
    let registerData;
    try {
        const response = await fetch("/api/register-data");
        registerData = await response.json();
    } catch (error) {
        console.error("Erreur lors du chargement des données d'inscription :", error);
        return div;
    }

    // Construire le formulaire avec les données récupérées
    div.innerHTML = `
    <form action="/register-validation" method="post">
        <table class="post">
            ${registerData.error ? `<tr><td colspan="2" style="color: red;">${registerData.error}</td></tr>` : ""}
            <tr>
                <td><label for="email">${registerData.email_label}</label></td>
                <td><input type="email" id="email" name="email" required></td>
            </tr>
            <tr>
                <td><label for="firstName">${registerData.first_name_label}</label></td>
                <td><input type="text" id="firstName" name="firstName" required></td>
            </tr>
            <tr>
                <td><label for="lastName">${registerData.last_name_label}</label></td>
                <td><input type="text" id="lastName" name="lastName" required></td>
            </tr>
            <tr>
                <td><label for="username">${registerData.username_label}</label></td>
                <td><input type="text" id="username" name="username" required></td>
            </tr>
            <tr>
                <td><label for="password">${registerData.password_label}</label></td>
                <td><input type="password" id="password" name="password" required></td>
            </tr>
            <tr>
                <td></td>
                <td style="text-align: right;"><input type="submit" value="Submit"></td>
            </tr>
        </table>
    </form>
    `;

    return div;
}
