
export function checkProfileImage(username, element) {

    const imgPath = `/static/assets/img/${username}/profileImage.png`;
    const img = new Image();
    
    img.src = imgPath;
    img.onload = () => {
        element.style.backgroundImage = `url('${imgPath}')`;
    };
    img.onerror = () => {
        console.warn(`❌ Image non trouvée pour ${username}, chargement de l'image par défaut.`);
        element.style.backgroundImage = `url('/static/assets/img/default-profile.png')`; // Image par défaut
    };
}


