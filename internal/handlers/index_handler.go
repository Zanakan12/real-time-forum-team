package handlers

import (
	"db"
	"encoding/json"
	"html/template"
	"log"
	"middlewares"
	"net/http"
	"net/url"
)

// IndexHandler gère la page principale et retourne JSON si demandé.
func IndexHandler(w http.ResponseWriter, r *http.Request) {
	// Vérifie si on demande du JSON
	if r.URL.Query().Get("format") == "json" {
		log.Println("Requête JSON détectée") // Vérifie dans les logs
		sendJSONResponse(w, r)
		return
	}

	log.Println("Chargement de la page HTML classique")

	imgErrorMsg := r.URL.Query().Get("error")
	if imgErrorMsg != "" {
		imgErrorMsg, _ = url.QueryUnescape(imgErrorMsg)
	}

	// Récupération des notifications et de l'utilisateur
	var notification []db.Notification
	session := middlewares.GetCookie(w, r)
	if session.Username == "" {
		session.Username = "Traveler"
		session.Role = "traveler"
		session.UserID = -1
	} else {
		session.Username, _ = db.DecryptData(session.Username)
		notification, _ = db.NotificationsSelect(session.UserID)
	}

	// Récupération des posts
	mostRecentPosts, err := db.FilterSelectMostRecentPosts()
	if err != nil {
		http.Error(w, "Erreur lors de la récupération des posts", http.StatusInternalServerError)
		return
	}

	// Récupération des catégories
	moods, _ := db.SelectAllCategories()

	// Création des données pour la page
	indexData := IndexPage{
		Title:             "4mood",
		Moods:             moods,
		MostRecentPosts:   mostRecentPosts,
		UserID:            session.UserID,
		UserUsername:      session.Username,
		UserRole:          session.Role,
		NotificationCount: countUnReadNotifications(notification),
		CurrentPage:       "index",
		ErrorMsgs:         imgErrorMsg,
	}

	// Charger les templates HTML
	tmpl, err := template.ParseFiles("web/templates/index1.html")
	if err != nil {
		http.Error(w, "Erreur serveur (Parsing templates)", http.StatusInternalServerError)
		return
	}

	// Exécuter le template HTML
	err = tmpl.Execute(w, indexData)
	if err != nil {
		http.Error(w, "Erreur serveur (Exécution template)", http.StatusInternalServerError)
		return
	}
}

// Envoi des données en JSON
func sendJSONResponse(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")

	mostRecentPosts, err := db.FilterSelectMostRecentPosts()
	if err != nil {
		log.Println("Erreur lors de la récupération des posts :", err)
		http.Error(w, `{"error": "Erreur lors de la récupération des posts"}`, http.StatusInternalServerError)
		return
	}

	moods, err := db.SelectAllCategories()
	if err != nil {
		log.Println("Erreur lors de la récupération des catégories :", err)
		http.Error(w, `{"error": "Erreur lors de la récupération des catégories"}`, http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"mostRecentPosts": mostRecentPosts,
		"moods":           moods,
	}

	// Log des données envoyées pour debug
	jsonData, err := json.MarshalIndent(response, "", "  ") // Format JSON lisible
	if err != nil {
		log.Println("Erreur de conversion JSON :", err)
		http.Error(w, `{"error": "Erreur d'encodage JSON"}`, http.StatusInternalServerError)
		return
	}

	log.Println("Réponse JSON envoyée :", string(jsonData)) // Affiche clairement la réponse JSON

	w.Write(jsonData)
}
