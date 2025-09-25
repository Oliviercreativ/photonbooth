# 🎨 Génération des Images de Preview Studio Ghibli

## 📸 **Images Temporaires Créées**

J'ai créé des images de preview temporaires en copiant les images Pixar existantes :

- ✅ `ghibli-belgium.jpg` (copié depuis `pixar-belgium.jpg`)
- ✅ `ghibli-uk.jpg` (copié depuis `pixar-uk.jpg`)
- ✅ `ghibli-germany.jpg` (copié depuis `pixar-germany.jpg`)
- ✅ `ghibli-france.jpg` (copié depuis `pixar.jpg`)
- ✅ `ghibli-conflans.jpg` (copié depuis `pixar-belgium.jpg`)

## 🎯 **Pour Créer de Vraies Images Studio Ghibli**

### **Option 1 : Utiliser votre Photobooth**
1. Démarrer l'application : `bun run dev`
2. Aller sur `http://localhost:3000/session`
3. Prendre une photo de test avec un fond Studio Ghibli
4. Sauvegarder l'image générée
5. La redimensionner et l'utiliser comme preview

### **Option 2 : Utiliser Gemini directement**
Utilisez le script de test avec ces prompts :

```javascript
// Pour ghibli-belgium
const prompt = `Create a Studio Ghibli-style preview image showing a Belgian celebration scene with the Belgian flag (black, yellow, red vertical stripes), golden Belgian waffles with whipped cream, Belgian beer with foam, Belgian chocolate truffles, Belgian fries, and the Atomium structure in the background. Use the characteristic Ghibli color palette with soft pastels, warm earth tones, and gentle watercolor-like textures. The scene should look like it could be from a Studio Ghibli movie celebrating Belgian culture.`

// Pour ghibli-uk
const prompt = `Create a Studio Ghibli-style preview image showing a British celebration scene with the Union Jack flag (red, white, blue), traditional British elements like Big Ben clock tower, red double-decker bus, black taxi cab, British tea service with scones and jam, fish and chips, and London landmarks in the background. Use the characteristic Ghibli color palette with soft pastels, muted greens, and gentle watercolor-like textures.`

// Pour ghibli-germany
const prompt = `Create a Studio Ghibli-style preview image showing a German Oktoberfest celebration scene with the German flag (black, red, yellow horizontal stripes), traditional German elements like beer steins with foam, pretzels, bratwurst sausages, sauerkraut, German beer hall with wooden tables, lederhosen and dirndl clothing elements, and Bavarian architecture in the background. Use the characteristic Ghibli color palette with soft pastels, warm earth tones, and gentle watercolor-like textures.`

// Pour ghibli-france
const prompt = `Create a Studio Ghibli-style preview image showing a French celebration scene with the French flag (blue, white, red vertical stripes), traditional French elements like croissants, baguettes, French wine, cheese platter, the Eiffel Tower, French café with outdoor seating, and Parisian architecture in the background. Use the characteristic Ghibli color palette with soft pastels, warm earth tones, and gentle watercolor-like textures.`

// Pour ghibli-conflans
const prompt = `Create a Studio Ghibli-style preview image showing a Conflans Sainte Honorine celebration scene with the French flag (blue, white, red vertical stripes), traditional French elements like the historic church of Saint Honorine, the Seine river with boats, French pastries, local specialties, charming riverside houses, and the peaceful atmosphere of this historic French town in the background. Use the characteristic Ghibli color palette with soft pastels, warm earth tones, and gentle watercolor-like textures.`
```

### **Option 3 : Utiliser DALL-E ou Midjourney**
1. Copier les prompts ci-dessus
2. Les adapter pour DALL-E/Midjourney
3. Générer les images
4. Les redimensionner en 200x200px
5. Les sauvegarder dans `/public/previews/`

## 📐 **Spécifications des Images**

- **Format** : JPG ou PNG
- **Taille** : 200x200px (carré)
- **Qualité** : Haute résolution
- **Style** : Cohérent avec l'esthétique Studio Ghibli
- **Contenu** : Représentation du fond sans personnage

## 🚀 **Test Immédiat**

Votre application fonctionne déjà avec les images temporaires ! Vous pouvez :

1. **Tester maintenant** :
   ```bash
   bun run dev
   ```

2. **Aller sur** : `http://localhost:3000/session`

3. **Sélectionner** un fond Studio Ghibli (🎨)

4. **Prendre une photo** et voir le résultat

## ✨ **Résultat Attendu**

Les photos traitées auront le style Studio Ghibli authentique :
- **Personnages** : Grands yeux, traits simplifiés
- **Palette** : Pastels doux, tons terreux
- **Texture** : Aquarelle, peinture à la main
- **Atmosphère** : Magique et familiale

---

**🎉 Votre photobooth Studio Ghibli est prêt à fonctionner !**
