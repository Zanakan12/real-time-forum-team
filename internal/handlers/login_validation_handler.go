package handlers

import (
	"db"
	"encoding/json"
	"middlewares"
	"net/http"
	"strings"
)

type LoginValidationResponse struct {
	Success    bool   `json:"success"`
	RedirectTo string `json:"redirect_to,omitempty"`
	Error      string `json:"error,omitempty"`
}

func LoginValidationHandler(w http.ResponseWriter, r *http.Request) {
	// Vérifier que la méthode est bien POST
	if r.Method != http.MethodPost {
		http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
		return
	}

	// Récupérer les données du formulaire
	email := strings.ToLower(r.FormValue("username_mail"))
	password := r.FormValue("password")

	// Vérifier les informations d'identification avec la base de données
	user, err := db.UserSelectLogin(email, password)
	if err != nil {
		// Retourner une erreur en JSON
		response := LoginValidationResponse{
			Success: false,
			Error:   "Identifiants incorrects",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	// Vérifier si l'utilisateur est banni
	if user.Role == "banned" {
		response := LoginValidationResponse{
			Success: false,
			Error:   "Votre compte est banni.",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	// Création de la session
	middlewares.CreateSession(w, user.ID, user.Username, user.Role)

	// Retourner une réponse JSON indiquant la redirection
	response := LoginValidationResponse{
		Success:    true,
		RedirectTo: "/",
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
