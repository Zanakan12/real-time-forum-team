package handlers

import (
	"db"
	"encoding/json"
	"net/http"
	"strconv"
)

func PostUpdateValidationHandler(w http.ResponseWriter, r *http.Request) {
	// Vérifier si la méthode est POST
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données du formulaire
	postID := r.FormValue("post_id")
	content := r.FormValue("content")

	// Convertir l'ID du post en entier
	convPostID, err := strconv.Atoi(postID)
	if err != nil {
		http.Error(w, "ID du post invalide", http.StatusBadRequest)
		return
	}

	// Mettre à jour la base de données
	err = db.PostUpdateContent(convPostID, content)
	if err != nil {
		// Envoyer une réponse JSON en cas d'erreur
		response := map[string]string{"success": "false", "message": "Erreur lors de la mise à jour du post"}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(response)
		return
	}

	// Envoyer une réponse JSON en cas de succès
	response := map[string]string{"success": "true", "message": "Post mis à jour avec succès"}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(response)
}
