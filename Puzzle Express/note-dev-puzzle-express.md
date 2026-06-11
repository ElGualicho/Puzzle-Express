# Note de développement — Puzzle Express

## Contexte général du projet

Ce document sert de note de cadrage pour développer le jeu **Puzzle Express** dans le cadre d’une future page de jeux type **borne d’arcade détente** pour les Maisons des Proximités.

Le projet global vise un public adulte / senior, environ **45–70 ans**, mais doit aussi rester compatible avec des usages en **EHPAD** ou avec des personnes peu à l’aise avec l’ordinateur.

L’idée n’est pas de créer une plateforme d’apprentissage numérique, mais plutôt un espace de détente accessible après un accompagnement parfois fatigant : impression de documents administratifs, vérification de mails, démarches en ligne, etc.

Les jeux déjà envisagés dans la borne :

- **Memory** : déjà en place, à peaufiner côté UX, niveaux et design.
- **IA ou pas IA** : jeu d’observation autour d’images réelles et générées par IA.
- **Puzzle Express** : jeu validé, décrit dans cette note.
- **Cherche l’objet** : jeu validé, à cadrer séparément.
- **L’intrus** : idée possible.
- **Devine l’image floutée** : idée possible.

Le ton général doit rester **léger, valorisant, calme et non infantilisant**.

---

## Intention du jeu

**Puzzle Express** est un petit jeu de détente visuelle où l’usager doit reconstituer une image simple en échangeant des morceaux.

L’objectif n’est pas de faire un puzzle complexe, mais un mini-jeu :

- simple à comprendre ;
- agréable à jouer ;
- peu stressant ;
- adapté aux seniors ;
- jouable en quelques minutes ;
- compatible avec un système de score local.

Le jeu doit donner une sensation de réussite rapide, sans créer de frustration.

---

## Public cible

Public principal :

- adultes entre 45 et 70 ans ;
- usagers des Maisons des Proximités ;
- personnes venant déjà pour un accompagnement numérique ;
- personnes parfois fatiguées mentalement après une démarche administrative.

Public secondaire :

- seniors en EHPAD ;
- publics peu à l’aise avec la souris ou l’ordinateur ;
- participants en atelier collectif.

Implications UX :

- éviter les actions trop précises ;
- éviter les timers agressifs ;
- privilégier le clic simple ;
- utiliser de gros boutons ;
- afficher des consignes courtes ;
- éviter les interfaces trop chargées.

---

## Principe du jeu

Une image est découpée en plusieurs morceaux.  
Les morceaux sont mélangés.  
Le joueur clique sur deux pièces pour les échanger.

Déroulé :

1. Le joueur choisit un niveau de difficulté.
2. Une image est sélectionnée.
3. L’image est découpée en grille.
4. Les pièces sont mélangées.
5. Le joueur clique sur une première pièce.
6. La pièce est visuellement sélectionnée.
7. Le joueur clique sur une deuxième pièce.
8. Les deux pièces échangent leur place.
9. Le jeu vérifie si toutes les pièces sont au bon endroit.
10. Quand le puzzle est terminé, l’écran de fin affiche le score.
11. Le joueur peut entrer son prénom ou pseudo dans le tableau des scores.

---

## Gameplay recommandé

### Interaction principale

Utiliser un système **clic + clic** plutôt que du drag & drop.

Raison :

- plus simple pour les seniors ;
- moins de problèmes de précision ;
- meilleur fonctionnement sur ordinateur et tablette ;
- moins frustrant qu’un glisser-déposer raté.

Exemple :

- clic sur la pièce A ;
- la pièce A est entourée ou mise en surbrillance ;
- clic sur la pièce B ;
- A et B échangent leur position ;
- le compteur de coups augmente de 1.

### Désélection

Si le joueur clique une deuxième fois sur la même pièce, elle se désélectionne.

### Feedback visuel

Prévoir :

- contour clair sur la pièce sélectionnée ;
- petite animation lors de l’échange ;
- message positif à la fin ;
- indication du nombre de coups ;
- indication du temps, mais sans pression.

---

## Niveaux de difficulté

### Facile

Grille : **2 × 2**  
Nombre de pièces : **4**

Usage :

- découverte du jeu ;
- EHPAD ;
- public très peu à l’aise ;
- première partie rapide.

### Moyen

Grille : **3 × 2**  
Nombre de pièces : **6**

Usage :

- niveau par défaut conseillé ;
- équilibre entre simplicité et challenge.

### Difficile

Grille : **3 × 3**  
Nombre de pièces : **9**

Usage :

- joueurs plus à l’aise ;
- rejouabilité ;
- score plus élevé.

### Limite recommandée

Ne pas dépasser **9 pièces** pour la V1.  
Au-delà, le jeu risque de devenir frustrant ou trop long pour le public cible.

---

## Types d’images recommandées

Les images doivent être très lisibles, avec des zones bien distinctes.

Catégories adaptées :

