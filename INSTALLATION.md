# Guide d'installation - COSUMAR Smart Presence

## 📋 Prérequis

- **Node.js** v18 ou supérieur
- **Bun** (recommandé) ou npm
- **Expo Go** sur votre téléphone (iOS/Android)
- Un éditeur de code (VS Code, Cursor, etc.)

## 🚀 Installation rapide

### 1. Cloner le projet

```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

### 2. Installer les dépendances

```bash
# Avec Bun (recommandé)
bun install

# Ou avec npm
npm install
```

### 3. Lancer l'application

```bash
# Avec Bun
bun run start

# Ou avec npm
npm start
```

### 4. Tester l'application

#### Sur téléphone (Recommandé)
1. Télécharger **Expo Go** :
   - iOS : [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android : [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scanner le QR code affiché dans le terminal
3. L'application se lance automatiquement

#### Sur navigateur web
```bash
bun run start-web
```

#### Sur simulateur iOS/Android
```bash
# iOS (nécessite macOS + Xcode)
bun run start -- --ios

# Android (nécessite Android Studio)
bun run start -- --android
```

## 🔑 Comptes de test

### Compte Admin par défaut
- **Matricule** : `ADMIN001`
- **Mot de passe** : `admin123`

### Créer un compte employé
1. Ouvrir l'application
2. Cliquer sur "Espace Employé"
3. Cliquer sur "Pas encore de compte ? S'inscrire"
4. Remplir le formulaire avec vos informations

## 📱 Utilisation

### Workflow complet

#### 1. Affichage TV (QR Code)
```
Page d'accueil → Affichage TV
```
- Affiche le QR Code du jour
- À laisser ouvert sur un écran à l'entrée
- Se met à jour automatiquement à minuit

#### 2. Pointage Employé
```
Page d'accueil → Espace Employé → Connexion
```
1. Se connecter avec son matricule
2. Scanner le QR Code affiché à l'entrée
3. Ou saisir manuellement le token
4. Confirmer sa présence

#### 3. Dashboard Admin
```
Page d'accueil → Espace Admin → Connexion (ADMIN001)
```
1. Voir les présences en temps réel
2. Filtrer par date, département, statut
3. Marquer des absences manuellement
4. Exporter les données en CSV
5. Consulter les statistiques

## 🛠️ Commandes utiles

### Développement
```bash
# Démarrer le serveur de développement
bun run start

# Démarrer en mode web
bun run start-web

# Nettoyer le cache
bunx expo start --clear

# Réinstaller les dépendances
rm -rf node_modules && bun install
```

### Build et déploiement
```bash
# Installer EAS CLI
bun i -g @expo/eas-cli

# Configurer EAS
eas build:configure

# Build iOS
eas build --platform ios

# Build Android
eas build --platform android

# Build Web
eas build --platform web
```

## 🐛 Résolution de problèmes

### L'application ne se charge pas sur le téléphone

**Problème** : Le QR code ne fonctionne pas

**Solutions** :
1. Vérifier que le téléphone et l'ordinateur sont sur le même WiFi
2. Essayer le mode tunnel :
   ```bash
   bun start -- --tunnel
   ```
3. Vérifier que le pare-feu n'est pas bloqué

### Erreur "Metro bundler failed to start"

**Solution** :
```bash
# Nettoyer le cache
bunx expo start --clear

# Si ça ne fonctionne pas, réinstaller
rm -rf node_modules
bun install
```

### Erreur "Unable to resolve module"

**Solution** :
```bash
# Réinstaller les dépendances
rm -rf node_modules
rm bun.lock
bun install
```

### L'application crash au démarrage

**Solution** :
1. Vérifier les logs dans le terminal
2. Nettoyer le cache : `bunx expo start --clear`
3. Vérifier que toutes les dépendances sont installées

## 📦 Structure des données

### Stockage local (Prototype)

Les données sont stockées dans AsyncStorage :
- `@cosumar_users` : Liste des utilisateurs
- `@cosumar_current_user` : Utilisateur connecté
- `@cosumar_presence` : Liste des présences
- `@cosumar_daily_token` : Token du jour

### Réinitialiser les données

Pour effacer toutes les données locales :
1. Désinstaller l'application
2. Réinstaller l'application
3. Ou utiliser le code suivant dans l'app :

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.clear();
```

## 🔄 Passer en production

Pour utiliser un backend PHP/MySQL au lieu d'AsyncStorage :

1. Consultez `BACKEND_INTEGRATION.md`
2. Créez la base de données MySQL
3. Développez les endpoints API PHP
4. Modifiez les contextes pour utiliser les API
5. Configurez les variables d'environnement

## 📚 Ressources

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/)
- [Guide Expo Router](https://docs.expo.dev/router/introduction/)
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)

## 🆘 Support

Si vous rencontrez des problèmes :

1. Vérifiez cette documentation
2. Consultez les logs dans le terminal
3. Vérifiez la documentation Expo
4. Contactez le support technique

---

**Bon développement ! 🚀**
