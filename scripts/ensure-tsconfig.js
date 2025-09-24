#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const tsconfigAppPath = path.join(__dirname, '..', '.nuxt', 'tsconfig.app.json');
const tsconfigPath = path.join(__dirname, '..', '.nuxt', 'tsconfig.json');

// Vérifier si le fichier tsconfig.app.json existe
if (!fs.existsSync(tsconfigAppPath)) {
  console.log('Création du fichier tsconfig.app.json manquant...');
  
  const tsconfigAppContent = {
    "extends": "./tsconfig.json",
    "compilerOptions": {
      "target": "ESNext",
      "module": "ESNext",
      "moduleResolution": "Bundler",
      "allowImportingTsExtensions": true,
      "noEmit": true,
      "isolatedModules": true,
      "verbatimModuleSyntax": true,
      "strict": true,
      "skipLibCheck": true,
      "esModuleInterop": true,
      "allowSyntheticDefaultImports": true,
      "forceConsistentCasingInFileNames": true,
      "useDefineForClassFields": true,
      "lib": [
        "ESNext",
        "DOM",
        "DOM.Iterable"
      ],
      "types": [
        "vite/client"
      ]
    },
    "include": [
      "../**/*",
      "./nuxt.d.ts",
      "./imports.d.ts",
      "./components.d.ts"
    ],
    "exclude": [
      "../dist",
      "../.data",
      "../.output",
      "../node_modules"
    ]
  };
  
  // S'assurer que le dossier .nuxt existe
  const nuxtDir = path.dirname(tsconfigAppPath);
  if (!fs.existsSync(nuxtDir)) {
    fs.mkdirSync(nuxtDir, { recursive: true });
  }
  
  fs.writeFileSync(tsconfigAppPath, JSON.stringify(tsconfigAppContent, null, 2));
  console.log('✅ tsconfig.app.json créé avec succès');
} else {
  console.log('✅ tsconfig.app.json existe déjà');
}
