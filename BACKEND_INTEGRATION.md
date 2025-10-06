# COSUMAR Smart Presence - Guide d'intégration Backend

## Vue d'ensemble

Cette application utilise actuellement **AsyncStorage** pour le stockage local des données (prototype). Ce document explique comment remplacer le stockage local par un backend PHP/MySQL.

---

## Architecture actuelle (Prototype)

### Contextes React
- **AuthContext** (`contexts/AuthContext.tsx`) : Gestion des utilisateurs et authentification
- **PresenceContext** (`contexts/PresenceContext.tsx`) : Gestion des présences et tokens quotidiens

### Stockage AsyncStorage
- `@cosumar_users` : Liste des utilisateurs
- `@cosumar_current_user` : Utilisateur connecté
- `@cosumar_presence` : Liste des présences
- `@cosumar_daily_token` : Token du jour

---

## Modèles de données

### Table `users`
```sql
CREATE TABLE users (
  id VARCHAR(50) PRIMARY KEY,
  matricule VARCHAR(20) UNIQUE NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  departement VARCHAR(100) NOT NULL,
  metier VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('employee', 'admin') DEFAULT 'employee',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Table `presence`
```sql
CREATE TABLE presence (
  id VARCHAR(50) PRIMARY KEY,
  user_id VARCHAR(50),
  matricule VARCHAR(20) NOT NULL,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  departement VARCHAR(100) NOT NULL,
  metier VARCHAR(100) NOT NULL,
  date DATE NOT NULL,
  heure TIME NOT NULL,
  token VARCHAR(50) NOT NULL,
  statut ENUM('Présent', 'Absent', 'Retard') DEFAULT 'Présent',
  marked_manually BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY unique_presence (matricule, date, token)
);
```

### Table `daily_tokens`
```sql
CREATE TABLE daily_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  token VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API Endpoints à créer

### 1. Authentification

#### POST `/api/auth/register`
**Body:**
```json
{
  "matricule": "EMP001",
  "nom": "Doe",
  "prenom": "John",
  "departement": "Production",
  "metier": "Technicien",
  "email": "john.doe@cosumar.ma",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Utilisateur créé avec succès"
}
```

#### POST `/api/auth/login`
**Body:**
```json
{
  "matricule": "EMP001",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user-123",
    "matricule": "EMP001",
    "nom": "Doe",
    "prenom": "John",
    "departement": "Production",
    "metier": "Technicien",
    "email": "john.doe@cosumar.ma",
    "role": "employee"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/logout`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true
}
```

#### GET `/api/auth/me`
**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "user": { ... }
}
```

---

### 2. Gestion des présences

#### GET `/api/presence/token`
Récupère le token du jour (généré automatiquement si nécessaire)

**Response:**
```json
{
  "success": true,
  "dailyToken": {
    "date": "2025-01-15",
    "token": "TOKEN-ABC123"
  }
}
```

#### POST `/api/presence/mark`
Enregistre une présence

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "token": "TOKEN-ABC123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Présence enregistrée avec succès"
}
```

#### GET `/api/presence/my-history`
Récupère l'historique de l'utilisateur connecté

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "presences": [
    {
      "id": "presence-123",
      "date": "2025-01-15",
      "heure": "08:30:00",
      "statut": "Présent",
      "markedManually": false
    }
  ]
}
```

#### GET `/api/presence/all`
Liste toutes les présences (Admin uniquement)

**Headers:** `Authorization: Bearer {token}`

**Query params:**
- `date` (optional): Filter by date (YYYY-MM-DD)
- `departement` (optional): Filter by department
- `statut` (optional): Filter by status

**Response:**
```json
{
  "success": true,
  "presences": [ ... ]
}
```

#### POST `/api/presence/mark-manual`
Marquer une présence/absence manuellement (Admin uniquement)

**Headers:** `Authorization: Bearer {token}`

**Body:**
```json
{
  "matricule": "EMP001",
  "date": "2025-01-15",
  "statut": "Absent"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Statut enregistré avec succès"
}
```

---

### 3. Gestion des utilisateurs (Admin)

