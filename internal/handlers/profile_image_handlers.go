package handlers

import (
	"db"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"middlewares"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
)

type Response struct {
	Success  bool   `json:"success"`
	Message  string `json:"message,omitempty"`
	Error    string `json:"error,omitempty"`
	Image    string `json:"image,omitempty"`
	NewCount int    `json:"newCount"`
}

// Fonction qui sauvegarde l'image sous le nom "profileimage"
func saveImageToUserFolder(username string, fileHeader *multipart.FileHeader, file multipart.File) (string, error) {
	// Créer le dossier de l'utilisateur
	userDir := filepath.Join("static", "assets", "img", username)
	err := os.MkdirAll(userDir, os.ModePerm)
	if err != nil {
		return "", fmt.Errorf("Erreur lors de la création du dossier : %v", err)
	}

	// Récupérer l'extension du fichier original
	ext := filepath.Ext(fileHeader.Filename) // Exemple : ".jpg" ou ".png"

	ext = ".png" // Sécurité : Si pas d'extension, on met ".png"

	// Nom du fichier toujours "profileimage.extension"
	filePath := filepath.Join(userDir, "profileImage"+ext)

	// Création du fichier destination
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("Erreur lors de la création du fichier : %v", err)
	}
	defer dst.Close()

	// Copier le fichier
	_, err = io.Copy(dst, file)
	if err != nil {
		return "", fmt.Errorf("Erreur lors de l'enregistrement de l'image : %v", err)
	}

	return filePath, nil
}

// ✅ Gestionnaire de l'upload qui retourne un JSON
func UploadHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   "Méthode non autorisée",
		})
		return
	}

	// Récupérer le nom d'utilisateur
	username := middlewares.GetCookie(w, r)
	usernameDecrypted, err := db.DecryptData(username.Username)
	if err != nil {
		log.Printf("Erreur lors du decryptage de l'ussername %s", err)
	}
	if usernameDecrypted == "traveller" {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   "Erreur : Nom d'utilisateur manquant",
		})
		return
	}

	// Récupérer le fichier
	file, fileHeader, err := r.FormFile("image")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   "Erreur : Aucune image fournie",
		})
		return
	}
	defer file.Close()

	// Sauvegarde avec nom "profileimage"
	filePath, err := saveImageToUserFolder(usernameDecrypted, fileHeader, file)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   err.Error(),
		})
		return
	}

	// ✅ Réponse JSON de succès
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "Image enregistrée avec succès",
		Image:   filePath, // Chemin de l'image sauvegardée
	})
}