- animaux ;
- paysages ;
- fleurs ;
- scènes de jardin ;
- objets vintage ;
- monuments locaux ;
- nourriture ;
- illustrations douces ;
- photos de Castelnau-le-Lez ou Montpellier ;
- scènes chaleureuses et non anxiogènes.

À éviter :

- images trop sombres ;
- images abstraites ;
- textures répétitives ;
- ciels ou murs uniformes ;
- photos trop chargées ;
- images avec trop de détails similaires.

Une image homogène rend le puzzle difficile sans que ce soit intéressant.

---

## Interface recommandée

### Écran de sélection

Contenu :

```txt
Puzzle Express

Reconstituez l’image en échangeant les morceaux.

Choisissez votre niveau :

[Facile — 4 pièces]
[Moyen — 6 pièces]
[Difficile — 9 pièces]
```

Ajouter éventuellement :

```txt
Prenez votre temps, le jeu n’est pas chronométré contre vous.
```

Le temps peut exister pour le score, mais il ne doit pas être présenté comme une pression.

---

### Écran de jeu

Éléments à afficher :

- titre du jeu ;
- grille du puzzle ;
- bouton `Voir le modèle` ;
- compteur de coups ;
- temps écoulé ;
- bouton `Indice` ;
- bouton `Recommencer` ;
- bouton `Quitter`.

Structure possible :

```txt
Puzzle Express

Coups : 8
Temps : 01:24

[Voir le modèle] [Indice]

[ Grille du puzzle ]

[Recommencer] [Quitter]
```

---

### Écran de fin

Contenu :

```txt
Bravo, puzzle terminé !

Niveau : Moyen
Temps : 02:10
Coups : 14
Score : 720 points

Entrez votre prénom ou pseudo :
[__________]

[Enregistrer le score]
[Rejouer]
[Retour aux jeux]
```

Le message de fin doit être valorisant, même si le score est faible.

Exemples :

- “Bravo, vous avez terminé le puzzle !”
- “Bien joué, image reconstituée !”
- “Puzzle réussi !”

Éviter les messages négatifs du type “Trop lent” ou “Peut mieux faire”.

---

## Aides à prévoir

### Voir le modèle

Bouton permettant d’afficher l’image complète.

Deux possibilités :

1. afficher le modèle en miniature permanente ;
2. afficher le modèle dans une fenêtre modale pendant quelques secondes.

Pour le public cible, la miniature permanente est probablement plus confortable.

### Indice

Le bouton `Indice` peut :

- replacer automatiquement une pièce au bon endroit ;
- ou surligner une pièce mal placée ;
- ou montrer brièvement la position correcte d’une pièce.

Recommandation V1 :

- surligner une pièce mal placée est moins intrusif ;
- replacer une pièce automatiquement est plus simple à comprendre.

### Recommencer

Relance la même image avec un nouveau mélange.

### Changer d’image

Option possible mais pas obligatoire pour la V1.

---

## Système de score

Le score doit être simple et lisible.  
Il doit récompenser la réussite, mais ne pas punir trop fortement la lenteur.

### Score de base proposé

```txt
Facile : 300 points
Moyen : 600 points
Difficile : 900 points
```

### Malus proposés

```txt
-10 points par échange de pièces
-1 point toutes les 5 secondes
-50 points par indice utilisé
```

### Bonus possible

```txt
+100 points si terminé sans indice
```

### Score minimum

Prévoir un score minimum pour éviter un résultat humiliant.

Exemple :

```txt
score = Math.max(score, 50)
```

### Exemple de calcul

```txt
Niveau moyen : 600 points
14 coups : -140 points
2 minutes 10 secondes : -26 points
0 indice : +100 points

Score final : 534 points
```

---

## Tableau des scores

Chaque jeu de la borne doit pouvoir enregistrer un score local.

Stockage recommandé pour la V1 :

```txt
localStorage
```

Avantages :

- pas besoin de serveur ;
- fonctionne hors ligne ;
- adapté à un ordinateur fixe en Maison des Proximités ;
- facile à maintenir.

Données à enregistrer :

```js
{
  game: "puzzle-express",
  playerName: "Marie",
  score: 720,
  level: "moyen",
  moves: 14,
  timeSeconds: 130,
  date: "2026-07-12T14:30:00.000Z"
}
```

Prévoir :

- un classement par jeu ;
- un top 5 ou top 10 ;
- un bouton discret pour réinitialiser les scores ;
- une limitation de longueur du pseudo ;
- éviter les noms complets pour la confidentialité.

---

## Structure de données possible

### Configuration des niveaux

```js
const LEVELS = {
  easy: {
    label: "Facile",
    rows: 2,
    cols: 2,
    baseScore: 300
  },
  medium: {
    label: "Moyen",
    rows: 2,
    cols: 3,
    baseScore: 600
  },
  hard: {
    label: "Difficile",
    rows: 3,
    cols: 3,
    baseScore: 900
  }
}
```

### Configuration des images

