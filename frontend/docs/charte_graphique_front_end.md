# 🌑 Nightfall Park — Design System & Charte Graphique Front-End

Ce document définit les normes visuelles, les composants d'interface et les règles d'intégration CSS/Tailwind pour l'univers numérique du parc **Nightfall**. 

L'ambiance générale est **post-apocalyptique, horrifique et cyberpunk**, dominée par un contraste marqué entre un fond bleu canard sombre/sombre délavé (Dark Teal) et des accents néon rouge cramoisi (Crimson Neon).

---

## 1. Palette de Couleurs (Color Palette)

### Couleurs Principales (Core Colors)
| Rôle | Nom Couleur | Code HEX | Code RGB / HSL | Usage Front-End |
| :--- | :--- | :--- | :--- | :--- |
| **Fond Principal** | Deep Void (Noir/Bleu) | `#080E14` | `rgb(8, 14, 20)` | `bg-main`, arrière-plan global (`body`) |
| **Fond Secondaire** | Dark Teal Surface | `#0F1A24` | `rgb(15, 26, 36)` | Containers, Cards, Modales |
| **Fond Tertiaire** | Rust & Slate | `#182632` | `rgb(24, 38, 50)` | Hover states, Inputs background |
| **Accent Primary** | Crimson Neon | `#FF0D39` | `rgb(255, 13, 57)` | CTA principaux, alertes, icônes actives |
| **Accent Secondary** | Toxic Cyan | `#00E5FF` | `rgb(0, 229, 255)` | Data sci-fi, statuts secondaires, liens synthétiques |

### Couleurs Neutres & Textes
| Nom | Code HEX | Usage Front-End |
| :--- | :--- | :--- |
| **Text Primary** | `#E2E8F0` | Titres, paragraphes importants, haute lisibilité |
| **Text Muted** | `#7A8B9E` | Subtitles, métadonnées, légendes, placeholders |
| **Warning / Danger** | `#FF4500` | Messages critiques, danger imminent |

---

## 2. Typographie

### Polices Principales (Google Fonts)

1. **Titre & Branding (Display)** : `Orbitron` ou `Rajdhani` (Look Sci-Fi / Militaire / Industriel)
   * **Weights** : Bold (700), Black (900)
   * **Usage** : Titres H1, H2, Logo, Boutons CTA, Badges de sécurité.
   * **Text-Transform** : Toujours `uppercase`
   * **Letter-Spacing** : `tracking-wider` (`0.05em` à `0.1em`)

2. **Corps de texte (Body)** : `Inter` ou `Chakra Petch`
   * **Weights** : Light (300), Regular (400), Medium (500)
   * **Usage** : Description des attractions, billets, modales, textes longs.

```css
/* Configuration CSS Typo */
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600&family=Orbitron:wght@700;900&display=swap');

h1, h2, h3, .font-heading {
  font-family: 'Orbitron', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

body, p, input {
  font-family: 'Chakra Petch', sans-serif;
}
```

---

## 3. Effets Lumineux & Neon Glow (Glow & Lighting)

L'effet lumineux (volumetric lighting & neon) est la signature visuelle de **Nightfall**.

### Ombrages & Glows CSS

```css
/* Crimson Neon Glow (Utilisé sur CTA et alertes) */
.glow-crimson {
  box-shadow: 0 0 10px rgba(255, 13, 57, 0.5),
              0 0 25px rgba(255, 13, 57, 0.3),
              inset 0 0 15px rgba(255, 13, 57, 0.2);
}

.text-glow-crimson {
  text-shadow: 0 0 8px rgba(255, 13, 57, 0.8),
               0 0 20px rgba(255, 13, 57, 0.4);
}

/* Cyan Glow (Utilisé pour le cyberpunk/tech) */
.glow-cyan {
  box-shadow: 0 0 10px rgba(0, 229, 255, 0.5),
              0 0 25px rgba(0, 229, 255, 0.3);
}
```

---

## 4. Bordures & Angles (Borders & Frames)

Pour garder l'esthétique post-apocalyptique/militaire, éviter les bordures arrondies classiques (`border-radius: 8px`). Utiliser des angles biseautés (*clip-path*) ou des bordures fines industrielles.

### Style de Bordures
* **Bordure Standard Card** : `1px solid rgba(255, 13, 57, 0.2)`
* **Bordure Active / Focus** : `1px solid #FF0D39` avec shadow crimson.
* **Bordure d'avertissement** : Hachures jaune/noir ou rouge/noir (Warning stripes).

### Angles Biseautés (Cyber Cut Out)

```css
/* Découpe de coin pour boutons et cartes */
.clip-corner {
  clip-path: polygon(
    0 0, 
    calc(100% - 15px) 0, 
    100% 15px, 
    100% 100%, 
    15px 100%, 
    0 calc(100% - 15px)
  );
}
```

---

## 5. Composants UI & Boutons (CTA)

### A. Bouton Principal (Primary Action / CTA "RÉSERVER / ACCÉDER")
* **Background** : `#FF0D39`
* **Text Color** : `#FFFFFF` (Bold, Uppercase)
* **Hover State** : Fond passe à `#D60029`, augmentation du `glow-crimson`, légère translation (`transform: translateY(-2px)`).
* **Shape** : Biseauté (`clip-corner`).

```html
<!-- HTML & Tailwind Example -->
<button class="bg-[#FF0D39] hover:bg-[#D60029] text-white font-bold py-3 px-8 uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(255,13,57,0.6)] hover:shadow-[0_0_25px_rgba(255,13,57,0.9)] clip-corner">
  Réserver la Survie
</button>
```

### B. Bouton Secondaire (Secondary Action / "EN SAVOIR PLUS")
* **Background** : Transparent ou `#0F1A24`
* **Border** : `1px solid #7A8B9E`
* **Text Color** : `#E2E8F0`
* **Hover State** : Border `#00E5FF`, Text `#00E5FF`, Glow Cyan léger.

### C. Cartes d'Attraction (Cards)
* **Background** : `#0F1A24` avec une opacité de `90%` + `backdrop-blur-md`
* **Border** : `1px solid rgba(122, 139, 158, 0.15)`
* **Hover Card** : La bordure passe à `rgba(255, 13, 57, 0.5)`.

### D. Badges & Statuts d'Attraction
* **Statut "ZONE CRITIQUE"** : Background `#FF0D39` (15% opacity), Text `#FF0D39`, Border `#FF0D39`.
* **Statut "ACCÈS SÉCURISÉ"** : Background `#00E5FF` (15% opacity), Text `#00E5FF`, Border `#00E5FF`.

---

## 6. Graphismes & Effets de Texture

1. **Scanlines / Overlay VHS** : Un léger motif de lignes horizontales transparentes sur tout l'écran pour accentuer le côté écran de contrôle / bunker.
2. **Noise Texture** : Un bruit film 5% pour donner du grain aux fonds sombres.
3. **Bande de Danger Industrial** : 
```css
.danger-stripe {
  background: repeating-linear-gradient(
    -45deg,
    #182632,
    #182632 10px,
    #FF0D39 10px,
    #FF0D39 20px
  );
}
```

---

## 7. Fichiers Médias & Assets Identité

* **Logo Vectoriel Principal** : `assets/logo-nightfall-full.svg` *(Décliné avec l'enseigne néon et la grande roue)*.
* **Favicon** : `assets/favicon-nightfall.png` / `favicon.ico` *(Icône "N" néon rouge intégrée dans la grande roue)*.
* **Image d'en-tête (Hero Banner)** : `nightfall-park-overview.jpg`