#### GET `/api/users/all`
Liste tous les utilisateurs (Admin uniquement)

**Headers:** `Authorization: Bearer {token}`

**Response:**
```json
{
  "success": true,
  "users": [ ... ]
}
```

---

## Étapes d'intégration

### 1. Créer le backend PHP/MySQL

Créez les fichiers suivants dans un dossier `backend/` :

```
backend/
├── config/
│   └── database.php       # Connexion MySQL
├── models/
│   ├── User.php           # Modèle User
│   └── Presence.php       # Modèle Presence
├── controllers/
│   ├── AuthController.php
│   └── PresenceController.php
├── middleware/
│   └── auth.php           # Vérification JWT
└── api/
    ├── auth/
    │   ├── register.php
    │   ├── login.php
    │   └── me.php
    └── presence/
        ├── token.php
        ├── mark.php
        ├── my-history.php
        ├── all.php
        └── mark-manual.php
```

### 2. Installer les dépendances PHP

```bash
composer require firebase/php-jwt
```

### 3. Configurer la base de données

Créez un fichier `backend/config/database.php` :

```php
<?php
class Database {
    private $host = "localhost";
    private $db_name = "cosumar_presence";
    private $username = "root";
    private $password = "";
    public $conn;

    public function getConnection() {
        $this->conn = null;
        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name,
                $this->username,
                $this->password
            );
            $this->conn->exec("set names utf8");
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }
        return $this->conn;
    }
}
?>
```

### 4. Modifier les contextes React Native

Dans `contexts/AuthContext.tsx`, remplacez les appels AsyncStorage par des appels API :

```typescript
// Avant (AsyncStorage)
const result = await AsyncStorage.getItem(USERS_STORAGE_KEY);

// Après (API)
const response = await fetch('https://your-api.com/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ matricule, password })
});
const result = await response.json();
```

### 5. Ajouter la gestion des tokens JWT

Stockez le token JWT dans AsyncStorage après login :

```typescript
await AsyncStorage.setItem('@cosumar_jwt_token', result.token);
```

Ajoutez le token dans les headers de toutes les requêtes :

```typescript
const token = await AsyncStorage.getItem('@cosumar_jwt_token');
const response = await fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

---

## Sécurité

### Hashage des mots de passe (PHP)
```php
$password_hash = password_hash($password, PASSWORD_BCRYPT);
$is_valid = password_verify($password, $password_hash);
```

### Génération du token quotidien (PHP)
```php
function generateDailyToken($date) {
    return 'TOKEN-' . strtoupper(substr(md5($date . 'secret_salt'), 0, 10));
}
```

### Protection CSRF
Ajoutez des headers CORS dans vos endpoints PHP :

```php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

---

## Variables d'environnement

Créez un fichier `.env` à la racine du projet React Native :

```env
EXPO_PUBLIC_API_URL=https://your-api.com/api
```

Utilisez-le dans votre code :

```typescript
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

---

## Tests

### Tester avec Postman
1. Importez la collection d'endpoints
2. Testez chaque endpoint avec des données de test
3. Vérifiez les réponses et codes HTTP

### Tester l'application
1. Lancez le backend PHP
2. Configurez l'URL de l'API dans `.env`
3. Testez l'inscription, connexion, pointage
4. Vérifiez que les données sont bien enregistrées en base

---

## Compte admin par défaut

Insérez un admin dans la base :

```sql
INSERT INTO users (id, matricule, nom, prenom, departement, metier, email, password_hash, role)
VALUES (
  'admin-001',
  'ADMIN001',
  'Admin',
  'COSUMAR',
  'RH',
  'Administrateur',
  'admin@cosumar.ma',
  '$2y$10$...',  -- Hash de 'admin123'
  'admin'
);
```

---

## Support

Pour toute question sur l'intégration backend, consultez :
- Documentation PHP : https://www.php.net/
- Documentation MySQL : https://dev.mysql.com/doc/
- Documentation JWT : https://jwt.io/

---

**Note importante** : Ce prototype utilise AsyncStorage pour la démo. En production, utilisez TOUJOURS un backend sécurisé avec HTTPS, JWT, et validation des données côté serveur.
