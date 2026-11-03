# Plan d'intégration Stripe : Premium payant (2026-11-03)

Source : règles du plugin Stripe (skill `stripe-best-practices`, API `2026-10-28.endive`, SDK Node 23.0.0). Le serveur MCP Stripe et son outil de planification n'ont pas pu être chargés dans cette session (rechargement des plugins impossible à distance) : plan rédigé à partir de ces règles et du code du site.

## Ce qu'on construit

Premium devient un abonnement payant : **un produit « Toutou Gourmet Premium », deux prix** (mensuel et annuel, montants à confirmer par le propriétaire), payé par **Stripe Checkout** en mode abonnement, géré par le **portail client Stripe** (changer de carte, résilier), **TVA calculée par Stripe Tax**. Le gratuit reste inchangé (5 scans photo par mois).

## Choix techniques (règles Stripe)

| Sujet | Choix | Pourquoi |
|---|---|---|
| Environnement | Un **sandbox** Stripe dédié au développement, puis le mode live | Isole les données de test |
| Clé API | **Clé restreinte** (`rk_…`) limitée aux ressources utiles, rangée dans `/srv/toutou/shared/.env` par le propriétaire (jamais dans la conversation ni le dépôt) | Moindre privilège |
| SDK | `stripe` Node 23, `new Stripe(clé, { apiVersion: '2026-10-28.endive' })`, une instance partagée côté serveur | Pas de clé globale (déprécié) |
| Paiement | `checkout.sessions.create({ mode: 'subscription', line_items, automatic_tax, customer, integration_identifier })`, **sans `payment_method_types`** | Moyens de paiement dynamiques (carte, Apple Pay, etc.) réglés dans le Dashboard |
| Catalogue | 1 Product, 2 Prices (mois, an), `tax_behavior: 'inclusive'` (prix affichés TTC en France) | Règle « un produit par offre » |
| Gestion | Portail client Stripe (résiliation, carte, factures) | Rien à reconstruire |
| État de l'abonnement | **Webhook** `/api/stripe/webhook` (signature vérifiée), seule source de vérité | La page de succès ne fait pas foi |
| Événements écoutés | `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `customer.subscription.created / updated / deleted`, `invoice.paid`, `invoice.payment_failed`, `charge.refunded`, `charge.dispute.created`, `radar.early_fraud_warning.created` | Cycle de vie + litiges et fraude |
| Idempotence | Table `app.stripe_event` (id de l'événement), traitement une seule fois | Stripe peut renvoyer un événement |
| Lien compte ↔ Stripe | `stripe_customer_id` et `stripe_subscription_id` sur `app.membership`, rattachés par l'objet Stripe (Customer / Subscription), pas par les métadonnées | Règle Stripe |

## Données (migration Drizzle)

- `app.membership` : `source` (`launch` = Premium gratuit du lancement, `stripe`), `stripe_customer_id`, `stripe_subscription_id`, `status` (active, past_due, canceled…), `current_period_end`, `cancel_at_period_end`.
- `app.stripe_event` : `id`, `type`, `received_at`.
- `lib/server/membership.ts` : `scanLimitFor` et l'accès Premium lisent l'abonnement actif (ou le Premium du lancement selon la décision du propriétaire).

## TVA (Stripe Tax)

1. Dashboard Stripe › Tax › Settings : adresse du siège (sinon le calcul reste en `pending`).
2. Ajouter l'**enregistrement TVA France** (statut « Collecting »). Sans enregistrement actif, Stripe ne calcule et ne collecte **aucune** taxe, sans erreur.
3. `automatic_tax: { enabled: true }` sur la session Checkout ; adresse de facturation collectée par Checkout.
4. **Code de taxe du produit** : à choisir dans la liste officielle (API Tax Codes / guide des codes) parmi les services numériques ; le propriétaire confirme avec son comptable. Aucun code inventé.
5. Ventes à des particuliers d'autres pays de l'UE : TVA du pays du client au-delà de 10 000 € par an (guichet OSS) ; Stripe surveille les seuils (Tax › Locations). Le choix du régime se valide avec le comptable.
6. Vérification : un calcul de taxe test (adresse française) doit donner un `taxability_reason` autre que `not_collecting`.

## Juridique (à faire avant le live)

- Page **Conditions générales de vente** : prix TTC, durée, reconduction, résiliation via le portail, **droit de rétractation de 14 jours** (service numérique : case à cocher demandant l'exécution immédiate et la renonciation au droit de rétractation, sinon remboursement au prorata).
- Mentions légales et politique de confidentialité : Stripe comme sous-traitant de paiement.
- Factures : envoyées par Stripe (numéro de TVA du propriétaire dans Stripe).

## Parcours sur le site

`/premium` : bouton « Passer à Premium » (mensuel / annuel) → connexion si besoin → Checkout Stripe → retour `/compte?premium=merci` (message d'attente jusqu'au webhook) ; espace compte › Réglages : « Gérer mon abonnement » → portail Stripe. Événements maison : `Premium Checkout Started`, `Premium Subscribed`, `Premium Canceled` (tableau de bord, onglet Conversions).

## Étapes

1. Décisions du propriétaire (prix, contenu de Premium, sort des Premium gratuits du lancement, numéro de TVA).
2. Branche dédiée + PR (nouvelle dépendance `stripe`, règle du projet), sandbox, clé restreinte de test rangée par le propriétaire.
3. Migration, produit et prix créés par script idempotent, Checkout, portail, webhook (testé avec la CLI Stripe `stripe listen` et des horloges de test pour les renouvellements et les échecs de paiement).
4. Stripe Tax configuré et vérifié par un calcul test.
5. CGV et pages légales.
6. Passage en live : clé restreinte live, webhook live, prix live, checklist « Go live » de Stripe.

## Droits de la clé limitée (noms de l'écran Stripe, vérifiés le 2026-11-03)

Core : Charges and Refunds (Lecture), Customers (Écriture), Events (Lecture), Payment Disputes (Lecture), Payment Intents (Lecture), Products (Écriture). Billing : Customer Portal (Écriture), Invoices (Lecture), Prices (Écriture), Subscriptions (Écriture). Checkout Sessions (Écriture). Radar : Reviews (Lecture). Tax : Tax Calculations, Transactions (Écriture) ; Tax Settings, Registrations (Lecture). Webhook Endpoints, Event Destinations (Écriture). Tout le reste : Aucune.

Rangement sur le serveur (Termius, la clé ne s'affiche pas) :
`read -rsp "Clé Stripe : " K && echo && umask 077 && printf 'STRIPE_SECRET_KEY=%s\n' "$K" > ~/.config/toutou/stripe.env && unset K && echo OK`
