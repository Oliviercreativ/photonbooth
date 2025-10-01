# TODO - Photobooth App Made in Conflans

## 🎨 Fonctionnalités à développer

### 1. 🎁 Programme de fidélité "Made in Conflans" (Priorité : Très Haute)

**Concept :**
Intégrer le photobooth avec le **programme de fidélité Made in Conflans** pour récompenser les utilisateurs et créer de l'engagement.

**Workflow utilisateur :**
```
Étape 1 : Mode invité (1 photo gratuite)
  → Capture 1 photo
  → Email envoyé avec lien téléchargement
  → Incitation inscription

Étape 2 : Inscription à l'app Made in Conflans
  → Création compte avec email
  → Connexion au photobooth
  → 🎉 RÉCOMPENSES IMMÉDIATES :
     ✅ +5 photos supplémentaires débloquées
     ✅ +5 points de fidélité sur la carte Made in Conflans
     ✅ Accès à tous les fonds sans limite de changement
     ✅ Galerie photos sauvegardée

Étape 3 : Utilisation continue
  → Chaque photo prise = +1 point fidélité (optionnel)
  → Paliers de récompenses :
     • 10 points = 1 fond exclusif débloqué
     • 25 points = Suppression watermark gratuite
     • 50 points = Accès anticipé nouveaux styles
```

**Avantages pour Made in Conflans :**
- ✅ Augmente inscriptions app fidélité
- ✅ Capture emails qualifiés (intérêt local)
- ✅ Crée engagement avec la marque locale
- ✅ Encourage achats chez commerçants partenaires
- ✅ Data précieuse : qui participe aux événements

**Avantages pour l'utilisateur :**
- ✅ Motivation claire pour s'inscrire (+5 photos)
- ✅ Récompenses tangibles (points fidélité)
- ✅ Souvenir permanent de l'événement
- ✅ Avantages futurs dans commerces locaux

---

### 2. 🌍 Mode "Paysage + Style" (Priorité : Haute)

**Concept :**
Permettre de choisir **2 éléments séparés** avant la capture :
1. Un **paysage/lieu** (Brussels, Paris, Conflans, Plage tropicale, etc.)
2. Un **style artistique** (Pixar, Ghibli, Pop Art, Film Noir, etc.)

**Workflow utilisateur :**
```
Étape 1 : Choisir un paysage
  → Brussels Grand-Place
  → Tour Eiffel Paris
  → Conflans bords de Seine
  → Plage tropicale
  → etc.

Étape 2 : Choisir un style artistique
  → Pixar 3D
  → Studio Ghibli
  → Pop Art Warhol
  → Film Noir
  → Cyberpunk
  → Disco 70s
  → etc.

Étape 3 : Capturer la photo
  → La personne est photographiée

Étape 4 : Gemini applique TOUT ensemble
  → Personne transformée en style choisi
  → Fond = paysage choisi avec le même style appliqué
  → Résultat : Photo style Pixar de toi devant la Tour Eiffel en Pixar !
```

**Cas d'usage - Événement Conflans Oktoberfest :**
- Choix paysage : "Conflans bords de Seine"
- Choix style : "Pixar 3D"
- Résultat : Personnage Pixar devant Conflans en style Pixar = **souvenir unique de la fête !**

