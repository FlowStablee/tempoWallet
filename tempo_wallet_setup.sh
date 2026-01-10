#!/bin/bash

# 1. Initialize a new React Native Project
echo "🏗️ Creating Tempo Wallet Project..."
npx react-native@latest init TempoWallet --version 0.72.6 --skip-install --npm
cd TempoWallet

# 2. Install Tempo Dependencies
echo "📦 Installing Viem & Polyfills..."
npm install viem react-native-get-random-values buffer

# 3. Fix Crypto/Buffer issues for React Native
echo "🔧 Configuring Metro & Polyfills..."

cat > shim.js <<EOT
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
global.Buffer = Buffer;
global.process = require('process');
EOT

sed -i '1i import "./shim";' index.js

# 4. App.tsx
echo "💻 Writing Wallet Code..."

cat > App.tsx <<'EOT'
<PASTE YOUR App.tsx CODE HERE EXACTLY>
EOT

# 5. GitHub Action
echo "⚙️ Creating Build Workflow..."

mkdir -p .github/workflows
cat > .github/workflows/apk.yml <<EOT
name: Build Tempo Wallet APK
on:
  push:
    branches:
      - main
jobs:
  build-android:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install npm dependencies
        run: npm install
      - name: Build Android APK
        run: |
          cd android
          ./gradlew assembleRelease
      - name: Upload Artifact
        uses: actions/upload-artifact@v3
        with:
          name: tempo-wallet-apk
          path: android/app/build/outputs/apk/release/app-release.apk
EOT

# 6. Push to GitHub
git add .
git commit -m "Initialize Tempo Wallet"
git push origin main

echo "✅ DONE! Check GitHub Actions to download APK"
