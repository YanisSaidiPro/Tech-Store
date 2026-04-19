Ce dépôt contient une simulation frontend de la plateforme Tech Store.

L’objectif de cette version est de mettre en avant :

Structure UI/UX
Architecture des composants
Logique de gestion d’état
Routage frontend
Flux d’intégration API (simulé)

Cette version n’est pas connectée au backend de production. À la place, elle utilise une couche de données simulée qui reproduit le comportement attendu du backend.

Objectif

Le but de ce dépôt est de :

Démontrer le comportement du frontend dans un environnement réaliste
Valider les parcours utilisateurs (authentification, navigation produits, logique de panier, etc.)
Simuler les appels API et les comportements asynchrones
Présenter une expérience visuelle et fonctionnelle proche de la version finale

Il s’agit d’un proof of concept frontend avant l’intégration complète du backend.

Architecture
Stack Frontend
React
Vite / CRA (selon la configuration du projet)
Tailwind CSS
React Router
Context API / gestion d’état
Backend simulé

Au lieu d’un backend réel, ce projet utilise :

Données JSON locales
Couche de services mockée
Appels API asynchrones simulés (setTimeout, Promises)
Fonctions de service structurées qui reproduisent des endpoints REST réels
Exemple de structure :
src/
├── components/
├── pages/
├── services/ ← couche API simulée
├── data/ ← données JSON statiques
├── context/
└── routes/

La couche services/ est conçue pour correspondre au contrat API réel attendu.

Pourquoi une simulation ?

Cette approche permet :

Un développement frontend-first
Une itération UI plus rapide
Une indépendance vis-à-vis de l’équipe backend
Une séparation claire des responsabilités
Un remplacement facile des services mock par de vraies API plus tard

Lors de l’intégration du backend réel, seule la couche de services devra être modifiée.

Fonctionnalités actuelles (simulées)
Liste de produits
Page de détails produit
Gestion du panier
Flux d’authentification côté UI
Interface responsive
Validation des formulaires
Persistance d’état
Lancer le projet
npm install
npm run dev

Puis ouvrir :

http://localhost:5173

Avertissement

Ce dépôt est uniquement destiné à des fins de démonstration et de validation architecturale.

Aucune base de données réelle
Aucun système d’authentification en production
Aucun système de paiement réel
Aucune API de production

Il reflète uniquement l’expérience utilisateur et la structure frontend prévue.

Plan d’intégration future
Remplacement des services mock par de vraies API
Connexion de l’authentification au backend
Ajout d’une gestion d’erreurs en production
Implémentation de communications API sécurisées
