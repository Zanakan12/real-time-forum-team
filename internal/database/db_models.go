package db

import (
	"database/sql"
)

// Structure d'un utilisateur
type User struct {
	ID        int    `json:"id"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	Role      string `json:"role"`
	CreatedAt string `json:"created_at"`
}

// Structure d'un post
type Post struct {
	ID            int             `json:"id"`
	UserID        int             `json:"user_id"`
	Title         string          `json:"title"`
	Body          string          `json:"body"`
	Status        string          `json:"status"`
	CreatedAt     string          `json:"created_at"`
	UpdatedAt     string          `json:"updated_at"`
	User          User            `json:"user"`
	ImagePath     string          `json:"image_path"`
	Categories    []Category      `json:"categories"`
	Comments      []Comment       `json:"comments"`
	LikesDislikes []LikesDislikes `json:"likes_dislikes"`
	LikesCount    int             `json:"likes_count"`
	DislikesCount int             `json:"dislikes_count"`
}

// Structure d'un commentaire
type Comment struct {
	ID            int             `json:"id"`
	PostID        int             `json:"post_id"`
	UserID        int             `json:"user_id"`
	Content       string          `json:"content"`
	CreatedAt     string          `json:"created_at"`
	UpdatedAt     string          `json:"updated_at"`
	LikesDislikes []LikesDislikes `json:"likes_dislikes"`
	Username      string          `json:"username"`
	LikesCount    int             `json:"likes_count"`
	DislikesCount int             `json:"dislikes_count"`
	PostTitle     string          `json:"post_title"`
}

// Structure d'une catégorie
type Category struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

// Structure pour l'association entre un post et une catégorie
type PostCategory struct {
	PostID     int `json:"post_id"`
	CategoryId int `json:"category_id"`
}

// Structure pour les likes et dislikes
type LikesDislikes struct {
	ID        int           `json:"id"`
	UserID    int           `json:"user_id"`
	PostID    sql.NullInt64 `json:"post_id"`
	CommentID sql.NullInt64 `json:"comment_id"`
	IsLike    bool          `json:"is_like"`
	CreatedAt string        `json:"created_at"`
	PostTitle string        `json:"post_title"`
	Username  string        `json:"username"`
}

// Structure pour les images associées à un post
type Images struct {
	ID        int    `json:"id"`
	PostID    int    `json:"post_id"`
	FilePath  string `json:"file_path"`
	FileSize  int    `json:"file_size"`
	CreatedAt string `json:"created_at"`
}

// Structure des notifications
type Notification struct {
	ID            int64         `json:"id"`
	UserID        int64         `json:"user_id"`
	CommentID     sql.NullInt64 `json:"comment_id"`
	LikeDislikeID sql.NullInt64 `json:"like_dislike_id"`
	IsRead        bool          `json:"is_read"`
	CreatedAt     string        `json:"created_at"`
}

// Structure des activités utilisateur
type Activity struct {
	Type      string `json:"type"`
	Content   string `json:"content"`
	Timestamp string `json:"timestamp"`
}

// Structure pour suivre les posts tendances
type PostTendance struct {
	PostID int64 `json:"post_id"`
	Count  int   `json:"count"`
}

// Structure pour la demande de modération
type ModeratorRequest struct {
	PostID           int            `json:"post_id"`
	Title            string         `json:"title"`
	ModeratorRequest string         `json:"moderator_request"`
	AdminResponse    sql.NullString `json:"admin_response"`
}

// Structure d'un message WebSocket
type WebSocketMessage struct {
	Type      string `json:"type"`       // "message" ou "user_list"
	Username  string `json:"username"`   // Expéditeur
	Recipient string `json:"recipient"`  // Destinataire
	Content   string `json:"content"`    // Contenu du message     // Indique si le message a été lu
	CreatedAt string `json:"created_at"` // Timestamp
	Read      bool   `json:"read"`
	Sender    bool   `json:"sender"`
}

type LastMessageUser struct {
	Username    string `json:"username"`
	LastMessage string `json:"last_message"`
}
