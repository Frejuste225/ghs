# GHS - Gestion des Heures Supplémentaires v2.0

API FastAPI avancée pour la gestion des heures supplémentaires avec authentification JWT, validation métier et middlewares personnalisés.

## ✨ Nouvelles Fonctionnalités v2.0

- 🔐 **Authentification JWT complète** avec gestion des rôles
- ✅ **Validateurs métier** pour les données critiques
- 🛡️ **Middlewares personnalisés** pour la gestion d'erreurs et logging
- 🧪 **Tests unitaires** avec pytest
- 📊 **Logging structuré** et monitoring
- 🌐 **Configuration CORS** avancée

## 🚀 Installation et Configuration

### Prérequis
- Python 3.8+
- MySQL 8.0+
- pip ou poetry

### Installation Rapide

1. **Cloner et installer**
```bash
cd backend
pip install -r requirements.txt
```

2. **Configuration**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres MySQL
```

3. **Initialiser la base de données**
```bash
# Créer la base MySQL
mysql -u root -p
CREATE DATABASE ghs;
USE ghs;
SOURCE ../ghs.sql;

# Initialiser avec des données de test
python init_db.py
```

4. **Démarrer l'API**
```bash
python start_api.py
```

## 📚 Structure du Projet v2.0

```
backend/
├── models/                  # Modèles SQLModel
│   ├── __init__.py
│   ├── service.py          # Services
│   ├── employee.py         # Employés  
│   ├── account.py          # Comptes utilisateurs
│   ├── request.py          # Demandes d'heures sup
│   ├── delegation.py       # Délégations
│   └── workflow.py         # Workflows
├── auth.py                 # 🔐 Authentification JWT
├── middleware.py           # 🛡️ Middlewares personnalisés
├── validators.py           # ✅ Validateurs métier
├── database.py             # Gestion BDD
├── main.py                 # Application FastAPI
├── start_api.py            # 🚀 Script de démarrage avancé
├── init_db.py              # 🔧 Initialisation BDD
├── test_*.py               # 🧪 Tests unitaires et intégration
├── requirements.txt        # Dépendances
└── .env                    # Variables d'environnement
```

## 🔐 Authentification

### Comptes de Test (après init_db.py)
```
admin / admin123        (Administrator)
supervisor / super123   (Supervisor)  
user / user123         (Validator)
```

### Endpoints d'Authentification
- `POST /auth/login` - Connexion avec token JWT
- `GET /auth/me` - Informations utilisateur connecté

### Utilisation
```bash
# 1. Se connecter
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=admin123"

# 2. Utiliser le token
curl -X GET "http://localhost:8000/services" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🔗 Endpoints API v2.0

### 🔐 Authentification
- `POST /auth/login` - Connexion utilisateur
- `GET /auth/me` - Profil utilisateur

### 📋 Services (Protection par rôles)
- `GET /services` - Liste (Public)
- `GET /services/{id}` - Détail (Public)
- `POST /services` - Création (Admin/Supervisor)
- `PUT /services/{id}` - Modification (Admin/Supervisor)
- `DELETE /services/{id}` - Suppression (Admin uniquement)

### 👥 Employés (Protection par rôles)
- `GET /employees` - Liste (Public)
- `GET /employees/{id}` - Détail (Public)
- `POST /employees` - Création (Admin/Supervisor)
- `PUT /employees/{id}` - Modification (Admin/Supervisor)
- `DELETE /employees/{id}` - Suppression (Admin uniquement)

### 🔑 Comptes (Admin uniquement)
- `GET /accounts` - Liste tous les comptes
- `GET /accounts/{id}` - Détail d'un compte
- `POST /accounts` - Création de compte

### 📝 Demandes (Authentification requise)
- `GET /requests` - Liste des demandes
- `GET /requests/{id}` - Détail d'une demande
- `POST /requests` - Création (Utilisateur connecté)
- `PUT /requests/{id}` - Modification (Propriétaire ou Admin/Supervisor)

### 🔄 Délégations & Workflows (Admin/Supervisor)
- Gestion complète des délégations et workflows

## ✅ Validations Métier

### Validations Automatiques
- **Heures de travail** : Maximum 12h par demande
- **Dates** : Pas de demandes dans le passé
- **Formats** : Codes services alphanumériques, numéros employés valides
- **Cohérence** : Plages horaires et dates logiques

### Exemples d'Erreurs
```json
{
  "error": "Données invalides",
  "detail": "La durée de travail ne peut pas excéder 12 heures"
}
```

## 🧪 Tests

### Tests Unitaires
```bash
# Tests des validateurs
pytest test_validators.py -v

# Tous les tests
pytest -v
```

### Tests d'Intégration
```bash
# Tests API complets (API doit être démarrée)
python test_advanced_api.py
```

## 📖 Documentation API

- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc
- **Health Check** : http://localhost:8000/health

## 🔧 Configuration Avancée

### Variables d'environnement (.env)
```env
# Base de données
DB_USER=root
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5080
DB_NAME=ghs

# Application
APP_HOST=0.0.0.0
APP_PORT=8000
DEBUG=True

# JWT
SECRET_KEY=your-super-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000", "http://localhost:8080"]
```

## 🛡️ Sécurité

- **JWT** avec expiration configurable
- **Hachage bcrypt** des mots de passe
- **Protection par rôles** sur les endpoints sensibles
- **Validation** stricte des données d'entrée
- **Gestion d'erreurs** sécurisée (pas de fuite d'informations)

## 📊 Monitoring & Logging

- **Logging automatique** de toutes les requêtes
- **Gestion centralisée** des erreurs
- **Métriques** de performance (temps de réponse)
- **Health check** pour monitoring externe

## 🏗️ Architecture

### Middlewares
1. **ErrorHandlerMiddleware** - Gestion centralisée des erreurs
2. **LoggingMiddleware** - Logging des requêtes/réponses
3. **CORSMiddleware** - Configuration CORS

### Sécurité par Couches
1. **Authentification JWT** - Vérification des tokens
2. **Autorisation par rôles** - Contrôle d'accès granulaire
3. **Validation métier** - Règles de gestion strictes
4. **Gestion d'erreurs** - Réponses sécurisées

## 🚀 Déploiement

### Développement
```bash
python start_api.py
```

### Production
```bash
# Avec Gunicorn
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker

# Avec Docker (à créer)
docker build -t ghs-api .
docker run -p 8000:8000 ghs-api
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📝 Changelog v2.0

- ✅ Authentification JWT complète
- ✅ Système de rôles et permissions
- ✅ Validateurs métier avancés
- ✅ Middlewares personnalisés
- ✅ Tests unitaires avec pytest
- ✅ Logging structuré
- ✅ Configuration CORS avancée
- ✅ Scripts d'initialisation et de test
- ✅ Documentation complète