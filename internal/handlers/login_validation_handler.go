package handlers

import (
    "db"
    "encoding/json"
    "fmt"
    "middlewares"
    "net/http"
    "strings"
)

type LoginValidationResponse struct {
    Success    bool   `json:"success"`
    RedirectTo string `json:"redirect"`
    Error      string `json:"error"`
}

func LoginValidationHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Méthode non autorisée", http.StatusMethodNotAllowed)
        return
    }

    // Récupérer et normaliser les données du formulaire
    email := strings.ToLower(r.FormValue("username_mail"))
    password := r.FormValue("password")

    fmt.Println("Tentative de connexion avec :", email)

    // Vérifier les informations d'identification avec la base de données
    user, err := db.UserSelectLogin(email, password)
    if err != nil {
        fmt.Println("Erreur lors de la recherche de l'utilisateur :", err)
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
        fmt.Println("Utilisateur banni :", user.Email)
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

    fmt.Println("Connexion réussie pour :", user.Email)

    // Réponse de succès avec redirection
    response := LoginValidationResponse{
        Success:    true,
        RedirectTo: "/",
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(response)
}