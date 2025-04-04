package db

import (
	"config"
	"database/sql"
	"fmt"

	"golang.org/x/crypto/bcrypt"
)

func createUsersTable(db *sql.DB) {
	// SQL statement to create the users table if it does not already exist
	createTableSQL := `CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		email VARCHAR(255) NOT NULL UNIQUE,
		username VARCHAR(50) NOT NULL UNIQUE,
		password VARCHAR(255) NOT NULL,
		first_name VARCHAR(255),
		last_name VARCHAR(255),
		genre VARCHAR(50),
		role TEXT NOT NULL CHECK (role IN ('admin', 'user', 'moderator','banned')),
		created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
		last_refresh TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);`

	// Call executeSQL to run the SQL statement and create the table
	executeSQL(db, createTableSQL)
}

// RegisterUser registers a new user in the database.
func UserInsertRegister(email, username, password, firstName, lastName, genre, role string) error {
	db := SetupDatabase()
	defer db.Close()

	users, _ := UserSelect(db)
	for _, user := range users {
		decryptedEmail, _ := DecryptData(user.Email)
		decryptedUsername, _ := DecryptData(user.Username)
		if decryptedEmail == email {
			return fmt.Errorf("Email already exists.")
		} else if decryptedUsername == username {
			return fmt.Errorf("Username already exists.")
		}
	}

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}

	// Hash du mot de passe
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("error hashing password: %v", err)
	}

	// Chiffrement des données sensibles
	encryptedEmail, err := EncryptData(email)
	if err != nil {
		return fmt.Errorf("error encrypting email: %v", err)
	}
	encryptedUsername, err := EncryptData(username)
	if err != nil {
		return fmt.Errorf("error encrypting username: %v", err)
	}

	insertSQL := `INSERT INTO users (email, username, password, first_name, last_name, genre, role) VALUES (?, ?, ?, ?, ?, ?, ?)`
	_, err = tx.Exec(insertSQL, encryptedEmail, encryptedUsername, hashedPassword, firstName, lastName, genre, role)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error executing statement: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}

// vérifier l'existance de l'utilisateur
func UserExists(email, username string) (bool, error) {
	db := SetupDatabase()
	defer db.Close()

	var count int
	query := `SELECT COUNT(*) FROM users WHERE email = ? OR username = ?`
	err := db.QueryRow(query, email, username).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("error checking user existence: %v", err)
	}

	return count > 0, nil
}

// LoginUser authentifie un utilisateur en vérifiant ses identifiants.
func UserSelectLogin(identifier, password string) (User, error) {
	db := SetupDatabase()
	defer db.Close()
	users, _ := UserSelect(db)

	emailExists := false
	cryptedEmail := ""

	// Vérifier si l'identifier est un email chiffré
	for _, user := range users {
		decryptedEmail, _ := DecryptData(user.Email)
		decryptedUsername, _ := DecryptData(user.Username)
		if (decryptedEmail == identifier) || (decryptedUsername == identifier) {
			emailExists = true
			cryptedEmail = user.Email
			break
		}
	}

	tx, err := db.Begin()
	if err != nil {
		return User{}, fmt.Errorf("error starting transaction: %v", err)
	}

	// Déterminer le champ de recherche (email ou username)
	var user User
	var querySQL string
	var queryArgs []interface{}

	if emailExists {
		// Si c'est un email, on utilise l'email chiffré
		querySQL = `SELECT id, username, password, role FROM users WHERE email = ?`
		queryArgs = append(queryArgs, cryptedEmail)
	} else {
		// Sinon, c'est un username
		querySQL = `SELECT id, username, password, role FROM users WHERE username = ?`
		queryArgs = append(queryArgs, identifier)
	}

	err = db.QueryRow(querySQL, queryArgs...).Scan(&user.ID, &user.Username, &user.Password, &user.Role)
	if err != nil {
		tx.Rollback()
		if err == sql.ErrNoRows {
			return User{}, fmt.Errorf("Identifiants incorrects.")
		}
		return User{}, fmt.Errorf("error executing statement: %v", err)
	}

	// Vérifier le mot de passe
	if !verifyPassword(user.Password, password) {
		return User{}, fmt.Errorf("Invalid Password.")
	}

	if err = tx.Commit(); err != nil {
		return User{}, fmt.Errorf("error committing transaction: %v", err)
	}

	return user, nil
}

// Select a user from an ID
func UserSelectById(userID int) (User, error) {
	db := SetupDatabase()
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return User{}, fmt.Errorf("error starting transaction: %v", err)
	}

	// Récupérer l'utilisateur de la base de données
	var storedUser User
	querySQL := `SELECT username, role FROM users WHERE id = ?`
	err = db.QueryRow(querySQL, userID).Scan(&storedUser.Username, &storedUser.Role)
	if err != nil {
		tx.Rollback()
		return User{}, fmt.Errorf("error executing statement: %v", err)
	}

	storedUser.Username, _ = DecryptData(storedUser.Username)

	if err = tx.Commit(); err != nil {
		return User{}, fmt.Errorf("error committing transaction: %v", err)
	}

	return storedUser, nil
}

