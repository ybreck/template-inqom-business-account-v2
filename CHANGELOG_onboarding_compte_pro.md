# Changelog — Discovery : Compte Pro : Onboarding
> Version 2 — Avril 2026
> Référence Notion : https://www.notion.so/335a2ca253058108beb0ddfad8a42fd5

---

## [v2] Évolutions par rapport à la discovery initiale

### 1. Suppression de l'écran d'introduction du tunnel

**Avant :** Au démarrage de l'onboarding, une page plein écran présentait les 5 étapes avant d'entrer dans le tunnel.

**Après :** Cette présentation est intégrée directement dans l'écran de démarrage (ou de reprise), hors tunnel.

- **Premier démarrage :** l'écran affiche les 6 étapes avec un CTA "Commencer". Le tunnel démarre directement à l'étape 1.
- **Reprise :** l'écran affiche les 6 étapes avec l'étape en cours visuellement mise en évidence (style actif distinct). Le CTA devient "Reprendre". Le tunnel reprend directement à l'étape en cours.
- **Impact :** suppression d'un écran dans le tunnel, le parcours gagne en fluidité.

---

### 2. Étape 5 — Création d'utilisateur Swan (remplace "Vérification d'identité")

**Avant :** L'étape 5 (`id`) envoyait un lien SMS pour rediriger l'utilisateur vers Swan pour une vérification d'identité.

**Après :** L'étape 5 a pour but de **créer un utilisateur Swan**, afin de l'attacher à l'Account Holder qui sera créé à l'étape 6.

#### Comportement conditionnel

| Condition | Comportement |
|-----------|-------------|
| L'utilisateur Inqom est **déjà lié à un utilisateur Swan** (ex. CEO multi-sociétés) | Étape **automatiquement skippée** → passage direct à l'étape 6 |
| L'utilisateur Inqom n'a **pas** d'utilisateur Swan | Lancement du flux de création d'utilisateur Swan |

#### Dans le flux de création Swan

- La vérification d'identité est proposée **au sein du flux Swan** (pas dans notre tunnel).
- L'utilisateur peut vérifier son identité **immédiatement** ou choisir **"Faire plus tard"**.
- L'étape 5 est considérée comme **terminée dès que l'utilisateur Swan est créé**, indépendamment de l'état de la vérification d'identité.
- ⚠️ Un seul utilisateur peut valider cette étape — il verrouille l'onboarding.

#### Conséquence sur la phase 2 (hors tunnel)

La vérification d'identité pouvant être différée, les écrans de l'étape 2 (états 2.2 à 2.4) permettent au titulaire de déclencher ou refaire la vérification depuis l'onglet Compte Pro.

---

### 3. Étape 6 — Finalisation (remplace "Succès")

**Avant :** L'étape finale ("Succès") confirmait la transmission des informations et redirigait vers l'accueil. Les CGU étaient validées à la fin de l'étape 5.

**Après :** L'étape 6 s'appelle **"Finalisation"** et comporte les actions suivantes :

- Validation des **Conditions Générales d'Utilisation** (déplacées depuis l'étape 5).
- Soumission de la demande de création de compte (**Account Holder côté Swan**).
- **Redirection vers l'onglet Compte Pro** (et non vers l'accueil général).
- L'état initial affiché est **calculé dynamiquement** en fonction de l'état du KYC au moment de la finalisation — il n'est pas prédictible à l'avance.
- On enregistre quel utilisateur a validé le tunnel.

---

### 4. Ajout des cas de notifications

Cinq cas de notification sont à implémenter. Le canal (email / SMS / in-app) est **hors scope** de cette discovery.

**Comportement commun à toutes les notifications :**
- Message court, sans détail sur l'état précis du KYC.
- Objectif : inciter l'utilisateur à se connecter pour consulter l'état de son Compte Pro.
- Inclut un lien de connexion redirigeant directement vers l'onglet **Compte Pro** après authentification.
- Aucune action spécifique n'est associée côté notification.

| # | Intitulé | Déclencheur |
|---|----------|-------------|
| N1 | Onboarding incomplet | 24h après la suspension (abandon) d'un onboarding en cours |
| N2 | Vérification d'identité à faire | Vérification d'identité différée lors de l'étape 5 |
| N3 | Vérification d'identité à refaire | Échec de la vérification d'identité (état 2.4) |
| N4 | Demande de document pour le KYC | Swan demande des documents supplémentaires (état 2.6) |
| N5 | KYC validé | Swan valide le KYC → compte activé |

---

## Récapitulatif des impacts techniques

| Zone | Impact |
|------|--------|
| `ProAccountOnboarding.tsx` | Supprimer l'étape `intro` (index 0) — intégrer la présentation des étapes dans l'écran d'entrée |
| `ProAccountMainPage.tsx` | Écran de démarrage/reprise : afficher les 6 étapes, mettre en évidence l'étape courante via `proAccountOnboardingStep` |
| Étape 5 | Remplacer le flux SMS/vérification par un check "utilisateur Swan existant" + flux création Swan conditionnel |
| Étape 6 | Ajouter validation CGU + appel création Account Holder + redirection vers `comptes_pro_synthese` |
| `ProAccountMainPage.tsx` | Après finalisation : calculer et afficher l'état KYC dynamiquement (ne pas assumer un état initial fixe) |
| Notifications | Créer 5 triggers de notification (canal à définir dans discovery dédiée) avec lien deep-link vers `comptes_pro_synthese` |
