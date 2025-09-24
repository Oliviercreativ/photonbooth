// scripts/ensure-tsconfig.js
import fs from 'fs'
import path from 'path'

const nuxtDir = '.nuxt'
const requiredFiles = ['tsconfig.json', 'tsconfig.server.json']

// Créer le dossier .nuxt s'il n'existe pas
if (!fs.existsSync(nuxtDir)) {
  fs.mkdirSync(nuxtDir, {recursive: true})
  console.log('✅ Dossier .nuxt créé')
}

// Créer les fichiers TypeScript manquants
requiredFiles.forEach((fileName) => {
  const filePath = path.join(nuxtDir, fileName)

  if (!fs.existsSync(filePath)) {
    let content = ''

    if (fileName === 'tsconfig.json') {
      content = JSON.stringify(
        {
          compilerOptions: {
            target: 'ESNext',
            module: 'ESNext',
            moduleResolution: 'Node',
            strict: false,
            jsx: 'preserve',
            esModuleInterop: true,
            allowSyntheticDefaultImports: true,
            skipLibCheck: true,
            noEmit: true,
            baseUrl: '..',
            paths: {
              '~/*': ['../*'],
              '@/*': ['../*'],
              '~~/*': ['../*'],
              '@@/*': ['../*']
            },
            types: ['node', '@nuxt/types']
          },
          include: ['../**/*.ts', '../**/*.vue', '../**/*.js'],
          exclude: ['../node_modules', '../.output']
        },
        null,
        2
      )
    } else if (fileName === 'tsconfig.server.json') {
      content = JSON.stringify(
        {
          extends: './tsconfig.json',
          compilerOptions: {
            module: 'ESNext',
            types: ['node']
          },
          include: ['../server/**/*.ts']
        },
        null,
        2
      )
    } else if (fileName === 'tsconfig.app.json') {
      content = JSON.stringify(
        {
          extends: './tsconfig.json',
          compilerOptions: {
            lib: ['DOM', 'DOM.Iterable', 'ESNext'],
            types: ['@nuxt/types']
          },
          include: ['../**/*.vue', '../**/*.ts', '../**/*.tsx'],
          exclude: ['../server/**/*']
        },
        null,
        2
      )
    }

    fs.writeFileSync(filePath, content)
    console.log(`✅ ${fileName} créé dans .nuxt/`)
  } else {
    console.log(`✓ ${fileName} existe déjà`)
  }
})

// Créer aussi tsconfig.app.json même s'il n'est pas dans la liste par défaut
const appTsConfigPath = path.join(nuxtDir, 'tsconfig.app.json')
if (!fs.existsSync(appTsConfigPath)) {
  const appTsConfig = {
    extends: './tsconfig.json',
    compilerOptions: {
      lib: ['DOM', 'DOM.Iterable', 'ESNext'],
      types: ['@nuxt/types', '@vue/runtime-core']
    },
    include: [
      '../**/*.vue',
      '../**/*.ts',
      '../**/*.tsx',
      '../components/**/*.vue',
      '../composables/**/*.ts',
      '../pages/**/*.vue'
    ],
    exclude: ['../server/**/*', '../node_modules']
  }

  fs.writeFileSync(appTsConfigPath, JSON.stringify(appTsConfig, null, 2))
  console.log('✅ tsconfig.app.json créé dans .nuxt/')
}

console.log('🎉 Configuration TypeScript initialisée avec succès !')
