# Changelog Discovery Onboarding : V1 vs V2

Ce document liste les nouveautés et les différences entre la première version de la discovery (V1) et la version actuelle implémentée dans le code (V2), spécifiquement sur la partie "Cadrage Général - What".

## 1. Réorganisation de l'ordre des étapes
L'ordre du tunnel d'onboarding a été repensé pour être plus logique et progressif :
*   **V1** : 1. Titulaire -> 2. Entreprise -> 3. UBO -> 4. Documents -> 5. Identité
*   **V2** : 1. Entreprise -> 2. UBO -> 3. Documents -> 4. Titulaire -> 5. Identité
*   **Nouveauté (Step 0.5)** : Ajout d'une page d'introduction présentant les 5 étapes à l'utilisateur avant de démarrer le formulaire, pour mieux le guider.

## 2. Étape 1 : Qualification de l'entreprise (Organisation)
*   **Nouveauté** : Ajout d'un champ "Type d'organisation" (Entreprise, Association, Co-titularité, Indépendant, Autre). Ce champ est crucial car il conditionne l'affichage dynamique de l'étape des documents justificatifs.
*   **Simplification** : Le pays de l'organisation n'est plus explicitement demandé dans le formulaire MVP (supposé France par défaut selon le scope).

## 3. Étape 2 : Qualification des UBO (Bénéficiaires effectifs)
*   **Simplification des champs** : 
    *   La "Date de naissance" et "l'Adresse" complète de l'UBO ont été retirées de la modale MVP pour alléger la saisie.
    *   Le "Type de contrôle exercé" a été simplifié en un champ "Rôle".
*   **Nouveauté UX** : Ajout d'un encart informatif expliquant clairement ce qu'est un UBO (règle des 25%, représentant légal par défaut, etc.) pour aider l'utilisateur.

## 4. Étape 3 : Documents justificatifs (Optionnelle)
*   **Logique conditionnelle implémentée** : L'affichage des demandes de documents est désormais dynamique et basé sur les saisies précédentes :
    *   Si le type d'organisation est "Association", les statuts sont demandés.
    *   Si un UBO est né à l'étranger, une pièce d'identité est demandée.
    *   Si aucun critère n'est rempli, un message de succès indique qu'aucun document n'est requis.

## 5. Étape 4 : Identification du titulaire
*   **Nouveauté** : Ajout d'une question explicite sur le statut du déclarant : "Êtes-vous un représentant légal ?" avec deux options (Oui / Non, j'ai une procuration).
*   **Ajustement** : Les T&C (Conditions Générales) ont été déplacées vers l'étape de vérification d'identité.

## 6. Étape 5 : Vérification d'identité et Succès
*   **Wording réglementaire** : Le texte explique désormais clairement que la vérification d'identité est une obligation réglementaire requise *avant* l'analyse du dossier par le partenaire.
*   **Flexibilité (Démo/UX)** : Ajout d'un bouton "Faire plus tard" permettant de différer la vérification d'identité.
*   **Gestion des attentes (Page Succès)** : Retrait de la promesse stricte d'un retour sous "48h". Le message indique désormais que le partenaire va analyser le dossier et qu'une notification par e-mail sera envoyée.

## 7. Gestion des statuts KYC (Post-onboarding)
*   **Nouveauté** : Le code prévoit désormais la gestion de multiples états de retour du partenaire Swan sur la page d'accueil du Compte Pro :
    *   En attente de vérification d'identité
    *   Analyse en cours (Pending)
    *   Demande de documents supplémentaires (Docs requested)
    *   Échec de la vérification d'identité (Failed)
    *   KYC Refusé (Kyc refused)
    *   Compte activé (Approved)
