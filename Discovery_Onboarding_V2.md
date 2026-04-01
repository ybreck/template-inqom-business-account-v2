# Compte Pro : Onboarding (V2)

**Status** : In progress
**Assign** : Yann Breck

## 🎯 Objectif & Problème - Why
*Expression synthétique de la problématique et de l’objectif poursuivi*

**Objectif** : Fournir une expérience rapide et fluide pour l’ouverture d’un compte bancaire professionnel sur Inqom
**Problème** : Les CEO doivent constamment basculer entre leur app bancaire (pour gérer virements/cartes) et Inqom Gestion (pour suivre leur compta).
Résultat : perte de temps, erreurs de saisie, vision fragmentée de la trésorerie.

### Problem Brief
**Contexte business**
*   **Sponsor** : COGEP
*   **Pourquoi maintenant ?** Lancement de l'offre "Compte Pro", pilier central du package payant "Inqom Gestion".
*   **Impact attendu** : Revenu (Driver principal d'acquisition/upsell sur l'abonnement Inqom Gestion).

**Problème client**
*   **Pour qui ?** CEO (PME/TPE).
*   **Quel problème ?** Ouvrir un compte pro est une tâche administrative lourde, déconnectée de la gestion comptable quotidienne.
*   **Workaround actuel** : Banques traditionnelles (lenteur, papier) ou néo-banques externes (pas de lien natif avec la compta).
*   **Valeur pour le client** : "All-in-one" : Gestion et Banque au même endroit. Gain de temps administratif.
*   **Valeur pour Inqom** : Augmentation de l'ARPU (Average Revenue Per User) via l'abonnement Inqom Gestion.

## 📡 Données clés
*Nombre de dossiers impactés, acteurs clés impactés, niveau d’impact (blocage/déblocage, quality of life)*

## ❓ Hypothèses Clés à Valider
*Description synthétique des différentes hypothèses envisagées*

Intégration "Embedded Finance" du partenaire Swan :
*   Parcours 100% en ligne initié depuis Inqom.
*   UX calquée sur le partenaire pour limiter l'effort de design.
*   Synchronisation immédiate avec la compta.

**Scope out :**
*   ❌ Allemagne (Scope France uniquement).
*   Gestion des cas complexes (associations non-loi 1901, etc. - à confirmer).

## 📊 Analyse (Concurrents, Données Actuelles, Faisabilité Tech, Ateliers utilisateurs)
*Analyse métier, analyse concurrentielle, faisabilité technique, scoping, analyse de valeur (combien de clients impactés, possibilité de débloquer des signatures, possibilité d’upsell)*

Gestion des UBO
Event Storming https://miro.com/app/board/uXjVG2fienY=/
< créer le texte en synthaxe mermaid >

## ✨ Cadrage Général - What
*Détailler les hypothèses, partie métier, partie fonctionnelle, partie technique*

Ouverture compte pro avec IBAN directement dans Inqom Gestion (powered by Swan)
Qui? CEO/DAF, & EC → pour DAF et EC avec PoA (champ dans le formulaire)

**Etape 0 : Quel dossier voit Compte Pro dans le menu?**
1/ Cabinet doit avoir renseigné les identifiants SWAN : client_id et client_secret dans les paramétrages du groupe de cabinet
2/ Dossier doit être compatible (pas toutes les formes juridiques, à préciser avec SWAN)
!! L’item de menu n’est disponible que sur Gestion

Pour créer l’onboarding, on a besoin au minimum :
*   raison sociale & dénomination commerciale
*   account name (dénomination commerciale pour le MVP) → mettre la raison sociale
*   adresse de l’entreprise
*   adresse du responsable légal
*   SIREN / optionnel si en cours d’immatriculation → poser la question à SWAN
*   adresse mail de l’account holder (obligatoire)

