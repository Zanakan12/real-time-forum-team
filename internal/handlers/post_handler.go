package handlers

import (
	"db"
	"encoding/json"
	"io"
	"middlewares"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// Fonction pour vérifier le type d'image
func isValidImageType(header *multipart.FileHeader) bool {
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/png":  true,
		"image/gif":  true,
	}

	// Ouvrir le fichier pour lire le type MIME
	file, err := header.Open()
	if err != nil {
		return false
	}
	defer file.Close()

	buf := make([]byte, 512)
	_, err = file.Read(buf)
	if err != nil {
		return false
	}

	fileType := http.DetectContentType(buf)
	return allowedTypes[fileType]
}

// Structure pour la réponse JSON
type PostResponse struct {
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
	PostID  int    `json:"post_id,omitempty"`
	Image   string `json:"image,omitempty"`
}

// PostValidationHandler gère l'insertion d'un post
func PostValidationHandler(w http.ResponseWriter, r *http.Request) {
	// Vérifier la méthode POST
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	session := middlewares.GetCookie(w, r)
	if session.Username == "" {
		http.Error(w, "Utilisateur non authentifié", http.StatusUnauthorized)
		return
	}

	// Récupérer le texte du post
	postBody := r.FormValue("body")
	if strings.TrimSpace(postBody) == "" {
		http.Error(w, "Le champ 'body' est requis", http.StatusBadRequest)
		return
	}

	// Générer un titre automatique
	title := makeTitle(postBody)

	// Récupérer les catégories sélectionnées
	selectedMoods := r.Form["moods"]
	categories := []int{}
	for _, mood := range selectedMoods {
		category, _ := strconv.Atoi(mood)
		categories = append(categories, category)
	}

	// Initialiser l'upload d'image
	var imagePath string
	var fileSize int

	file, header, err := r.FormFile("image")
	if err == nil && file != nil {
		defer file.Close()

		// Vérifier la taille du fichier
		if header.Size > 20*1024*1024 { // 20 Mo
			http.Error(w, "L'image dépasse 20 Mo", http.StatusRequestEntityTooLarge)
			return
		}

		// Vérifier le type de l'image
		if !isValidImageType(header) {
			http.Error(w, "Format d'image non valide", http.StatusUnsupportedMediaType)
			return
		}

		// Définir le répertoire utilisateur
		userDir := filepath.Join("./static/assets/img", session.Username)
		if err := os.MkdirAll(userDir, os.ModePerm); err != nil {
			http.Error(w, "Erreur lors de la création du dossier utilisateur", http.StatusInternalServerError)
			return
		}

		// Générer un nom de fichier unique
		timestamp := time.Now().Unix()
		ext := filepath.Ext(header.Filename) // Récupère l'extension (.jpg, .png, etc.)
		newFileName := strconv.FormatInt(timestamp, 10) + ext
		dstPath := filepath.Join(userDir, newFileName)

		// Créer le fichier sur le serveur
		dst, err := os.Create(dstPath)
		if err != nil {
			http.Error(w, "Erreur lors de l'enregistrement de l'image", http.StatusInternalServerError)
			return
		}
		defer dst.Close()

		// Copier le fichier téléchargé
		if _, err := io.Copy(dst, file); err != nil {
			http.Error(w, "Erreur de copie de fichier", http.StatusInternalServerError)
			return
		}

		// Générer le chemin accessible via le web
		imagePath = "/static/assets/img/" + session.Username + "/" + newFileName

		// Récupérer la taille de l'image
		imageFileInfo, err := os.Stat(dstPath)
		if err != nil {
			http.Error(w, "Erreur lors de la récupération des infos du fichier", http.StatusInternalServerError)
			return
		}
		fileSize = int(imageFileInfo.Size())
	}

	// Insérer le post et obtenir l'ID
	postID, err := db.PostInsert(session.UserID, title, postBody, categories)
	if err != nil {
		http.Error(w, "Erreur lors de l'insertion du post", http.StatusInternalServerError)
		return
	}

	// Enregistrer l'image dans la base de données si elle existe
	if file != nil {
		err = db.ImageInsert(postID, fileSize, imagePath)
		if err != nil {
			http.Error(w, "Erreur lors de l'insertion de l'image", http.StatusInternalServerError)
			return
		}
	}

	// Envoyer la réponse JSON
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(PostResponse{
		Success: true,
		PostID:  postID,
		Image:   imagePath,
	})
}

// Fonction pour générer un titre à partir du contenu
func makeTitle(content string) string {
	maxLength := 20
	words := strings.Fields(content)

	if len(words) >= 3 {
		title := strings.Join(words[:3], " ")
		if len(title) > maxLength {
			return title[:maxLength] + "..."
		}
		return title + "..."
	}

	if len(content) > maxLength {
		return content[:maxLength]
	}

	return content
}