```js
const PUZZLE_IMAGES = [
  {
    id: "chat-jardin",
    title: "Chat dans le jardin",
    src: "assets/puzzle/chat-jardin.jpg",
    alt: "Un chat assis dans un jardin"
  },
  {
    id: "fleurs",
    title: "Bouquet de fleurs",
    src: "assets/puzzle/fleurs.jpg",
    alt: "Un bouquet de fleurs colorées"
  },
  {
    id: "castelnau",
    title: "Castelnau-le-Lez",
    src: "assets/puzzle/castelnau.jpg",
    alt: "Vue de Castelnau-le-Lez"
  }
]
```

### État d’une pièce

```js
{
  id: 0,
  correctIndex: 0,
  currentIndex: 3,
  row: 0,
  col: 0
}
```

---

## Logique technique attendue

### Découpage visuel

Deux approches possibles :

#### Option A — Une seule image utilisée en background

Chaque pièce est un bloc `div` avec :

- même image de fond ;
- position de fond différente ;
- taille calculée selon la grille.

Avantage :

- pas besoin de générer physiquement des fichiers découpés ;
- plus simple à maintenir ;
- chaque image source suffit.

Exemple conceptuel :

```css
.puzzle-piece {
  background-image: url("image.jpg");
  background-size: 300% 200%; /* pour une grille 3x2 */
}
```

#### Option B — Images pré-découpées

Chaque pièce est un fichier image séparé.

Inconvénients :

- plus lourd à produire ;
- moins flexible ;
- plus de fichiers à gérer.

Recommandation : utiliser **Option A**.

---

## Conditions de victoire

Le puzzle est terminé quand chaque pièce est à son emplacement correct.

Exemple :

```js
const isComplete = pieces.every(piece => piece.currentIndex === piece.correctIndex)
```

À la victoire :

- arrêter le timer ;
- calculer le score ;
- afficher l’écran de fin ;
- proposer l’enregistrement du score.

---

## Accessibilité et confort

À prévoir :

- boutons larges ;
- contraste suffisant ;
- typo lisible ;
- consignes courtes ;
- pas d’animation trop rapide ;
- pas de son obligatoire ;
- pas de pénalité violente ;
- possibilité de quitter ou recommencer facilement ;
- possibilité d’utiliser le jeu sans clavier.

Taille conseillée des zones cliquables :

```txt
minimum 44 × 44 px
```

Prévoir un affichage responsive, mais la priorité est probablement :

- ordinateur fixe ;
- tablette ;
- écran de Maison des Proximités.

---

## Ton et habillage

Le jeu doit rester adulte, doux et non infantilisant.

Éviter :

- couleurs trop flashy ;
- mascottes enfantines ;
- textes trop scolaires ;
- pression excessive ;
- bruitages obligatoires.

Privilégier :

- ambiance arcade douce ;
- cartes visuelles simples ;
- boutons clairs ;
- couleurs chaleureuses ;
- micro-animations sobres ;
- message final positif.

---

## Fonctionnalités V1

À développer en priorité :

- écran de sélection du niveau ;
- sélection aléatoire d’une image ;
- puzzle avec clic sur deux pièces pour échanger ;
- compteur de coups ;
- timer non agressif ;
- bouton voir modèle ;
- bouton indice simple ;
- détection de victoire ;
- score final ;
- saisie prénom/pseudo ;
- classement local via `localStorage`;
- bouton rejouer ;
- retour à la page d’accueil des jeux.

---

## Fonctionnalités à garder pour plus tard

Possibles évolutions V2 :

- choix du thème d’image ;
- galerie d’images ;
- mode EHPAD avec uniquement 4 pièces ;
- mode “sans score” ;
- animations de victoire plus poussées ;
- export ou impression du classement ;
- écran animateur pour réinitialiser les scores ;
- statistiques de parties jouées ;
- variantes de puzzle avec pièce manquante.

---

## Variante possible : pièce manquante

Une variante plus simple pourrait être ajoutée plus tard.

Principe :

- une image presque complète est affichée ;
- une pièce manque ;
- le joueur choisit la bonne pièce parmi 3 ou 4 propositions.

Avantages :

- très accessible ;
- rapide ;
- idéal pour EHPAD.

Inconvénients :

- moins rejouable ;
- gameplay moins riche que l’échange de pièces.

Cette variante n’est pas prioritaire pour la V1.

---

## Résumé rapide pour développement

Puzzle Express doit être un jeu de puzzle simple, basé sur une grille de 4, 6 ou 9 pièces.  
Le joueur échange deux pièces par clics successifs.  
Le jeu doit être calme, lisible, sans stress, adapté aux adultes et seniors.

Priorités :

1. clic simple plutôt que drag & drop ;
2. difficulté limitée à 9 pièces maximum ;
3. images très lisibles ;
4. timer non punitif ;
5. score valorisant ;
6. classement local ;
7. interface sobre et accessible.

Objectif final : proposer un mini-jeu agréable à lancer après un accompagnement numérique, dans une borne de jeux détente pour les Maisons des Proximités.
