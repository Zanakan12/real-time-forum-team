package handlers

import (
	"db"
	"encoding/json"
	"fmt"
	"middlewares"
	"net/http"
)

// ✅ Handler qui répond en JSON
func UserValidationRequestHandler(w http.ResponseWriter, r *http.Request) {
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

	// Récupérer la session de l'utilisateur
	session := middlewares.GetCookie(w, r)
	if session.Username == "" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusUnauthorized)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   "User not authenticated",
		})
		return
	}

	// Insérer la requête dans la base de données
	err := db.RequestInsert(session.UserID, session.Username)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(Response{
			Success: false,
			Error:   fmt.Sprintf("Error inserting request: %v", err),
		})
		return
	}

	// ✅ Succès : Retourner une réponse JSON
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(Response{
		Success: true,
		Message: "Request successfully sent",
	})
}
