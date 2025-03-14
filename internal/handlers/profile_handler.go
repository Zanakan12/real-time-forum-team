package handlers

import (
	"db"
	"encoding/json"
	"log"
	"middlewares"
	"net/http"
)

type ProfileData struct {
	Success           bool      `json:"success"`
	Username          string    `json:"username"`
	UserRole          string    `json:"userRole"`
	UserID            int       `json:"userID"`
	CreatedAt         string    `json:"createdAt,omitempty"`
	MostRecentPosts   []db.Post `json:"mostRecentPosts,omitempty"`
	NotificationCount int       `json:"notificationCount"`
	Error             string    `json:"error,omitempty"`
	ShowUpdateForm    bool      `json:"showUpdateForm"`
}

// Fonction handler pour retourner du JSON
func ProfileHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json") // Indique qu'on envoie du JSON

	session := middlewares.GetCookie(w, r)
	if session.Username == "" {
		http.Error(w, `{"success": false, "error": "Not authenticated"}`, http.StatusUnauthorized)
		log.Println("Error: User not authenticated")
		return
	}

	// Récupérer les notifications de l'utilisateur
	notifications, _ := db.NotificationsSelect(session.UserID)

	// Décrypter le nom d'utilisateur
	userName, err := db.DecryptData(session.Username)
	if err != nil {
		http.Error(w, `{"success": false, "error": "Error decrypting username"}`, http.StatusInternalServerError)
		log.Println("Error decrypting username:", err)
		return
	}

	// Récupérer les activités (posts récents)
	activities, err := db.FilterUserPosts(session.UserID)
	if err != nil {
		log.Printf("Error fetching user posts: %v", err)
		http.Error(w, `{"success": false, "error": "Internal Server Error"}`, http.StatusInternalServerError)
		return
	}
	activities = countLikesDislikes(activities)

	// Vérifier si l'utilisateur a demandé la mise à jour du profil
	showUpdateForm := r.URL.Query().Get("update") == "true"

	// Structurer les données à renvoyer en JSON
	data := ProfileData{
		Success:           true,
		Username:          userName,
		UserRole:          session.Role,
		UserID:            session.UserID,
		MostRecentPosts:   activities,
		NotificationCount: countUnReadNotifications(notifications),
		Error:             r.URL.Query().Get("error"),
		ShowUpdateForm:    showUpdateForm,
	}

	// Convertir en JSON et envoyer la réponse
	json.NewEncoder(w).Encode(data)
}
