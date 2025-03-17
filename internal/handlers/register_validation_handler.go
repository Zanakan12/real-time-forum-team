package handlers

import (
	"db"
	"encoding/json"
	"net/http"
	"strings"
)

// Structure pour la réponse JSON
type Response struct {
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

func RegisterValidationHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Redirect(w, r, "/", http.StatusSeeOther)
		return
	}

	// Récupération des données du formulaire
	email := strings.ToLower(r.FormValue("email"))
	username := r.FormValue("username")
	password := r.FormValue("password")
	firstName := r.FormValue("first_name")
	lastName := r.FormValue("last_name")
	genre := r.FormValue("genre")

	// Vérification si l'utilisateur existe déjà
	exists, err := db.UserExists(email, username)
	if err != nil {
		http.Error(w, "Erreur serveur", http.StatusInternalServerError)
		return
	}
	if exists {
		http.Redirect(w, r, "/register?error=Email ou username déjà utilisé", http.StatusSeeOther)
		return
	}

	// Inscription de l'utilisateur
	err = db.UserInsertRegister(email, username, password, firstName, lastName, genre, "user")
	if err != nil {
		http.Redirect(w, r, "/register?error=Erreur lors de l'inscription", http.StatusSeeOther)
		return
	}

	// Redirection après succès
	json.NewEncoder(w).Encode(Response{Success: true})
}