func UserUpdateRole(userID int, newrole string) error {

	// Verify if the role exist
	roleExist := false
	for _, char := range config.ROLES {
		if char == newrole {
			roleExist = true
		}
	}
	if !roleExist {
		return fmt.Errorf("role not found")
	}

	// open database
	db := SetupDatabase()
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}

	// Assign role to user
	query := `UPDATE users SET role = ? WHERE id = ?`
	_, err = db.Exec(query, newrole, userID)

	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error executing statement: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}

func UserUpdateName(userID int, newName string) (string, error) {
	// Vérifier si le nom est valide
	if len(newName) < 2 || len(newName) > 50 {
		return "", fmt.Errorf("invalid name length: must be between 2 and 50 characters")
	}

	// Ouvrir la base de données
	db := SetupDatabase()
	defer db.Close()

	// Démarrer la transaction
	tx, err := db.Begin()
	if err != nil {
		return "", fmt.Errorf("error starting transaction: %v", err)
	}

	// Chiffrer le nouveau nom
	encryptedNewName, err := EncryptData(newName)
	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("error encrypting new name: %v", err)
	}

	// Mettre à jour le nom de l'utilisateur
	query := `UPDATE users SET username = ? WHERE id = ?`
	_, err = tx.Exec(query, encryptedNewName, userID)
	if err != nil {
		tx.Rollback()
		return "", fmt.Errorf("error executing statement: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return "", fmt.Errorf("error committing transaction: %v", err)
	}

	return encryptedNewName, nil
}

func UserSelect(dab *sql.DB) ([]User, error) {
	db := SetupDatabase()
	defer db.Close()
	tx, err := db.Begin()
	if err != nil {
		return nil, fmt.Errorf("erreur lors du début de la transaction: %v", err)
	}

	defer func() {
		if err != nil {
			tx.Rollback()
			return
		}
	}()

	query := `
		SELECT id, username, email, role, password, created_at FROM users
	`

	rows, err := tx.Query(query)
	if err != nil {
		return nil, fmt.Errorf("erreur lors de la requête des utilisateurs par ID: %v", err)
	}
	defer rows.Close()

	var users []User
	for rows.Next() {
		var user User
		err := rows.Scan(
			&user.ID,
			&user.Username,
			&user.Email,
			&user.Role,
			&user.Password,
			&user.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("erreur lors du scan des données de l'utilisateur: %v", err)
		}

		users = append(users, user)
	}

	if err = rows.Err(); err != nil {
		return nil, fmt.Errorf("erreur lors de l'itération sur les utilisateurs: %v", err)
	}

	err = tx.Commit()
	if err != nil {
		return nil, fmt.Errorf("erreur lors du commit de la transaction: %v", err)
	}

	return users, nil
}

// DeleteUser removes a user from the database using their ID.
func DeleteUser(userID int) error {
	db := SetupDatabase()
	defer db.Close()

	// Begin a transaction
	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("error starting the transaction: %v", err)
	}

	// Prepare the query to delete the user
	query := "DELETE FROM users WHERE id = ?"
	_, err = tx.Exec(query, userID)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error deleting the user: %v", err)
	}

	// Commit the transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing the transaction: %v", err)
	}

	return nil
}

// Discord/Google Login authentifie un utilisateur en vérifiant ses identifiants.
func UserSelectLoginOAuth(email string) (User, error) {

	db := SetupDatabase()
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return User{}, fmt.Errorf("error starting transaction: %v", err)
	}
	// Récupérer l'utilisateur de la base de données
	var user User

	emails, _ := GetAllEmails()

	for _, e := range emails {
		aux, _ := DecryptData(e)

		if aux == email {
			email = e
		}
	}

	querySQL := `SELECT id, username, role FROM users WHERE email = ?`
	err = db.QueryRow(querySQL, email).Scan(&user.ID, &user.Username, &user.Role)
	if err != nil {
		tx.Rollback()
		if err == sql.ErrNoRows {
			return User{}, fmt.Errorf("Wrong email.")
		}
		return User{}, fmt.Errorf("error executing statement: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return User{}, fmt.Errorf("error committing transaction: %v", err)
	}
	return user, nil
}

// Discord/Google registers a new user in the database.
func UserInsertRegisterOAuth(email, username, role string) error {
	db := SetupDatabase()
	defer db.Close()

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("error starting transaction: %v", err)
	}
	encryptedUsername, err := EncryptData(username)
	if err != nil {
		return fmt.Errorf("error encrypting username: %v", err)
	}

	insertSQL := `INSERT INTO users (email, username, role, password) VALUES (?, ?, ?, ?)`
	_, err = tx.Exec(insertSQL, email, encryptedUsername, role, "##########")
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("error executing statement: %v", err)
	}

	if err = tx.Commit(); err != nil {
		return fmt.Errorf("error committing transaction: %v", err)
	}

	return nil
}

func GetAllEmails() ([]string, error) {

	db := SetupDatabase()
	defer db.Close()

	var emails []string

	rows, err := db.Query("SELECT email FROM users")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var email string
		if err := rows.Scan(&email); err != nil {
			return nil, err
		}
		emails = append(emails, email)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return emails, nil
}
