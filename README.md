# 💪 FitPro - Treino Personalizado

PWA (Progressive Web App) de treino de musculação com vídeos demonstrativos, timer de descanso e acompanhamento de progresso.

## 🚀 Como rodar localmente

```bash
# Instalar dependências
npm install

# Iniciar servidor local
npm start
```

Acesse: **http://localhost:3000**

> ⚠️ Não abra o index.html diretamente pelo navegador — o Service Worker exige HTTP/HTTPS.

## 📤 Como subir para o GitHub

```bash
git init
git add .
git commit -m "FitPro v1.0 - PWA de treino"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/fitpro.git
git push -u origin main
```

## 🌐 Deploy gratuito no Netlify

1. Acesse [netlify.com](https://netlify.com) e faça login
2. Clique em **"Add new site" → "Import an existing project"**
3. Conecte seu repositório GitHub
4. Configurações de build: deixe em branco (site estático)
5. Clique em **Deploy**

Seu app ficará disponível em: `https://seu-app.netlify.app`

## 📱 Funcionalidades

- 5 treinos: A (Peito/Ombros/Tríceps), B (Pernas), C (Costas/Bíceps), D (Pernas/Glúteos), E (Fullbody)
- Vídeos demonstrativos do YouTube
- Timer de descanso com alarme
- Marcação de exercícios concluídos
- Backup e restauração de progresso
- Instalável como app no celular (PWA)
- Funciona offline

## 🗂️ Estrutura

```
fitpro/
├── index.html       # Interface principal
├── app.js           # Lógica do aplicativo
├── sw.js            # Service Worker (cache offline)
├── manifest.json    # Configuração PWA
├── package.json     # Servidor local
├── .gitignore
└── icons/
    ├── icon-192x192.png
    └── icon-512x512.png
```