**Avantages :**
- ✅ Beaux souvenirs avec lieux réels + style fun
- ✅ Personnalisation maximale (2 choix au lieu d'1)
- ✅ Combinaisons infinies : 7 paysages × 10 styles = 70 possibilités
- ✅ Photos uniques pour chaque événement local

---

## 🔧 Implémentation technique

### Architecture proposée :

#### 1. **Nouvelle structure de sélection**
```
/pages/index.vue
  → Étape 1 : BackgroundLocationSelector (paysages uniquement)
  → Étape 2 : BackgroundStyleSelector (styles artistiques uniquement)
  → Étape 3 : Camera (avec les 2 choix stockés)
```

#### 2. **Modifications API**
```typescript
// server/api/photobooth-nano-banana.post.ts
// Nouveau body :
{
  photo: base64,
  locationId: 'paris-eiffel', // Nouveau
  styleId: 'pixar-pure',      // Nouveau
  // Ancien backgroundId remplacé par locationId + styleId
}

// Nouveau système de prompts combinés :
const prompt = generateCombinedPrompt(locationId, styleId)
// Exemple résultat :
"Transform the person(s) into Pixar 3D character
 AND place them in front of Eiffel Tower at Trocadéro
 AND transform the ENTIRE background (Eiffel Tower included) into Pixar 3D style"
```

#### 3. **Base de données**
```sql
-- Ajouter colonnes dans table photos :
ALTER TABLE photos
  ADD COLUMN location_id TEXT,
  ADD COLUMN style_id TEXT;

-- Garder background_id pour compatibilité :
-- background_id = 'location_id-style_id' (ex: 'paris-eiffel-pixar-pure')
```

#### 4. **Nouveaux composants**
```
/components/BackgroundLocationSelector.vue
  → Affiche uniquement les lieux/paysages
  → Onglets : Europe, France, Conflans, Plages, Montagnes

/components/BackgroundStyleSelector.vue
  → Affiche uniquement les styles artistiques
  → Onglets : Animation 3D, Rétro, Futuriste, Noir & Blanc

/composables/useBackgroundCombination.js
  → Gère la combinaison location + style
  → Génère l'ID combiné
  → Génère le prompt combiné
```

---

## 🔧 Implémentation Programme de Fidélité

### Architecture technique :

#### 1. **Base de données - Nouvelle table `loyalty_points`**
```sql
CREATE TABLE loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0, -- Points cumulés totaux
  tier TEXT DEFAULT 'bronze', -- bronze, silver, gold, platinum
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table historique des points
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL, -- Peut être négatif (dépense)
  type TEXT NOT NULL, -- 'signup_bonus', 'photo_taken', 'redemption', 'manual_adjustment'
  description TEXT,
  photo_id UUID REFERENCES photos(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_loyalty_points_user_id ON loyalty_points(user_id);
CREATE INDEX idx_loyalty_transactions_user_id ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_created_at ON loyalty_transactions(created_at);
```

#### 2. **Modifier table `profiles`**
```sql
ALTER TABLE profiles
  ADD COLUMN loyalty_card_number TEXT UNIQUE,
  ADD COLUMN loyalty_tier TEXT DEFAULT 'bronze',
  ADD COLUMN total_loyalty_points INTEGER DEFAULT 0,
  ADD COLUMN signup_bonus_claimed BOOLEAN DEFAULT FALSE;
```

#### 3. **API Endpoints à créer**
```typescript
// server/api/loyalty/award-signup-bonus.post.ts
// Attribution automatique à l'inscription
POST /api/loyalty/award-signup-bonus
Body: { userId }
Response: { points: 5, bonus_photos: 5 }

// server/api/loyalty/award-photo-points.post.ts
// Attribution à chaque photo prise
POST /api/loyalty/award-photo-points
Body: { userId, photoId }
Response: { points: 1, total: 15 }

// server/api/loyalty/get-balance.get.ts
// Récupérer le solde actuel
GET /api/loyalty/get-balance
Response: { points: 15, tier: 'bronze', photos_remaining: 8 }

// server/api/loyalty/redeem-reward.post.ts
// Échanger des points contre récompense
POST /api/loyalty/redeem-reward
Body: { userId, rewardId, pointsCost }
Response: { success: true, remaining_points: 10 }
```

#### 4. **Workflow d'inscription avec bonus**
```typescript
// pages/auth.vue - Modifier signup
async function handleSignup() {
  // 1. Créer compte Supabase
  const { data, error } = await supabase.auth.signUp({ email, password })

  // 2. Attribuer bonus inscription
  if (!error) {
    await $fetch('/api/loyalty/award-signup-bonus', {
      method: 'POST',
      body: { userId: data.user.id }
    })

    // 3. Afficher notification
    showSuccessToast('🎉 Bienvenue ! +5 photos et +5 points fidélité !')

    // 4. Rediriger vers photobooth
    navigateTo('/')
  }
}
```

#### 5. **Affichage temps réel des points**
```vue
<!-- components/LoyaltyBadge.vue -->
<template>
  <div class="loyalty-badge">
    <Icon name="heroicons:star" />
    <span>{{ loyaltyPoints }} pts</span>
    <span class="tier">{{ tier }}</span>
  </div>
</template>
```

#### 6. **Intégration avec photobooth**
```typescript
// pages/index.vue - Après capture photo
async function handlePhotoCaptured(photo) {
  // Sauvegarder photo
  const savedPhoto = await savePhoto(photo)

  // Si utilisateur connecté, attribuer point
  if (user.value) {
    const loyaltyResult = await $fetch('/api/loyalty/award-photo-points', {
      method: 'POST',
      body: {
        userId: user.value.id,
        photoId: savedPhoto.id
      }
    })

    showToast(`+1 point fidélité ! Total : ${loyaltyResult.total} pts`)
  }
}
```

---

## 📊 Données à structurer

### Locations (Paysages) :
```javascript
const locations = [
  {
    id: 'brussels-grand-place',
    name: 'Grand-Place Bruxelles',
    emoji: '🏛️',
    category: 'europe',
    prompt: 'Brussels Grand-Place with guild houses and historic square'
  },
  {
    id: 'paris-eiffel',
    name: 'Tour Eiffel Paris',
    emoji: '🗼',
    category: 'france',
    prompt: 'Eiffel Tower from Trocadéro perspective'
  },
  {
    id: 'conflans-seine',
    name: 'Conflans bords de Seine',
    emoji: '🏘️',
    category: 'conflans',
    prompt: 'Conflans Sainte Honorine riverside with church and Seine river'
  },
  // ... etc
]
```

### Styles (Artistiques) :
```javascript
const styles = [
  {
    id: 'pixar-pure',
    name: 'Pixar 3D',
    emoji: '🎭',
    category: 'animation-3d',
    transformPrompt: 'Transform into charming Pixar-style 3D with smooth surfaces, realistic lighting'
  },
  {
    id: 'ghibli-pure',
    name: 'Studio Ghibli',
    emoji: '🎨',
    category: 'animation-2d',
    transformPrompt: 'Transform into Studio Ghibli hand-drawn animation style with watercolor aesthetic'
  },
  {
    id: 'pop-art-warhol',
    name: 'Pop Art Warhol',
    emoji: '🎨',
    category: 'art-moderne',
    transformPrompt: 'Transform into bold Pop Art with screen-printing effect, high contrast colors'
  },
  // ... etc
]
```

---

## 🏆 Paliers et Récompenses Fidélité

### Paliers (Tiers)
```javascript
const loyaltyTiers = [
  {
    tier: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    maxPoints: 24,
    benefits: ['5 photos gratuites', 'Galerie sauvegardée']
  },
  {
    tier: 'silver',
    name: 'Argent',
    minPoints: 25,
    maxPoints: 49,
    benefits: ['10 photos gratuites', '1 fond exclusif', 'Priorité support']
  },
  {
    tier: 'gold',
    name: 'Or',
    minPoints: 50,
    maxPoints: 99,
    benefits: ['20 photos gratuites', '3 fonds exclusifs', 'Watermark supprimé', 'Beta testeur']
  },
  {
    tier: 'platinum',
    name: 'Platine',
    minPoints: 100,
    benefits: ['Photos illimitées', 'Tous fonds exclusifs', 'Accès anticipé', 'Badge platine']
  }
]
```

### Catalogue de récompenses
```javascript
const rewards = [
  // Photos supplémentaires
  { id: 'photos-5', name: '+5 photos', cost: 10, type: 'photos' },
  { id: 'photos-10', name: '+10 photos', cost: 18, type: 'photos' },

  // Fonctionnalités premium
  { id: 'remove-watermark-1', name: 'Supprimer watermark (1 photo)', cost: 5, type: 'feature' },
  { id: 'remove-watermark-all', name: 'Supprimer watermark (permanent)', cost: 25, type: 'feature' },
  { id: 'unlock-exclusive-bg', name: 'Débloquer fond exclusif', cost: 15, type: 'unlock' },

  // Avantages commerces
  { id: 'coffee-conflans', name: 'Café offert chez partenaire', cost: 20, type: 'partner' },
  { id: 'discount-10', name: '-10% chez commerçants Made in Conflans', cost: 30, type: 'partner' },

  // Événements spéciaux
  { id: 'vip-event', name: 'Accès VIP prochain événement', cost: 50, type: 'event' },
  { id: 'early-access', name: 'Accès anticipé nouveaux styles', cost: 40, type: 'event' }
]
```

---

## 🎯 Priorité des étapes

### PRIORITÉ IMMÉDIATE - Fonctionnalités Événement Oktoberfest (2-3 jours)

**Pour la journée événement - Fonctionnalités essentielles :**

#### 1. Avant la capture photo
- [ ] **Compte à rebours visuel** : Animation 3...2...1... avant déclenchement
  - Animation plein écran avec cercle qui se remplit
  - Son optionnel "bip bip bip"
  - Permet à l'utilisateur de se préparer

#### 2. Formats de sortie photo (après capture)
- [ ] **Format strip classique** : 3-4 photos verticales côte à côte
  - Comme les vraies cabines photo
  - Taille : 2x6 pouces (5x15cm)
  - Fond blanc entre les photos
  - Logo Made in Conflans en bas

- [ ] **Collage 2×2** : 4 photos différentes en grille carrée
  - Format carré Instagram-friendly
  - 4 variations du même style OU 4 styles différents
  - Bordures blanches entre les photos

- [ ] **Format Polaroid** : Photo avec cadre blanc en bas
  - Espace blanc de 20% en bas
  - Possibilité d'ajouter texte manuscrit virtuel
  - Look vintage authentique

- [ ] **Format Instagram carré** : 1:1 parfait
  - 1080x1080px
  - Optimisé pour feed Instagram
  - Avec ou sans cadre

- [ ] **Format Instagram Story** : Vertical 9:16
  - 1080x1920px
  - Optimisé pour stories/reels
  - Espace pour stickers et texte

#### 3. Informations automatiques sur la photo
- [ ] **Date et lieu** : Ajout automatique en overlay
  - Texte : "Oktoberfest Conflans - [Date du jour]"
  - Position configurable (bas, coin)
  - Police élégante, couleur contrastée
  - Optionnel (peut être désactivé par utilisateur)

- [ ] **QR Code intégré** : Vers site Made in Conflans
  - QR code dans un coin de la photo
  - Taille : ~15% de la photo
  - Lien vers : https://madeinconflans.fr ou app store
  - Réutiliser la fonctionnalité existante de génération QR
  - Alternative : QR code vers téléchargement HD de la photo

#### 4. Mode aléatoire
- [ ] **Bouton "Surprise-moi !"** : Fond aléatoire
  - Sélectionne un fond au hasard parmi tous disponibles
  - Animation roulette de casino avant révélation
  - Message : "Vous avez obtenu : [Nom du style] !"
  - Parfait pour les indécis ou pour créer du fun

---

## 🔧 Implémentation Fonctionnalités Événement

### 1. Compte à rebours visuel

**Composant à créer : `/components/CameraCountdown.vue`**

```vue
<template>
  <div v-if="isCountingDown" class="countdown-overlay">
    <div class="countdown-circle">
      <span class="countdown-number">{{ count }}</span>
    </div>
    <p class="countdown-text">Préparez-vous !</p>
  </div>
</template>

Fonctionnalités :
- Animation cercle SVG qui se remplit en 3 secondes
- Son "bip" à chaque seconde (optionnel)
- Vibration mobile (si supporté)
- Déclenchement auto de la capture à 0
```

### 2. Formats de sortie photo

**API à créer : `/server/api/photo/format.post.ts`**

```typescript
POST /api/photo/format
Body: {
  photoUrl: string,
  format: 'strip' | 'grid' | 'polaroid' | 'square' | 'story',
  options: {
    includeDate: boolean,
    includeQR: boolean,
    eventName: string
  }
}

Utiliser `sharp` pour :
- Créer canvas aux bonnes dimensions
- Positionner photo(s)
- Ajouter bordures blanches
- Ajouter texte date/lieu
- Générer et insérer QR code
- Export final
```

**Dimensions à utiliser :**
```javascript
const formats = {
  strip: { width: 500, height: 1500 }, // 3 photos de 500x500
  grid: { width: 1080, height: 1080 }, // 2x2 de 540x540 chacune
  polaroid: { width: 800, height: 1000 }, // Photo 800x800 + 200px bas
  square: { width: 1080, height: 1080 }, // Instagram feed
  story: { width: 1080, height: 1920 }  // Instagram story
}
```

### 3. Génération QR Code

**Librairie à utiliser : `qrcode`**

```bash
npm install qrcode
```

```typescript
// server/utils/qrGenerator.ts
import QRCode from 'qrcode'

export async function generateQRCode(url: string) {
  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 200,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  })
  return qrDataUrl // Base64 image
}

// Utilisation dans format.post.ts
const qrImage = await generateQRCode('https://madeinconflans.fr')
// Puis insérer avec sharp.composite()
```

### 4. Mode aléatoire

**Modifier : `/components/BackgroundSelector.vue`**

```vue
<!-- Nouveau bouton dans le header -->
<button @click="selectRandomBackground" class="btn-surprise">
  <Icon name="heroicons:sparkles" />
  🎲 Surprise-moi !
</button>

<script>
const selectRandomBackground = () => {
  // Animation roulette
  showRoulette.value = true

  // Sélection aléatoire après 2 secondes
  setTimeout(() => {
    const randomIndex = Math.floor(Math.random() * backgrounds.value.length)
    const randomBg = backgrounds.value[randomIndex]

    selectBackground(randomBg)
    showRoulette.value = false

    // Notification
    showToast(`🎉 Style obtenu : ${randomBg.name} !`)
  }, 2000)
}
</script>
```

### 5. Date et lieu automatique

**Overlay avec `sharp` lors de la génération finale :**

```typescript
// server/api/photo/format.post.ts
import sharp from 'sharp'

async function addEventOverlay(imageBuffer: Buffer, eventName: string) {
  const date = new Date().toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  const text = `${eventName} - ${date}`

  // Créer SVG avec texte
  const svgText = `
    <svg width="1080" height="100">
      <style>
        .title {
          font-family: Arial, sans-serif;
          font-size: 32px;
          font-weight: bold;
          fill: white;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
        }
      </style>
      <text x="50%" y="50%" text-anchor="middle" class="title">${text}</text>
    </svg>
  `

  const textBuffer = Buffer.from(svgText)

  // Composite sur l'image
  return await sharp(imageBuffer)
    .composite([{
      input: textBuffer,
      gravity: 'south'
    }])
    .toBuffer()
}
```

---

## 📋 Plan d'implémentation Événement (Ordre recommandé)

### Jour 1 - Fonctionnalités de base
1. ✅ Compte à rebours visuel (2h)
2. ✅ Mode aléatoire avec animation (1h)
3. ✅ Date/lieu automatique overlay (2h)

### Jour 2 - Formats de sortie
4. ✅ Format Instagram carré (1h)
5. ✅ Format Instagram story (1h)
6. ✅ Format Polaroid (2h)
7. ✅ Génération QR Code + intégration (2h)

### Jour 3 - Formats avancés + tests
8. ✅ Format strip 3 photos (3h)
9. ✅ Format collage 2×2 (2h)
10. ✅ Tests complets tous formats (2h)

### Installation dépendances
```bash
npm install qrcode
npm install --save-dev @types/qrcode
```

---

### PRIORITÉ HAUTE - Programme Fidélité (3-5 jours)
- [ ] Créer tables `loyalty_points` et `loyalty_transactions`
- [ ] Modifier table `profiles` avec colonnes fidélité
- [ ] Créer API `award-signup-bonus.post.ts`
- [ ] Créer API `award-photo-points.post.ts`
- [ ] Créer API `get-balance.get.ts`
- [ ] Modifier `pages/auth.vue` pour bonus inscription
- [ ] Créer composant `LoyaltyBadge.vue`
- [ ] Afficher points en temps réel dans navbar
- [ ] Tester workflow complet inscription → bonus → photos
- [ ] Documentation utilisateur

### Phase 1 - Mode Paysage + Style - Prototype (1-2 jours)
- [ ] Créer `BackgroundLocationSelector.vue` avec 5 lieux test
- [ ] Créer `BackgroundStyleSelector.vue` avec 5 styles test
- [ ] Modifier `index.vue` pour workflow en 2 étapes
- [ ] Tester avec Gemini API la génération combinée

### Phase 2 - Prompts combinés (2-3 jours)
- [ ] Créer fonction `generateCombinedPrompt(location, style)`
- [ ] Tester 25 combinaisons (5×5)
- [ ] Valider qualité des résultats Gemini
- [ ] Ajuster prompts si nécessaire

### Phase 3 - Base de données (1 jour)
- [ ] Ajouter colonnes `location_id` et `style_id`
- [ ] Migration données existantes
- [ ] Update API endpoints

### Phase 4 - Production complète (3-4 jours)
- [ ] Ajouter tous les lieux (15-20)
- [ ] Ajouter tous les styles (10-15)
- [ ] Générer previews pour combinaisons populaires
- [ ] Tests utilisateurs

---

## 💡 Améliorations futures possibles

### Mode "Quick Mix"
- [ ] Bouton "Surprise-moi !" qui choisit aléatoirement location + style
- [ ] Mode "Thème du jour" (ex: "Conflans en Pixar" le samedi)

### Favoris
- [ ] Utilisateurs sauvent leurs combinaisons préférées
- [ ] Top 10 des combinaisons les plus populaires

### Prévisualisation
- [ ] Montrer un exemple de rendu avant capture
- [ ] Aperçu en temps réel avec filtre approximatif

### Partage
- [ ] "J'ai créé ma photo [Style] à [Lieu] !"
- [ ] Templates de partage social

---

## 🔗 Intégration avec l'App Made in Conflans

### API externe Made in Conflans (à définir)

**Endpoints supposés de l'app Made in Conflans :**

```typescript
// 1. Vérifier si utilisateur existe dans l'app fidélité
GET https://api.madeinconflans.fr/v1/loyalty/user/:email
Response: {
  exists: boolean,
  card_number: string,
  current_points: number
}

// 2. Ajouter points sur la carte fidélité
POST https://api.madeinconflans.fr/v1/loyalty/points/add
Body: {
  card_number: string,
  points: number,
  source: 'photobooth',
  event: 'oktoberfest_2025'
}
Response: {
  success: boolean,
  new_balance: number
}

// 3. Synchroniser compte photobooth avec app fidélité
POST https://api.madeinconflans.fr/v1/loyalty/link-account
Body: {
  email: string,
  photobooth_user_id: uuid,
  event: 'oktoberfest_2025'
}
Response: {
  success: boolean,
  card_number: string
}
```

### Workflow de synchronisation

```typescript
// composables/useLoyaltySync.ts
export const useLoyaltySync = () => {
  // Vérifier si l'utilisateur a déjà une carte Made in Conflans
  const checkExistingCard = async (email: string) => {
    try {
      const response = await $fetch('https://api.madeinconflans.fr/v1/loyalty/user/' + email)
      return response.exists ? response : null
    } catch (error) {
      return null
    }
  }

  // Synchroniser points photobooth → App fidélité
  const syncPoints = async (cardNumber: string, points: number) => {
    try {
      await $fetch('https://api.madeinconflans.fr/v1/loyalty/points/add', {
        method: 'POST',
        body: {
          card_number: cardNumber,
          points: points,
          source: 'photobooth',
          event: 'oktoberfest_2025'
        }
      })
      return true
    } catch (error) {
      console.error('Erreur sync points:', error)
      return false
    }
  }

  return { checkExistingCard, syncPoints }
}
```

### Workflow utilisateur complet

```
1. Utilisateur invité prend 1 photo gratuite
   ↓
2. Incitation inscription : "Créez un compte pour +5 photos !"
   ↓
3. Utilisateur entre email + mot de passe
   ↓
4. Vérification : Email existe déjà dans l'app Made in Conflans ?
   ↓
   OUI → Récupérer card_number existant
   ↓     Lier compte photobooth ↔ carte fidélité
   ↓     Attribution bonus : +5 photos + +5 points
   ↓     Synchronisation points vers app Made in Conflans
   ↓
   NON → Création nouveau compte photobooth
   ↓     Attribution bonus : +5 photos + +5 points
   ↓     Message : "Téléchargez l'app Made in Conflans pour profiter
                    de vos points chez les commerçants !"
   ↓
5. Utilisateur continue à prendre des photos
   ↓
6. Chaque photo = +1 point (synchro automatique si carte liée)
```

### Affichage dans l'interface

```vue
<!-- components/LoyaltyStatus.vue -->
<template>
  <div class="loyalty-status">
    <!-- Photobooth points -->
    <div class="photobooth-points">
      <Icon name="heroicons:camera" />
      <span>{{ photoboothPoints }} pts Photobooth</span>
    </div>

    <!-- Made in Conflans points (si carte liée) -->
    <div v-if="hasLinkedCard" class="mic-points">
      <Icon name="heroicons:sparkles" />
      <span>{{ micPoints }} pts Made in Conflans</span>
      <button @click="openMicApp">Voir avantages</button>
    </div>

    <!-- Incitation si pas de carte -->
    <div v-else class="link-card-cta">
      <p>Téléchargez l'app Made in Conflans pour utiliser vos points !</p>
      <button @click="showLinkCardModal">Lier ma carte</button>
    </div>
  </div>
</template>
```

---

## 📝 Notes importantes

**Compatibilité arrière :**
- Garder le système actuel fonctionnel pendant transition
- `background_id` = `${location_id}-${style_id}` pour compatibilité

**Gemini API considérations :**
- Tester si prompts combinés donnent de bons résultats
- Possibilité de faire 2 passes si nécessaire :
  1. Pass 1 : Placer personne dans le paysage
  2. Pass 2 : Appliquer le style sur le tout

**UX Event Conflans :**
- Mode simplifié pour l'événement : "Choisir votre style Conflans"
- Tous les styles appliqués sur fond Conflans par défaut
- Option avancée pour choisir autre lieu

---

**Date création TODO :** 2025-01-16
**Créé par :** Claude Code (Sonnet 4.5)
**Pour :** Olivier Demontant - Événement Made in Conflans Oktoberfest