**Etape 1 : Démarrage de l’onboarding**
Au démarrage, une page d'introduction présente les 5 étapes. Ensuite, un formulaire en tunnel guide l'utilisateur pour concentrer son attention. À chaque étape on enregistre la progression.

Déroulé :

1.  **Qualification de l'entreprise**
    *   Type d'organisation (Entreprise, Association, Co-titularité, Indépendant, Autre)
    *   Raison sociale / Nom de l'organisation
    *   SIREN
    *   Numéro de TVA *Facultatif*
    *   Adresse (Rue, Code postal, Ville)
    *   Secteur d’activité [reprendre le sélecteur SWAN]
    *   Montant mensuel des transactions prévu par votre entreprise sur ce compte [reprendre le sélecteur SWAN]
    *   Description de l’activité
    → call pour créer l’onboarding chez Swan

2.  **Qualification des UBO (Bénéficiaires effectifs)**
    *   Liste de cartes pour chaque UBO, avec une carte “+”
    *   Pour chaque UBO, dans une modale :
        *   Prénom Nom
        *   Rôle
        *   Pourcentage total du capital détenu
        *   Directement / Indirectement
        *   Pays et Ville de Naissance
    → mise à jour de l’onboarding à chaque création / edition / suppression d’UBO

3.  **[Optionnelle] Upload de documents justificatifs**
    *   Affichage dynamique selon les informations précédentes (ex: statuts pour une association, pièce d'identité si UBO étranger).
    *   Zone d'upload (clic ou drag & drop) pour chaque document requis.
    *   [Afficher les limites des documents acceptés : taille/type]

4.  **Identification du titulaire du compte**
    *   Statut : Êtes-vous un représentant légal ? (Oui / Non, j'ai une procuration)
    *   Adresse mail
    *   Adresse postale personnelle (Rue, Code postal, Ville)

5.  **Vérification d'identité**
    *   Explication réglementaire : vérification requise avant l'analyse du dossier.
    *   Bouton pour démarrer la vérification (redirection) ou option pour le faire plus tard.

6.  **Succès (Identité validée → KYC Swan → page d’attente)**
    *   Confirmation de transmission des informations.
    *   Explication de la suite du processus (analyse par le partenaire, notification par e-mail).

**Etape 2 : Finalisation de l’onboarding et KYC**
Une fois la validation de l’identité de l’Account Holder faite, Swan fait son KYC → page d’attente de notre côté.
Ils peuvent déclencher des demandes de documents → à retrouver sur la page d’attente + notifier l’utilisateur (directement par SWAN?).
Possibilité de gérer les différents états (En attente, Demande de documents, Refusé, Validé).

**Etape 3 : Expérience de l’utilisateur**
Formulaire en tunnel pour concentrer l’utilisateur.
Enregistrement à chaque étape.

V1 :
Prévoir un mécanisme de relance de l’utilisateur si un onboarding traine sur plusieurs jours.

## 🚀 Solution retenue & gestion du changement
*Description synthétique de la solution retenue et des différentes phases (au moins le MVP) avec les prérequis des autres équipes, description de la stratégie GTM, définition des KPI de RUN*

### 🚀 Phase 1 (MVP)
*   **💎 Proposition de valeur**
    *Description fonctionnelle de la première solution envisagée, description du persona utilisateur et proposition de valeur.*
*   **📏 Plan de réalisation**
    *Découpage de la solution avec la technique. Chiffrage et impacts à envisager sur les utilisateurs API, Inqom classic vs Inqom Gestion, prérequis techniques à prévoir*
*   **✉️ GTM / Communications**
    *Communications à prévoir : démo, messages au revenu, communication newsletter/release note, comm in app, modifications du help center, vidéo pour tuto in app*
*   **📊 KPI RUN**
    *Métriques d’usage à implémenter, métriques techniques à implémenter / modifier*

## 🔧 Ajustements en delivery
*Ajustements qui arrivent en cours de développement, en communication, chiffrage, correctifs de la discovery*
