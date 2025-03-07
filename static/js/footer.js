function loadFooter() {
    const footerHTML = `
        <footer>
            <p>&copy; 2024 MonSite. All rights reserved.</p>
        </footer>
    `;

    document.body.insertAdjacentHTML("beforeend", footerHTML);
}

// Charger le footer après que le DOM soit prêt
window.addEventListener("DOMContentLoaded", loadFooter);
