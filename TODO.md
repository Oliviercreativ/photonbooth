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

## 🎯 Priorité des étapes

### Phase 1 - Prototype (1-2 jours)
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