package handlers

import (
	"encoding/json"
	"net/http"
	"net/url"
)

// Structure pour contenir les données de la page Register
type RegisterPageData struct {
	Error          string `json:"error"`
	EmailLabel     string `json:"email_label"`
	FirstNameLabel string `json:"first_name_label"`
	LastNameLabel  string `json:"last_name_label"`
	UsernameLabel  string `json:"username_label"`
	PasswordLabel  string `json:"password_label"`
}

// Fonction pour servir les données JSON de l'inscription
func RegisterDataAPIHandler(w http.ResponseWriter, r *http.Request) {
	// Récupérer le message d'erreur s'il existe
	errorMsg := r.URL.Query().Get("error")
	if errorMsg != "" {
		errorMsg, _ = url.QueryUnescape(errorMsg)
	}

	// Remplir la structure de données
	registerData := RegisterPageData{
		Error:          errorMsg,
		EmailLabel:     "Email",
		FirstNameLabel: "First Name",
		LastNameLabel:  "Last Name",
		UsernameLabel:  "Username",
		PasswordLabel:  "Password",
	}

	// Convertir en JSON et envoyer la réponse
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(registerData)
}
