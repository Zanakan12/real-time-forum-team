package handlers

import (
	"db"
	"encoding/json"
	"fmt"
	"middlewares"
	"net/http"
)



// ✅ Handler pour mettre à jour le nom et renvoyer un JSON
func UpdateNameHandler(w http.ResponseWriter, r *http.Request) {
	// Vérifier que la requête est bien en POST
	if r.Method != http.MethodPost {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   "Invalid request method",
		})
		return
	}

	// Récupérer la session utilisateur
	session := middlewares.GetCookie(w, r)
	if session.UserID == 0 {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   "Utilisateur non connecté",
		})
		return
	}

	// Récupérer le nouveau nom d'utilisateur
	newName := r.FormValue("new_name")
	if newName == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   "Le champ 'new_name' est vide",
		})
		return
	}

	// Mettre à jour le nom dans la base de données
	encryptedNewName, err := db.UserUpdateName(session.UserID, newName)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   fmt.Sprintf("Erreur lors de la mise à jour : %v", err),
		})
		return
	}

	// Supprimer et recréer la session avec le nouveau nom
	cookie, err := r.Cookie("session_id")
	if err == nil {
		sessionID := cookie.Value
		middlewares.DeleteSession(sessionID)
	}
	middlewares.CreateSession(w, session.UserID, encryptedNewName, session.Role)

	// ✅ Succès : Retourner un JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "Nom mis à jour avec succès",
	})
}
