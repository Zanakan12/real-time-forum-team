package handlers

import (
	"db"
	"encoding/json"
	"middlewares"
	"net/http"
	"strconv"
)

// Structure pour la réponse JSON
type AdminResponse struct {
	Success           bool          `json:"success"`
	Message           string        `json:"message,omitempty"`
	Users             []db.User     `json:"users,omitempty"`
	Moods             []db.Category `json:"moods,omitempty"`
	Posts             []db.Post     `json:"posts,omitempty"`
	NotificationCount int           `json:"notification_count,omitempty"`
}

// Fonction pour renvoyer une réponse JSON
func respondWithJSON(w http.ResponseWriter, status int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(payload)
}

// AdminInterfaceHandler retourne maintenant du JSON
func AdminInterfaceHandler(w http.ResponseWriter, r *http.Request) {
	session := middlewares.GetCookie(w, r)
	userName, err := db.DecryptData(session.Username)

	// Vérification des droits d'accès
	if session.Role != "admin" && userName != "raftax" {
		respondWithJSON(w, http.StatusForbidden, AdminResponse{Success: false, Message: "Accès refusé"})
		return
	}

	if err != nil {
		respondWithJSON(w, http.StatusInternalServerError, AdminResponse{Success: false, Message: "Erreur de déchiffrement"})
		return
	}

	notifications, _ := db.NotificationsSelect(session.UserID)

	// ✅ **Si méthode POST, on met à jour la base de données**
	if r.Method == "POST" {
		if deleteID := r.FormValue("delete_id"); deleteID != "" {
			userID, err := strconv.Atoi(deleteID)
			if err == nil {
				err = db.DeleteUser(userID)
			}
			if err != nil {
				respondWithJSON(w, http.StatusInternalServerError, AdminResponse{Success: false, Message: "Erreur lors de la suppression"})
				return
			}
		}

		// ✅ **Mise à jour du rôle utilisateur**
		if userIDStr, role := r.FormValue("user_id"), r.FormValue("role"); userIDStr != "" && role != "" {
			userID, err := strconv.Atoi(userIDStr)
			if err == nil {
				err = db.UserUpdateRole(userID, role)
			}
			if err != nil {
				respondWithJSON(w, http.StatusInternalServerError, AdminResponse{Success: false, Message: "Erreur de mise à jour du rôle"})
				return
			} else if role == "banned" {
				db.PostDelete(userID)
			}
		}

		// ✅ **Suppression de Mood**
		if deleteMood := r.FormValue("moodID"); deleteMood != "" {
			moodID, err := strconv.Atoi(deleteMood)
			if err == nil {
				err = db.DeleteCategory(moodID)
			}
			if err != nil {
				respondWithJSON(w, http.StatusInternalServerError, AdminResponse{Success: false, Message: "Erreur suppression catégorie"})
				return
			}
		}

		// ✅ **Ajout de Mood**
		if addMood := r.FormValue("emoji"); addMood != "" {
			err := db.AddCategory(addMood)
			if err != nil {
				respondWithJSON(w, http.StatusInternalServerError, AdminResponse{Success: false, Message: "Erreur ajout mood"})
				return
			}
		}

		// ✅ **Mise à jour du statut d'un post**
		if postID := r.FormValue("post_id"); postID != "" {
			status := r.FormValue("status")
			id, _ := strconv.Atoi(postID)
			err := db.UpdatePostStatus(id, status)
			if err != nil {
				respondWithJSON(w, http.StatusInternalServerError, AdminResponse{Success: false, Message: "Erreur mise à jour statut post"})
				return
			}
		}

		// ✅ **Suppression d'un post**
		if postID := r.FormValue("deletepost_id"); postID != "" {
			id, _ := strconv.Atoi(postID)
			err := db.PostDelete(id)
			if err != nil {
				respondWithJSON(w, http.StatusInternalServerError, AdminResponse{Success: false, Message: "Erreur suppression post"})
				return
			}
		}

		// ✅ **Réponse après succès de la modification**
		respondWithJSON(w, http.StatusOK, AdminResponse{Success: true, Message: "Mise à jour effectuée"})
		return
	}

	// ✅ **Si méthode GET, récupérer les données**
	users, err := db.UserSelect(nil)
	if err != nil {
		respondWithJSON(w, http.StatusInternalServerError, AdminResponse{Success: false, Message: "Erreur récupération utilisateurs"})
		return
	}

	// Décryptage des noms d'utilisateur
	for i, user := range users {
		decryptedUsername, err := db.DecryptData(user.Username)
		decryptedUserEmail, err := db.DecryptData(user.Email)
		if err == nil {
			users[i].Username = decryptedUsername
			users[i].Email = decryptedUserEmail
		}
	}

	mood, err := db.SelectAllCategories()
	if err != nil {
		respondWithJSON(w, http.StatusInternalServerError, AdminResponse{Success: false, Message: "Erreur récupération catégories"})
		return
	}

	signaledPosts, err := db.DisplaySignaledStatus()
	if err != nil {
		respondWithJSON(w, http.StatusInternalServerError, AdminResponse{Success: false, Message: "Erreur récupération posts signalés"})
		return
	}

	// ✅ **Réponse en JSON avec les données**
	respondWithJSON(w, http.StatusOK, AdminResponse{
		Success:           true,
		Users:             users,
		Moods:             mood,
		Posts:             signaledPosts,
		NotificationCount: len(notifications),
	})
}
