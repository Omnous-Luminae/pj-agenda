# PJ Agenda

Application de gestion d'agenda avec Symfony (backend) et React (frontend).

## Prérequis

- Docker
- Docker Compose

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/Omnous-Luminae/pj-agenda.git
cd pj-agenda
```

2. Lancer l'application avec Docker :
```bash
docker-compose up -d --build
```

3. L'application sera accessible sur :
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:8000
   - Base de données : localhost:3306

## Configuration

La configuration par défaut fonctionne immédiatement. Les variables d'environnement sont définies dans `docker-compose.yml`.

Pour personnaliser la configuration (optionnel), créez un fichier `docker-compose.override.yml` :

```yaml
version: '3.8'

services:
  db:
    environment:
      MYSQL_ROOT_PASSWORD: votre_mot_de_passe
      MYSQL_USER: votre_user
      MYSQL_PASSWORD: votre_password
```

## Commandes utiles

```bash
# Arrêter l'application
docker-compose down

# Voir les logs
docker-compose logs -f

# Voir les logs d'un service spécifique
docker-compose logs -f backend
docker-compose logs -f frontend

# Reconstruire les images
docker-compose build

# Accéder au container backend
docker-compose exec backend bash

# Accéder à la base de données
docker-compose exec db mysql -u pj_agenda_user -ppj_agenda_pass pj_agenda
```

## Structure du projet

```
pj-agenda/
├── backend/          # Application Symfony
├── frontend/         # Application React
├── nginx/            # Configuration Nginx
└── docker-compose.yml
```

## Développement

Les modifications dans `backend/` et `frontend/` sont automatiquement synchronisées grâce aux volumes Docker.

Pour le frontend, en mode développement :
```bash
cd frontend
npm start
```

Pour le backend :
```bash
cd backend
symfony server:start
```
