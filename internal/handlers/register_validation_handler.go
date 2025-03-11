package handlers

import (
	"db"
	"encoding/json"
	"net/http"
	"strings"
)

type RegisterValidationResponse struct {
	Success    bool   `json:"success"`
	RedirectTo string `json:"redirect_to,omitempty"`
	Error      string `json:"error,omitempty"`
}

func RegisterValidationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les valeurs du formulaire
	email := strings.ToLower(r.FormValue("email"))
	username := r.FormValue("username")
	password := r.FormValue("password")

	// Insérer l'utilisateur dans la base de données
	err := db.UserInsertRegister(email, username, password, "user")
	if err != nil {
		// En cas d'erreur, renvoyer un message JSON
		response := RegisterValidationResponse{
			Success: false,
			Error:   err.Error(),
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	// Enregistrer automatiquement l'utilisateur après l'inscription
	response := RegisterValidationResponse{
		Success:    true,
		RedirectTo: "/",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
