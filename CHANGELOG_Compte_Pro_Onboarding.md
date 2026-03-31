# Changelog – Compte Pro : Onboarding
> Comparaison entre la version initiale (V1) et la version révisée (V2)

---

## 🟥 Suppressions

### Section "Hypothèses Clés à Valider"
- Retrait du bloc **Scope out** (présent en V1) :
  - ❌ Allemagne (scope France uniquement)
  - Gestion des cas complexes (associations non-loi 1901)

### Section "Cadrage Général – Etape 0"
- Suppression du bloc listant les **données minimales requises** pour créer l'onboarding Swan (raison sociale, account name, adresse entreprise, adresse responsable légal, SIREN, email).

### Section "Cadrage Général – Etape 3" (V1 uniquement)
- Suppression de la section autonome "Etape 3 : Expérience de l'utilisateur" qui décrivait :
  - Le formulaire en tunnel
  - L'enregistrement à chaque étape
  - Le mécanisme de relance utilisateur (V1)

### Section "Analyse"
- Suppression du placeholder `< créer le texte en syntaxe mermaid >`.

---

## 🟩 Ajouts

### Section "Cadrage Général – Etape 0"
- Ajout de deux questions ouvertes à arbitrer :
  - Possibilité pour chaque cabinet/dossier d'inclure ou exclure l'option Compte Pro.
  - Mention de la réaction aux offres **CENSE** dans le cas COGEP.

### Section "Cadrage Général – Etape 1 (démarrage)"
- Ajout d'une **page d'introduction** présentant les 5 étapes avant le tunnel.
- Précision que le formulaire est en **tunnel** pour concentrer l'attention utilisateur.

### Étape 1 – Identification du titulaire
- Ajout d'un champ **Statut** : "Êtes-vous un représentant légal ? (Oui / Non, j'ai une procuration)".
- Précision du format de l'adresse postale : Rue, Code postal, Ville.

### Étape 2 – Qualification entreprise
- Remplacement de "Forme Juridique" par un champ **Type d'organisation** avec liste de valeurs explicites : Entreprise, Association, Co-titularité, Indépendant, Autre.

### Étape 3 – Qualification des UBO
- Précision des valeurs du champ **Type de contrôle exercé** : Possession du capital / Représentant légal / Autre.
- Ajout d'une logique conditionnelle : si "Possession du capital", afficher les champs % du capital + Directement / Indirectement.
- Précision sur l'adresse UBO : "Adresse actuelle + Pays, Ville et Code Postal".

### Étape 4 – Upload documents
- Ajout de la notion d'**affichage dynamique** des documents requis selon les informations saisies précédemment.
- Précision sur la zone d'upload : **clic ou drag & drop**.

### Étape 5 – Vérification d'identité
- Ajout d'une **explication réglementaire** à présenter à l'utilisateur.
- Ajout d'un bouton de démarrage avec **redirection vers Swan** (process "Sign In user").
- Ajout d'un avertissement : ⚠️ un seul utilisateur peut compléter ce process, il **verrouille l'onboarding** s'il va au bout.

### Étape 6 – Succès *(nouvelle étape, non présente en V1)*
- Ajout d'une étape dédiée à la confirmation :
  - Message de confirmation de transmission.
  - Explication de la suite (analyse partenaire, notification e-mail).
  - Enregistrement de l'utilisateur ayant validé le tunnel.

### Étape 2 (post-tunnel) – Finalisation KYC
- Refonte complète avec 7 **sous-états détaillés** (contre une description générique en V1) :
  - `2.1` Accès refusé (utilisateurs n'ayant pas validé l'onboarding)
  - `2.2` Vérification d'identité en attente (action : démarrer la vérification)
  - `2.3` Vérification d'identité en cours (aucune action)
  - `2.4` Vérification d'identité refusée (affichage du motif + recommencer)
  - `2.5` Vérification du partenaire en cours (aucune action)
  - `2.6` Demande de documentation supplémentaire (upload requis + retour à 2.5)
  - `2.7` KYC refusé par Swan (motif et recours à clarifier avec Swan)

---

## 🟨 Modifications

### Section "Objectif & Problème"
| | V1 | V2 |
|---|---|---|
| Label | "Problem Brief" présent | Supprimé |

### Section "Cadrage Général – Qui ?"
| | V1 | V2 |
|---|---|---|
| Persona | CEO/DAF **& EC** → DAF et EC avec PoA | CEO/DAF → DAF avec PoA (**EC retiré**) |

### Étape 1 – Identification du titulaire
| Champ | V1 | V2 |
|---|---|---|
| Ordre | Adresse postale → Adresse mail | Statut → Adresse mail → Adresse postale |
| T&C | Question ouverte ("Page d'accueil, T&C ?") | Supprimée |

### Étape 2 – Qualification entreprise
| Champ | V1 | V2 |
|---|---|---|
| Forme juridique | "Forme Juridique" (champ libre) | "Type d'organisation" avec liste de valeurs |
| Note pays | "Pas de pays de l'organisation, mais France à transmettre à Swan" | Supprimée |
| Ordre des champs | …Description activité → Montant mensuel | …Montant mensuel → Description activité |

### Étape 4 – Upload documents
| | V1 | V2 |
|---|---|---|
| Présentation | Liste de cartes + modale d'upload + check vert | Affichage dynamique + drag & drop |

### Étape 5 / 6 (fusion → séparation)
| | V1 | V2 |
|---|---|---|
| Structure | Étape 5 = identité, Étape 6 = attente KYC (fusionnées) | Étape 5 = vérification identité, Étape 6 = succès (séparées et détaillées) |

---

## 📌 Questions ouvertes ajoutées en V2

- Arbitrage sur l'inclusion/exclusion de l'option Compte Pro par cabinet ou par dossier.
- Comportement vis-à-vis des offres CENSE (COGEP).
- Motif de refus et recours possibles en cas de KYC refusé par Swan (`2.7`).
- TODO sur la logique de "Possession du capital" dans les UBO (reprise à compléter).
- TODO sur les use cases de notifications.
