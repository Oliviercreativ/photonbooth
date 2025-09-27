# 📸 TODO Photobooth App - Made in Conflans

## ✅ **Terminé**

### 1. **Interface et UX**
- [x] Modal d'accueil avec "coucou"
- [x] Sélection de fond avec 3 onglets (Pays et Ville, Monde Entier, Monde Original)
- [x] Interface caméra simplifiée avec 3 boutons (changer caméra, prendre photo, changer fond)
- [x] Caméra en plein écran (100vw x 100vh)
- [x] Menu mobile avec onglets Caméra/Photos

### 2. **Base de données Supabase**
- [x] Tables `photobooth_sessions` et `photos` avec RLS
- [x] Bucket `photobooth` avec accès public
- [x] Politiques RLS pour INSERT/SELECT uniquement
- [x] Système de sauvegarde automatique des photos

### 3. **API Endpoints**
- [x] `/api/sessions/create` - Créer une session
- [x] `/api/photos/save` - Sauvegarder une photo
- [x] Intégration dans `Camera.vue` avec sauvegarde automatique

---

## 🔄 **En cours**

### 4. **Page de visualisation photo** (`photo/[id]/view.vue`)
- [ ] Créer la page de visualisation
- [ ] Afficher la photo avec 3 icônes en bas : Télécharger, Partager, Supprimer
- [ ] Redirection automatique après prise de photo
- [ ] Gestion des paramètres d'URL avec UUID

---

## ⏳ **À faire**

### 5. **Système de watermark**
- [ ] Watermark "Made in Conflans - Oktoberfest 4/10/2025"
- [ ] Bloc blanc en bas de la photo (pleine largeur)
- [ ] Ajout automatique lors du téléchargement/partage
- [ ] Système de suppression payante (1€ ou 1 point de fidélité)

### 6. **Système de partage**
- [ ] Menu de partage natif du navigateur
- [ ] Toast pour détection de capture d'écran (5 secondes)
- [ ] Message concours : "follow made in conflans + partage instagram"
- [ ] Intégration avec Instagram/Facebook

### 7. **Intégration Grinch (monétisation)**
- [ ] Points de fidélité pour suppression du watermark
- [ ] API pour vérifier les points utilisateur
- [ ] Interface de paiement (1€ ou 1 point)
- [ ] Gestion des transactions

### 8. **Authentification utilisateur**
- [ ] Remplacer `'current-user'` par l'ID utilisateur réel
- [ ] Intégration avec le système d'auth existant
- [ ] Gestion des sessions utilisateur

### 9. **Optimisations et finitions**
- [ ] Gestion des erreurs de réseau
- [ ] Compression optimisée des images
- [ ] Loading states améliorés
- [ ] Tests sur différents appareils mobiles

### 10. **Charte graphique**
- [ ] Couleurs : `#3cc` (boutons), `#2d3c4a` (contenu), `#f7f5f2` (background)
- [ ] Police Rubik (déjà ajoutée)
- [ ] Application de la charte sur tous les composants

---

## 🎯 **Prochaines étapes prioritaires**

1. **Créer `photo/[id]/view.vue`** - Page de visualisation
2. **Système de watermark** - Ajout automatique
3. **Système de partage** - Menu natif + toast
4. **Intégration Grinch** - Monétisation

---

## 📝 **Notes techniques**

### **Structure des URLs**
- Page de visualisation : `/photo/{uuid}/view`
- API photos : `/api/photos/save`
- API sessions : `/api/sessions/create`

### **Base de données**
- **Tables** : `photobooth_sessions`, `photos`
- **Bucket** : `photobooth` (public)
- **RLS** : INSERT/SELECT uniquement, pas de DELETE

### **Authentification**
- Utiliser l'ID utilisateur réel au lieu de `'current-user'`
- Intégration avec le système d'auth existant

### **Watermark**
- Texte : "Made in Conflans - Oktoberfest 4/10/2025"
- Style : Bloc blanc en bas, pleine largeur
- Ajout : Automatique lors du téléchargement/partage

### **Partage**
- Menu natif du navigateur
- Toast de 5 secondes pour captures d'écran
- Message concours pour Instagram

---

## 🚀 **Objectif final**

Application photobooth mobile-first avec :
- ✅ Sélection de fonds et prise de photo
- ✅ Sauvegarde automatique dans Supabase
- 🔄 Page de visualisation avec watermark
- ⏳ Système de partage et monétisation
- ⏳ Intégration Grinch pour la fidélité

**Marketing** : Acquisition de clients pour l'app Grinch
**Monétisation** : Suppression du watermark (1€ ou 1 point)
**Social** : Partage facilité avec concours Instagram
