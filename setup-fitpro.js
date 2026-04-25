const fs = require('fs');
const path = require('path');
const https = require('https');

// MOSTRA ONDE ESTAMOS
console.log('📍 Diretório atual:', process.cwd());
console.log('');

const colors = {
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    reset: '\x1b[0m'
};

console.log(`${colors.cyan}
╔══════════════════════════════════════╗
║     FITPRO PWA - SETUP AUTOMÁTICO    ║
╚══════════════════════════════════════╝
${colors.reset}`);

// CRIA NA PASTA ATUAL
const projectName = 'fitpro';
const baseDir = path.join(process.cwd(), projectName);

console.log(`${colors.yellow}Criando projeto em:${colors.reset}`, baseDir);

// Criar pasta fitpro
if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
    console.log(`${colors.green}✓${colors.reset} Pasta fitpro/ criada`);
} else {
    console.log(`${colors.yellow}!${colors.reset} Pasta já existe, continuando...`);
}

const iconsDir = path.join(baseDir, 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
    console.log(`${colors.green}✓${colors.reset} Pasta icons/ criada`);
}

// CONTEÚDO DOS ARQUIVOS
const files = {
    'manifest.json': `{
    "name": "FitPro - Treino Personalizado",
    "short_name": "FitPro",
    "description": "Aplicativo de treino de musculação com vídeos demonstrativos",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#0a0a0a",
    "theme_color": "#0a0a0a",
    "orientation": "portrait",
    "icons": [
        {
            "src": "/icons/icon-192x192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any maskable"
        },
        {
            "src": "/icons/icon-512x512.png",
            "sizes": "512x512",
            "type": "image/png",
            "purpose": "any maskable"
        }
    ]
}`,

    'sw.js': `const CACHE_NAME = 'fitpro-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request)
                    .catch(() => caches.match('/index.html'));
            })
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});`,

    'index.html': `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#0a0a0a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="FitPro">
    <title>FitPro - Treino Personalizado</title>
    <link rel="manifest" href="/manifest.json">
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&family=Orbitron:wght@400;700;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        *{font-family:'Inter',sans-serif;-webkit-tap-highlight-color:transparent;touch-action:manipulation}
        .font-display{font-family:'Orbitron',sans-serif}
        html{height:100%;overflow:hidden}
        body{background:linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 50%,#16213e 100%);height:100%;overflow:hidden;color:white;position:fixed;width:100%;top:0;left:0}
        .app-container{height:100%;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;padding-bottom:100px}
        .glass-effect{background:rgba(255,255,255,0.03);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.08)}
        .exercise-card{transition:all 0.3s ease;border-left:3px solid transparent}
        .exercise-card:hover{transform:translateX(5px);border-left-color:#06b6d4;background:rgba(255,255,255,0.05)}
        .workout-tab{transition:all 0.3s ease;position:relative;overflow:hidden}
        .workout-tab.active{background:linear-gradient(135deg,#0891b2 0%,#0e7490 100%);color:white;box-shadow:0 0 20px rgba(6,182,212,0.4)}
        .check-btn{transition:all 0.3s ease}
        .check-btn.completed{background:linear-gradient(135deg,#10b981,#059669);transform:scale(1.1)}
        .modal{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.95);z-index:1000;overflow-y:auto;-webkit-overflow-scrolling:touch}
        .modal.active{display:flex;animation:fadeIn 0.3s ease}
        @keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}
        .muscle-tag{background:rgba(6,182,212,0.15);border:1px solid rgba(6,182,212,0.3);color:#22d3ee}
        .floating-nav{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:100;background:rgba(15,23,42,0.95);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.1);box-shadow:0 10px 40px rgba(0,0,0,0.5)}
        .stat-card{background:linear-gradient(135deg,rgba(6,182,212,0.1) 0%,rgba(139,92,246,0.1) 100%);border:1px solid rgba(255,255,255,0.08)}
        .hero-bg{background-image:linear-gradient(to bottom,rgba(0,0,0,0.3),rgba(10,10,10,1)),url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200');background-size:cover;background-position:center}
        .install-banner{position:fixed;top:0;left:0;right:0;background:linear-gradient(135deg,#0891b2,#0e7490);color:white;padding:12px 16px;z-index:1001;display:none;align-items:center;justify-content:space-between}
        .offline-indicator{position:fixed;top:0;left:0;right:0;background:#ef4444;color:white;text-align:center;padding:8px;z-index:1002;display:none;font-size:14px}
        button,.workout-tab,.exercise-card{-webkit-user-select:none;user-select:none}
        .scroll-hidden::-webkit-scrollbar{display:none}
    </style>
</head>
<body>
    <div id="offline-indicator" class="offline-indicator"><i class="fas fa-wifi-slash mr-2"></i>Você está offline</div>
    <div id="install-banner" class="install-banner">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center"><i class="fas fa-dumbbell text-xl"></i></div>
            <div><p class="font-bold text-sm">Instalar FitPro</p><p class="text-xs opacity-90">Adicione à tela inicial</p></div>
        </div>
        <div class="flex gap-2">
            <button onclick="dismissInstall()" class="px-3 py-1.5 text-sm bg-white/20 rounded-lg">Depois</button>
            <button onclick="installPWA()" class="px-3 py-1.5 text-sm bg-white text-cyan-700 font-bold rounded-lg">Instalar</button>
        </div>
    </div>

    <div class="app-container" id="app-container">
        <header class="glass-effect sticky top-0 z-50 px-6 py-4 border-b border-white/5">
            <div class="max-w-7xl mx-auto flex justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30"><i class="fas fa-dumbbell text-white text-xl"></i></div>
                    <div><h1 class="text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">FitPro</h1><p class="text-xs text-gray-400 tracking-wider">SEU TREINO PERSONALIZADO</p></div>
                </div>
                <button onclick="toggleProfile()" class="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30"><i class="fas fa-user"></i></button>
            </div>
        </header>

        <div class="hero-bg h-48 flex items-end pb-6 px-6">
            <div class="max-w-7xl mx-auto w-full">
                <div class="flex justify-between items-end">
                    <div><p class="text-cyan-400 text-sm font-semibold mb-1 tracking-wider">PLANO ATUAL</p><h2 class="text-3xl font-display font-bold text-white">TREINO ABC + DE</h2><p class="text-gray-300 text-sm mt-1">5 dias de treino • Hipertrofia</p></div>
                    <div class="text-right"><div class="text-4xl font-display font-bold text-cyan-400" id="progress-percent">0%</div><p class="text-xs text-gray-400">concluído hoje</p></div>
                </div>
            </div>
        </div>

        <main class="max-w-7xl mx-auto px-4 py-6 space-y-6">
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="stat-card rounded-2xl p-4"><div class="flex items-center justify-between mb-2"><i class="fas fa-calendar-check text-cyan-400 text-xl"></i><span class="text-xs text-gray-500">Esta semana</span></div><p class="text-2xl font-bold font-display" id="weekly-workouts">0/5</p><p class="text-xs text-gray-400">treinos concluídos</p></div>
                <div class="stat-card rounded-2xl p-4"><div class="flex items-center justify-between mb-2"><i class="fas fa-weight-hanging text-purple-400 text-xl"></i><span class="text-xs text-gray-500">Volume</span></div><p class="text-2xl font-bold font-display" id="total-volume">0</p><p class="text-xs text-gray-400">séries esta semana</p></div>
                <div class="stat-card rounded-2xl p-4"><div class="flex items-center justify-between mb-2"><i class="fas fa-clock text-green-400 text-xl"></i><span class="text-xs text-gray-500">Duração</span></div><p class="text-2xl font-bold font-display">50<span class="text-sm">min</span></p><p class="text-xs text-gray-400">média por treino</p></div>
                <div class="stat-card rounded-2xl p-4"><div class="flex items-center justify-between mb-2"><i class="fas fa-trophy text-yellow-400 text-xl"></i><span class="text-xs text-gray-500">Nível</span></div><p class="text-lg font-bold text-cyan-400">Intermediário</p><p class="text-xs text-gray-400">próximo: Avançado</p></div>
            </div>

            <div class="glass-effect rounded-2xl p-4 overflow-x-auto scroll-hidden"><div class="flex gap-3 min-w-max" id="workout-nav"></div></div>

            <div id="workout-container">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <div class="flex items-center gap-3 mb-1"><span class="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold tracking-wider" id="workout-tag">TREINO A</span><span class="text-gray-400 text-sm" id="workout-date">Segunda-feira</span></div>
                        <h2 class="text-3xl font-display font-bold text-white mb-1" id="workout-title">PEITO • OMBROS • TRÍCEPS</h2>
                        <p class="text-gray-400 text-sm" id="workout-subtitle">8 exercícios • 32 séries totais</p>
                    </div>
                    <div class="flex gap-3">
                        <button onclick="startWorkoutTimer()" class="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl font-semibold hover:shadow-lg hover:shadow-cyan-500/30 hover:scale-105 transition-all flex items-center gap-2 group active:scale-95"><i class="fas fa-play group-hover:animate-pulse"></i>Iniciar Treino</button>
                        <button onclick="showRestTimer()" class="px-4 py-3 glass-effect rounded-xl hover:bg-white/10 transition-all border border-white/10 active:scale-95"><i class="fas fa-stopwatch text-cyan-400"></i></button>
                    </div>
                </div>
                <div id="exercises-list" class="space-y-3"></div>
            </div>

            <div class="glass-effect rounded-2xl p-6">
                <h3 class="text-xl font-bold mb-4 flex items-center gap-2"><i class="fas fa-calendar-alt text-cyan-400"></i>Cronograma Semanal</h3>
                <div class="grid grid-cols-7 gap-2 text-center text-sm">
                    <div class="p-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30"><div class="font-bold text-cyan-400">SEG</div><div class="text-xs text-gray-400 mt-1">Treino A</div></div>
                    <div class="p-3 rounded-xl bg-orange-500/20 border border-orange-500/30"><div class="font-bold text-orange-400">TER</div><div class="text-xs text-gray-400 mt-1">Treino B</div></div>
                    <div class="p-3 rounded-xl bg-green-500/20 border border-green-500/30"><div class="font-bold text-green-400">QUA</div><div class="text-xs text-gray-400 mt-1">Treino C</div></div>
                    <div class="p-3 rounded-xl bg-gray-800 border border-gray-700"><div class="font-bold text-gray-400">QUI</div><div class="text-xs text-gray-500 mt-1">Descanso</div></div>
                    <div class="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30"><div class="font-bold text-purple-400">SEX</div><div class="text-xs text-gray-400 mt-1">Treino D</div></div>
                    <div class="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30"><div class="font-bold text-pink-400">SÁB</div><div class="text-xs text-gray-400 mt-1">Treino E</div></div>
                    <div class="p-3 rounded-xl bg-gray-800 border border-gray-700"><div class="font-bold text-gray-400">DOM</div><div class="text-xs text-gray-500 mt-1">Descanso</div></div>
                </div>
            </div>

            <div class="glass-effect rounded-2xl p-6">
                <h3 class="text-xl font-bold mb-4 flex items-center gap-2"><i class="fas fa-database text-cyan-400"></i>Backup de Dados</h3>
                <div class="flex gap-3">
                    <button onclick="exportData()" class="flex-1 py-3 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-xl font-medium transition-colors border border-cyan-500/20"><i class="fas fa-download mr-2"></i>Exportar Backup</button>
                    <button onclick="importData()" class="flex-1 py-3 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 rounded-xl font-medium transition-colors border border-purple-500/20"><i class="fas fa-upload mr-2"></i>Importar Backup</button>
                </div>
                <input type="file" id="import-file" accept=".json" class="hidden" onchange="handleFileImport(event)">
            </div>
        </main>
    </div>

    <div id="exercise-modal" class="modal items-center justify-center p-4">
        <div class="glass-effect rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div class="sticky top-0 bg-gray-900/95 backdrop-blur-xl p-4 border-b border-white/10 flex justify-between items-center z-10">
                <div><h3 class="text-xl font-bold font-display" id="modal-title">Nome do Exercício</h3><p class="text-sm text-gray-400" id="modal-subtitle">Peito • 4x10</p></div>
                <button onclick="closeModal()" class="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"><i class="fas fa-times"></i></button>
            </div>
            <div class="p-6 space-y-6">
                <div class="video-container aspect-video bg-gray-800 rounded-xl overflow-hidden relative group"><iframe id="exercise-video" class="w-full h-full" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
                <div class="grid grid-cols-3 gap-4">
                    <div class="glass-effect p-4 rounded-xl text-center border border-white/5"><i class="fas fa-dumbbell text-cyan-400 text-2xl mb-2"></i><p class="text-xs text-gray-400">Equipamento</p><p class="font-semibold text-sm" id="modal-equipment">Barra</p></div>
                    <div class="glass-effect p-4 rounded-xl text-center border border-white/5"><i class="fas fa-signal text-purple-400 text-2xl mb-2"></i><p class="text-xs text-gray-400">Dificuldade</p><p class="font-semibold text-sm" id="modal-difficulty">Intermediário</p></div>
                    <div class="glass-effect p-4 rounded-xl text-center border border-white/5"><i class="fas fa-bullseye text-green-400 text-2xl mb-2"></i><p class="text-xs text-gray-400">Foco Principal</p><p class="font-semibold text-sm" id="modal-target">Peitoral</p></div>
                </div>
                <div class="space-y-4"><h4 class="font-bold text-lg flex items-center gap-2 text-cyan-400"><i class="fas fa-list-ol"></i>Execução Correta</h4><ol class="space-y-3 text-gray-300" id="modal-instructions"></ol></div>
                <div class="glass-effect p-4 rounded-xl border-l-4 border-yellow-500 bg-yellow-500/5"><h4 class="font-bold mb-2 flex items-center gap-2 text-yellow-400"><i class="fas fa-lightbulb"></i>Dica do Professor</h4><p class="text-gray-300 text-sm leading-relaxed" id="modal-tips"></p></div>
                <div class="glass-effect p-4 rounded-xl border border-white/5"><h4 class="font-bold mb-4 flex items-center gap-2"><i class="fas fa-clipboard-list text-cyan-400"></i>Registro de Séries</h4><div class="space-y-3" id="modal-sets"></div></div>
            </div>
        </div>
    </div>

    <div id="timer-modal" class="modal items-center justify-center p-4">
        <div class="glass-effect rounded-2xl max-w-md w-full p-8 text-center border border-cyan-500/30">
            <h3 class="text-2xl font-bold mb-6 font-display">TIMER DE DESCANSO</h3>
            <div class="relative w-48 h-48 mx-auto mb-6">
                <svg class="w-full h-full transform -rotate-90"><circle cx="96" cy="96" r="88" stroke="rgba(255,255,255,0.1)" stroke-width="8" fill="none"/><circle id="timer-circle" cx="96" cy="96" r="88" stroke="#06b6d4" stroke-width="8" fill="none" stroke-dasharray="553" stroke-dashoffset="0" stroke-linecap="round"/></svg>
                <div class="absolute inset-0 flex items-center justify-center"><span class="text-5xl font-display font-bold timer-display" id="timer-display">60</span></div>
            </div>
            <div class="flex gap-3 justify-center">
                <button onclick="setTimer(30)" class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">30s</button>
                <button onclick="setTimer(60)" class="px-4 py-2 rounded-lg bg-cyan-500/20 text-cyan-400 text-sm border border-cyan-500/30">60s</button>
                <button onclick="setTimer(90)" class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">90s</button>
                <button onclick="setTimer(120)" class="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm">2min</button>
            </div>
            <div class="flex gap-4 mt-6 justify-center">
                <button onclick="toggleTimer()" id="timer-toggle" class="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-2xl hover:scale-110 transition-transform shadow-lg shadow-cyan-500/30"><i class="fas fa-play"></i></button>
                <button onclick="resetTimer()" class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl hover:bg-white/20 transition-colors"><i class="fas fa-redo"></i></button>
                <button onclick="closeTimer()" class="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-xl hover:bg-white/20 transition-colors"><i class="fas fa-times"></i></button>
            </div>
        </div>
    </div>

    <nav class="floating-nav rounded-full px-6 py-3 flex gap-6 shadow-2xl shadow-black/50">
        <button onclick="showSection('home')" class="flex flex-col items-center gap-1 text-cyan-400 hover:scale-110 transition-transform"><i class="fas fa-home text-xl"></i><span class="text-[10px] font-medium">Início</span></button>
        <button onclick="showSection('progress')" class="flex flex-col items-center gap-1 text-gray-400 hover:text-white hover:scale-110 transition-transform"><i class="fas fa-chart-line text-xl"></i><span class="text-[10px] font-medium">Progresso</span></button>
        <button onclick="showRestTimer()" class="flex flex-col items-center gap-1 text-gray-400 hover:text-white hover:scale-110 transition-transform"><i class="fas fa-stopwatch text-xl"></i><span class="text-[10px] font-medium">Timer</span></button>
        <button onclick="showSection('settings')" class="flex flex-col items-center gap-1 text-gray-400 hover:text-white hover:scale-110 transition-transform"><i class="fas fa-cog text-xl"></i><span class="text-[10px] font-medium">Ajustes</span></button>
    </nav>

    <script src="/app.js"></script>
</body>
</html>`,

    'app.js': `if('serviceWorker'in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').then(r=>console.log('SW ok')).catch(e=>console.log('SW erro',e))})}const isStandalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;let deferredPrompt;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredPrompt=e;if(!isStandalone)setTimeout(()=>document.getElementById('install-banner').style.display='flex',2e3)});function installPWA(){if(deferredPrompt){deferredPrompt.prompt();deferredPrompt.userChoice.then(c=>{if(c.outcome==='accepted')console.log('Instalado');deferredPrompt=null;document.getElementById('install-banner').style.display='none'})}}function dismissInstall(){document.getElementById('install-banner').style.display='none';localStorage.setItem('installDismissed',Date.now().toString())}const dismissed=localStorage.getItem('installDismissed');if(dismissed&&(Date.now()-parseInt(dismissed))<7*24*60*60*1000)document.getElementById('install-banner').style.display='none';function updateOnlineStatus(){document.getElementById('offline-indicator').style.display=navigator.onLine?'none':'block'}window.addEventListener('online',updateOnlineStatus);window.addEventListener('offline',updateOnlineStatus);function requestNotificationPermission(){if('Notification'in window&&Notification.permission==='default')Notification.requestPermission()}function sendNotification(t,b){if('Notification'in window&&Notification.permission==='granted')new Notification(t,{body:b,icon:'/icons/icon-192x192.png'})}

const workoutPlans={A:{name:'TREINO A',color:'cyan',muscles:'PEITO • OMBROS • TRÍCEPS',day:'Segunda-feira',exercises:[{name:'Supino Reto Barra',sets:4,reps:10,video:'https://www.youtube.com/embed/WwXS2TeFmeg',equipment:'Barra e Banco',difficulty:'Intermediário',target:'Peitoral Maior',tips:'Mantenha a escápula retraída e os cotovelos em ~75°.',instructions:['Deite-se no banco reto, pés firmes no chão','Segure a barra com pegada na largura dos ombros','Retire a barra do suporte com braços estendidos','Desça controladamente até o meio do peito','Empurre para cima contraindo o peitoral']},{name:'Crucifixo Inclinado Halter',sets:4,reps:10,video:'https://www.youtube.com/embed/ajd71waivyg',equipment:'Halteres e Banco Inclinado',difficulty:'Intermediário',target:'Peitoral Superior',tips:'Mantenha leve flexão nos cotovelos durante todo o movimento.',instructions:['Ajuste o banco em 30-45° de inclinação','Segure um halter em cada mão sobre o peito','Abra os braços em arco até sentir alongamento','Feche os braços contraindo o peitoral','Mantenha os cotovelos sempre levemente flexionados']},{name:'Desenvolvimento c/ Halter',sets:4,reps:10,video:'https://www.youtube.com/embed/0JfYxMRsUCQ',equipment:'Halteres',difficulty:'Intermediário',target:'Deltoides',tips:'Não arqueie as costas excessivamente.',instructions:['Sente-se com os halteres na altura dos ombros','Palmas voltadas para frente','Empurre os pesos para cima até estender os braços','Desça controladamente até a altura dos ombros','Mantenha o core estável durante todo o movimento']},{name:'Elevação Lateral',sets:4,reps:12,video:'https://www.youtube.com/embed/3VcKaXpzqRo',equipment:'Halteres',difficulty:'Iniciante',target:'Deltóide Lateral',tips:'Não eleve acima da linha dos ombros.',instructions:['Em pé, halteres ao lado do corpo','Leve inclinação para frente do tronco','Eleve os braços lateralmente até a altura dos ombros','Mantenha leve flexão nos cotovelos','Desça controladamente sem soltar o peso']},{name:'Elevação Frontal',sets:4,reps:10,video:'https://www.youtube.com/embed/-t7fuZ0KhDA',equipment:'Halteres',difficulty:'Iniciante',target:'Deltóide Anterior',tips:'Evite balançar o corpo.',instructions:['Em pé, segure os halteres à frente das coxas','Mantenha os cotovelos levemente flexionados','Eleve um braço de cada vez à frente do corpo','Levante até a altura dos ombros','Desça controladamente alternando os braços']},{name:'Tríceps Francês com Corda',sets:4,reps:12,video:'https://www.youtube.com/embed/kiuVA1lKdiU',equipment:'Polia Alta + Corda',difficulty:'Intermediário',target:'Tríceps',tips:'Mantenha os cotovelos fixos ao lado do corpo.',instructions:['Prenda a corda na polia alta','Segure uma extremidade em cada mão','Cotovelos fixos ao lado do corpo','Empurre para baixo estendendo os braços','Separe as mãos no final do movimento']},{name:'Tríceps Pulley',sets:4,reps:10,video:'https://www.youtube.com/embed/2-LAMcpMYDQ',equipment:'Polia Alta',difficulty:'Iniciante',target:'Tríceps',tips:'Mantenha os cotovelos colados ao corpo.',instructions:['Segure a barra da polia com pegada pronada','Cotovelos fixos ao lado do corpo','Empurre a barra para baixo até estender os braços','Contraia o tríceps no final','Volte controladamente sem soltar o peso']},{name:'Abdominal Reto',sets:4,reps:12,video:'https://www.youtube.com/embed/MKmrqcoCZdc',equipment:'Peso Corporal',difficulty:'Iniciante',target:'Reto do Abdômen',tips:'Não puxe a cabeça com as mãos.',instructions:['Deite-se com joelhos flexionados e pés no chão','Mãos cruzadas sobre o peito ou atrás da cabeça','Contraia o abdômen elevando os ombros do chão','Mantenha a parte baixa das costas no chão','Desça controladamente sem relaxar completamente']}]},B:{name:'TREINO B',color:'orange',muscles:'PERNAS • POSTERIOR',day:'Terça-feira',exercises:[{name:'Agachamento Livre/Smith',sets:4,reps:12,video:'https://www.youtube.com/embed/ultWZbUMPL8',equipment:'Barra ou Smith',difficulty:'Intermediário',target:'Quadríceps e Glúteos',tips:'Mantenha os joelhos alinhados com os pés.',instructions:['Posicione a barra sobre os trapézios','Pés na largura dos ombros','Desça flexionando joelhos e quadris','Mantenha o peito erguido e costas retas','Empurre o chão para subir']},{name:'Afundo com Halter',sets:4,reps:8,video:'https://www.youtube.com/embed/L8fvyBHUPew',equipment:'Halteres',difficulty:'Intermediário',target:'Quadríceps e Glúteos',tips:'O joelho de trás quase toca o chão.',instructions:['Segure um halter em cada mão','Dê um passo à frente com uma perna','Desça até que o joelho de trás quase toque o chão','Empurre com o calcanhar da frente para voltar','Alterne as pernas a cada repetição']},{name:'Banco Extensor',sets:4,reps:10,video:'https://www.youtube.com/embed/YyvSfVjQeL0',equipment:'Máquina Extensora',difficulty:'Iniciante',target:'Quadríceps',tips:'Não estenda completamente as pernas no topo.',instructions:['Sente-se ajustando o rolo sobre os tornozelos','Costas firmemente apoiadas','Estenda as pernas contraindo os quadríceps','Segure a contração por 1 segundo','Desça controladamente']},{name:'Banco Flexor',sets:4,reps:10,video:'https://www.youtube.com/embed/1Tq3QdYUuHs',equipment:'Máquina Flexora',difficulty:'Iniciante',target:'Isquiotibiais',tips:'Não levante os quadris do banco.',instructions:['Deite-se de bruços na máquina','Calcanhares atrás do rolo','Flexione os joelhos puxando o rolo para cima','Contraia os isquiotibiais no topo','Desça controladamente']},{name:'Banco Adutor',sets:4,reps:12,video:'https://www.youtube.com/embed/H3DHCz5CbD0',equipment:'Máquina Adutora',difficulty:'Iniciante',target:'Adutores',tips:'Controle o movimento na fase excêntrica.',instructions:['Sente-se na máquina com as pernas nas almofadas','Ajuste a amplitude conforme sua mobilidade','Feche as pernas contra a resistência','Contraia os adutores no final','Abra controladamente sentindo o alongamento']},{name:'Banco Abdutor',sets:4,reps:10,video:'https://www.youtube.com/embed/G_8LItOiZ0Q',equipment:'Máquina Abdutora',difficulty:'Iniciante',target:'Glúteo Médio',tips:'Mantenha o tronco ereto.',instructions:['Sente-se com as pernas juntas nas almofadas','Segure as alças laterais','Abra as pernas contra a resistência','Contraia o glúteo no final do movimento','Feche controladamente']},{name:'Panturrilha em Pé',sets:4,reps:15,video:'https://www.youtube.com/embed/gwLzBJYoWlI',equipment:'Máquina ou Step',difficulty:'Iniciante',target:'Gastrocnêmio',tips:'Use amplitude completa.',instructions:['Posicione as pontas dos pés na plataforma','Calcanhares para fora da plataforma','Eleve os calcanhares ao máximo possível','Segure 2 segundos no topo','Desça até o alongamento completo']}]},C:{name:'TREINO C',color:'green',muscles:'COSTAS • BÍCEPS',day:'Quarta-feira',exercises:[{name:'Puxada Alta Aberta',sets:4,reps:10,video:'https://www.youtube.com/embed/mPmfwbc_svw',equipment:'Polia Alta',difficulty:'Iniciante',target:'Dorsais',tips:'Não leve os cotovelos para trás.',instructions:['Sente-se na máquina com as coxas presas','Segure a barra com pegada ampla','Puxe a barra até a parte superior do peito','Contraia os dorsais no fundo','Volte controladamente sentindo o alongamento']},{name:'Puxada Fechada Supinada',sets:4,reps:10,video:'https://www.youtube.com/embed/8yv7T2aDzPo',equipment:'Polia Alta',difficulty:'Iniciante',target:'Dorsais e Bíceps',tips:'A pegada supinada ativa mais os bíceps.',instructions:['Segure a barra com pegada fechada e supinada','Sente-se com as coxas presas','Puxe a barra em direção ao esterno','Contraia as costas no final','Desça estendendo os braços completamente']},{name:'Remada Curvada',sets:4,reps:10,video:'https://www.youtube.com/embed/FWJR5Ve8bnQ',equipment:'Barra',difficulty:'Intermediário',target:'Dorsais e Romboides',tips:'Mantenha as costas retas e paralelas ao chão.',instructions:['Segure a barra com pegada pronada','Incline o tronco a ~45°','Puxe a barra em direção ao abdômen','Contraia as escápulas no topo','Desça controladamente']},{name:'Remada Baixa Supinada',sets:4,reps:12,video:'https://www.youtube.com/embed/nlrXZW7pw94',equipment:'Polia Baixa',difficulty:'Intermediário',target:'Latíssimo do Dorso',tips:'A pegada supinada permite maior amplitude.',instructions:['Sente-se na polia baixa com os pés apoiados','Segure a barra com pegada supinada','Puxe a barra em direção ao abdômen inferior','Contraia os dorsais no final','Estenda os braços sentindo o alongamento']},{name:'Encolhimento com Barra',sets:4,reps:10,video:'https://www.youtube.com/embed/8lP7JvA0i3c',equipment:'Barra',difficulty:'Iniciante',target:'Trapézio',tips:'Não role os ombros para trás.',instructions:['Segure a barra à frente das coxas','Mantenha os braços estendidos','Eleve os ombros em direção às orelhas','Segure a contração por 1 segundo','Desça controladamente']},{name:'Rosca Alternada',sets:4,reps:12,video:'https://www.youtube.com/embed/sAq_ocpRh_I',equipment:'Halteres',difficulty:'Iniciante',target:'Bíceps Braquial',tips:'Não balançe o corpo.',instructions:['Em pé, segure um halter em cada mão','Palmas voltadas para frente','Flexione um cotovelo de cada vez','Gire o punho no topo (supinação)','Desça controladamente alternando os braços']},{name:'Rosca Martelo',sets:4,reps:10,video:'https://www.youtube.com/embed/zC3nLlEvin4',equipment:'Halteres',difficulty:'Iniciante',target:'Braquial e Bíceps',tips:'A pegada neutra trabalha mais o braquial.',instructions:['Segure os halteres com pegada neutra','Cotovelos fixos ao lado do corpo','Flexione os cotovelos alternadamente','Contraia o bíceps no topo','Desça controladamente']},{name:'Abdominal Reto',sets:4,reps:12,video:'https://www.youtube.com/embed/MKmrqcoCZdc',equipment:'Peso Corporal',difficulty:'Iniciante',target:'Reto do Abdômen',tips:'Exale ao subir.',instructions:['Deite-se com joelhos flexionados','Mãos cruzadas sobre o peito','Eleve os ombros do chão contraindo o abdômen','Mantenha a lombar no chão','Desça sem relaxar completamente']}]},D:{name:'TREINO D',color:'purple',muscles:'PERNAS • GLÚTEOS',day:'Sexta-feira',exercises:[{name:'Agachamento Sumo no Smith',sets:4,reps:12,video:'https://www.youtube.com/embed/6gTu6aSa-lQ',equipment:'Máquina Smith',difficulty:'Intermediário',target:'Quadríceps e Adutores',tips:'A pegada ampla com os pés voltados para fora ativa mais os adutores.',instructions:['Posicione-se na máquina Smith com pegada sumô','Pés bem afastados e voltados para fora','Desça até as coxas ficarem paralelas','Mantenha o tronco ereto','Empurre o chão para subir']},{name:'Stiff',sets:4,reps:8,video:'https://www.youtube.com/embed/1uLrM7gzQao',equipment:'Barra ou Halteres',difficulty:'Intermediário',target:'Isquiotibiais e Glúteos',tips:'Mantenha leve flexão nos joelhos.',instructions:['Segure a barra com pegada pronada','Mantenha leve flexão nos joelhos','Empurre os quadris para trás inclinando o tronco','Desça até sentir alongamento nos isquiotibiais','Volte empurrando os quadris para frente']},{name:'Banco Extensor Unilateral',sets:4,reps:10,video:'https://www.youtube.com/embed/YyvSfVjQeL0',equipment:'Máquina Extensora',difficulty:'Intermediário',target:'Quadríceps',tips:'Trabalhe uma perna de cada vez.',instructions:['Sente-se na máquina extensora','Trabalhe uma perna de cada vez','Estenda a perna contraindo o quadríceps','Segure a contração no topo','Alterne as pernas a cada série']},{name:'Banco Flexor',sets:4,reps:10,video:'https://www.youtube.com/embed/1Tq3QdYUuHs',equipment:'Máquina Flexora',difficulty:'Iniciante',target:'Isquiotibiais',tips:'Ajuste bem o rolo acima dos calcanhares.',instructions:['Deite-se de bruços na máquina','Ajuste o rolo acima dos calcanhares','Flexione os joelhos puxando o rolo','Contraia os isquiotibiais','Desça controladamente']},{name:'Banco Adutor',sets:4,reps:12,video:'https://www.youtube.com/embed/H3DHCz5CbD0',equipment:'Máquina Adutora',difficulty:'Iniciante',target:'Adutores',tips:'Controle a fase excêntrica.',instructions:['Sente-se na máquina com as pernas nas almofadas','Ajuste a amplitude do movimento','Feche as pernas contra a resistência','Contraia os adutores no final','Abra controladamente']},{name:'Banco Abdutor',sets:4,reps:10,video:'https://www.youtube.com/embed/G_8LItOiZ0Q',equipment:'Máquina Abdutora',difficulty:'Iniciante',target:'Glúteo Médio',tips:'Mantenha o tronco ereto.',instructions:['Sente-se com as pernas juntas','Segure as alças laterais','Abra as pernas contra a resistência','Contraia o glúteo no topo','Feche controladamente']},{name:'Panturrilha em Pé',sets:4,reps:15,video:'https://www.youtube.com/embed/gwLzBJYoWlI',equipment:'Máquina ou Step',difficulty:'Iniciante',target:'Gastrocnêmio',tips:'Use amplitude completa.',instructions:['Posicione as pontas dos pés na plataforma','Calcanhares para fora','Eleve os calcanhares ao máximo','Segure 2 segundos no topo','Desça até o alongamento completo']}]},E:{name:'TREINO E',color:'pink',muscles:'COSTAS • PEITO • BRAÇOS',day:'Sábado',exercises:[{name:'Puxada Alta Aberta',sets:4,reps:10,video:'https://www.youtube.com/embed/mPmfwbc_svw',equipment:'Polia Alta',difficulty:'Iniciante',target:'Dorsais',tips:'Abra o peito e puxe com os cotovelos.',instructions:['Sente-se na máquina com as coxas presas','Segure a barra com pegada ampla','Puxe até a parte superior do peito','Contraia os dorsais','Volte controladamente']},{name:'Remada Baixa Supinada',sets:4,reps:10,video:'https://www.youtube.com/embed/nlrXZW7pw94',equipment:'Polia Baixa',difficulty:'Intermediário',target:'Latíssimo do Dorso',tips:'A pegada supinada permite maior carga.',instructions:['Sente-se na polia baixa','Segure a barra com pegada supinada','Puxe em direção ao abdômen','Contraia as costas no final','Estenda os braços controladamente']},{name:'Supino Inclinado com Halter',sets:4,reps:10,video:'https://www.youtube.com/embed/ajd71waivyg',equipment:'Halteres e Banco Inclinado',difficulty:'Intermediário',target:'Peitoral Superior',tips:'Incline o banco em 30-45°.',instructions:['Ajuste o banco em 30-45°','Segure os halteres na altura do peito','Empurre para cima até quase tocarem','Desça controladamente','Mantenha os cotovelos em ~75°']},{name:'Elevação Lateral',sets:4,reps:12,video:'https://www.youtube.com/embed/3VcKaXpzqRo',equipment:'Halteres',difficulty:'Iniciante',target:'Deltóide Lateral',tips:'Use pesos moderados.',instructions:['Em pé, halteres ao lado do corpo','Leve inclinação para frente','Eleve os braços lateralmente','Mantenha leve flexão nos cotovelos','Desça controladamente']},{name:'Elevação Frontal',sets:4,reps:10,video:'https://www.youtube.com/embed/-t7fuZ0KhDA',equipment:'Halteres',difficulty:'Iniciante',target:'Deltóide Anterior',tips:'Evite balançar.',instructions:['Segure os halteres à frente das coxas','Eleve um braço de cada vez','Levante até a altura dos ombros','Desça controladamente','Alterne os braços']},{name:'Tríceps Francês',sets:4,reps:12,video:'https://www.youtube.com/embed/kiuVA1lKdiU',equipment:'Polia + Corda',difficulty:'Intermediário',target:'Tríceps',tips:'Mantenha os cotovelos fixos.',instructions:['Prenda a corda na polia alta','Cotovelos fixos ao lado do corpo','Empurre para baixo estendendo os braços','Separe as mãos no final','Volte controladamente']},{name:'Rosca Direta Barra',sets:4,reps:10,video:'https://www.youtube.com/embed/FWJR5Ve8bnQ',equipment:'Barra',difficulty:'Iniciante',target:'Bíceps Braquial',tips:'Não balançe o corpo.',instructions:['Segure a barra com pegada supinada','Cotovelos fixos ao lado do corpo','Flexione os cotovelos levantando a barra','Contraia o bíceps no topo','Desça controladamente']},{name:'Abdominal Infra',sets:4,reps:12,video:'https://www.youtube.com/embed/3VfL2YcZrFA',equipment:'Banco ou Solo',difficulty:'Intermediário',target:'Reto Inferior do Abdômen',tips:'Levante os quadris do chão.',instructions:['Deite-se de costas com as mãos ao lado do corpo','Levante as pernas com joelhos levemente flexionados','Eleve os quadris do chão impulsionando com o abdômen','Contraia o reto inferior no topo','Desça controladamente']}]}};

let currentWorkout='A',completedExercises=JSON.parse(localStorage.getItem('fitpro_completed')||'{}'),timerInterval,timerSeconds=60,timerRunning=!1,totalTime=60,touchStartX=0,touchEndX=0;function setupSwipeGestures(){const c=document.getElementById('app-container');c.addEventListener('touchstart',e=>{touchStartX=e.changedTouches[0].screenX},{passive:!0}),c.addEventListener('touchend',e=>{touchEndX=e.changedTouches[0].screenX,handleSwipe()},{passive:!0})}function handleSwipe(){const d=touchStartX-touchEndX;if(Math.abs(d)>50){const w=['A','B','C','D','E'],i=w.indexOf(currentWorkout);d>0&&i<w.length-1?loadWorkout(w[i+1]):d<0&&i>0&&loadWorkout(w[i-1])}}function requestNotificationPermission(){'Notification'in window&&Notification.permission==='default'&&Notification.requestPermission()}function sendNotification(t,b){'Notification'in window&&Notification.permission==='granted'&&new Notification(t,{body:b,icon:'/icons/icon-192x192.png'})}function renderWorkoutNav(){const n=document.getElementById('workout-nav'),w=[{k:'A',l:'Treino A',d:'Segunda',c:'cyan'},{k:'B',l:'Treino B',d:'Terça',c:'orange'},{k:'C',l:'Treino C',d:'Quarta',c:'green'},{k:'D',l:'Treino D',d:'Sexta',c:'purple'},{k:'E',l:'Treino E',d:'Sábado',c:'pink'}];n.innerHTML=w.map(x=>\\`<button onclick="loadWorkout('\\${x.k}')" class="workout-tab px-6 py-4 rounded-xl font-semibold text-sm min-w-[120px] \\${x.k===currentWorkout?'active':'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'} border border-white/5" data-workout="\\${x.k}"><div class="text-xs opacity-70 mb-1">\\${x.d}</div><div class="font-display text-lg">\\${x.l}</div></button>\\`).join('')}function loadWorkout(wk){currentWorkout=wk;const w=workoutPlans[wk];document.querySelectorAll('.workout-tab').forEach(t=>{t.dataset.workout===wk?(t.classList.add('active'),t.classList.remove('bg-gray-800/50','text-gray-400')):(t.classList.remove('active'),t.classList.add('bg-gray-800/50','text-gray-400'))}),document.getElementById('workout-tag').textContent=w.name,document.getElementById('workout-tag').className=\\`px-3 py-1 bg-\\${w.color}-500/20 text-\\${w.color}-400 rounded-full text-xs font-bold tracking-wider\\`,document.getElementById('workout-date').textContent=w.day,document.getElementById('workout-title').textContent=w.muscles,document.getElementById('workout-subtitle').textContent=\\`\\${w.exercises.length} exercícios • \\${w.exercises.reduce((a,b)=>a+b.sets,0)} séries totais\\`;const c=document.getElementById('exercises-list');c.innerHTML=w.exercises.map((ex,idx)=>{const eid=\\`\\${wk}_\\${idx}\\`,isDone=completedExercises[eid];return\\`<div class="exercise-card glass-effect rounded-2xl p-4 md:p-6 \\${isDone?'opacity-60':''}" id="card-\\${eid}"><div class="flex flex-col md:flex-row gap-4"><div class="relative w-full md:w-56 h-32 bg-gray-800 rounded-xl overflow-hidden cursor-pointer group shrink-0" onclick="openExerciseModal('\\${wk}',\\${idx})"><img src="https://img.youtube.com/vi/\\${ex.video.match(/embed\\/([^?]+)/)[1]}/mqdefault.jpg" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy"><div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors"><div class="w-12 h-12 rounded-full bg-cyan-500/80 flex items-center justify-center group-hover:scale-110 transition-transform"><i class="fas fa-play text-white ml-1"></i></div></div><div class="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs backdrop-blur"><i class="fas fa-play-circle mr-1"></i>Ver vídeo</div></div><div class="flex-1 min-w-0"><div class="flex justify-between items-start mb-2"><div class="min-w-0"><h3 class="font-bold text-lg truncate">\\${ex.name}</h3><div class="flex flex-wrap gap-2 mt-1"><span class="muscle-tag px-2 py-0.5 rounded text-xs font-medium">\\${ex.target}</span><span class="bg-white/5 px-2 py-0.5 rounded text-xs text-gray-400">\\${ex.equipment}</span></div></div><button onclick="toggleExerciseComplete('\\${eid}')" class="check-btn w-10 h-10 rounded-full \\${isDone?'completed':'bg-white/10 hover:bg-white/20'} flex items-center justify-center transition-all shrink-0 ml-2" id="check-\\${eid}"><i class="fas fa-check text-white \\${isDone?'check-animation':''}"></i></button></div><div class="grid grid-cols-3 gap-2 mb-3"><div class="bg-white/5 rounded-lg p-2 text-center"><p class="text-gray-400 text-xs">Séries</p><p class="font-bold font-display text-cyan-400">\\${ex.sets}</p></div><div class="bg-white/5 rounded-lg p-2 text-center"><p class="text-gray-400 text-xs">Reps</p><p class="font-bold font-display text-purple-400">\\${ex.reps}</p></div><div class="bg-white/5 rounded-lg p-2 text-center"><p class="text-gray-400 text-xs">Descanso</p><p class="font-bold font-display text-green-400">60s</p></div></div><div class="flex gap-2"><button onclick="openExerciseModal('\\${wk}',\\${idx})" class="flex-1 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium transition-colors border border-cyan-500/20"><i class="fas fa-info-circle mr-2"></i>Ver Execução</button><button onclick="showRestTimer()" class="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"><i class="fas fa-stopwatch text-gray-400"></i></button></div></div></div></div>\\`}).join(''),updateProgress()}function toggleExerciseComplete(eid){completedExercises[eid]=!completedExercises[eid],localStorage.setItem('fitpro_completed',JSON.stringify(completedExercises));const btn=document.getElementById(\\`check-\\${eid}\\`),card=document.getElementById(\\`card-\\${eid}\\`);completedExercises[eid]?(btn.classList.remove('bg-white/10','hover:bg-white/20'),btn.classList.add('completed'),btn.querySelector('i').classList.add('check-animation'),card.classList.add('opacity-60'),'vibrate'in navigator&&navigator.vibrate(50)):(btn.classList.add('bg-white/10','hover:bg-white/20'),btn.classList.remove('completed'),btn.querySelector('i').classList.remove('check-animation'),card.classList.remove('opacity-60')),updateProgress(),updateStats()}function updateProgress(){const w=workoutPlans[currentWorkout];let done=0;w.exercises.forEach((_,i)=>{completedExercises[\\`\\${currentWorkout}_\\${i}\\`]&&done++});const pct=Math.round(done/w.exercises.length*100);document.getElementById('progress-percent').textContent=\\`\\${pct}%\\`,100===pct&&sendNotification('Treino Concluído! 🎉','Parabéns! Você completou todo o treino de hoje.')}function updateStats(){let done=0,total=0;Object.keys(workoutPlans).forEach(k=>{workoutPlans[k].exercises.forEach((_,i)=>{total++,completedExercises[\\`\\${k}_\\${i}\\`]&&done++})}),document.getElementById('weekly-workouts').textContent=\\`\\${done}/\\${total}\\`,document.getElementById('total-volume').textContent=done}function openExerciseModal(wk,idx){const ex=workoutPlans[wk].exercises[idx];document.getElementById('modal-title').textContent=ex.name,document.getElementById('modal-subtitle').textContent=\\`\\${ex.target} • \\${ex.sets}x\\${ex.reps}\\`,document.getElementById('modal-equipment').textContent=ex.equipment,document.getElementById('modal-difficulty').textContent=ex.difficulty,document.getElementById('modal-difficulty').className=\\`font-semibold text-sm \\${'Iniciante'===ex.difficulty?'difficulty-easy':'Intermediário'===ex.difficulty?'difficulty-medium':'difficulty-hard'}\\`,document.getElementById('modal-target').textContent=ex.target,document.getElementById('modal-tips').textContent=ex.tips,document.getElementById('modal-instructions').innerHTML=ex.instructions.map((inst,i)=>\\`<li class="flex gap-3 items-start"><span class="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-cyan-500/30">\\${i+1}</span><span class="text-gray-300 leading-relaxed">\\${inst}</span></li>\\`).join(''),document.getElementById('exercise-video').src=ex.video+'?autoplay=1',document.getElementById('modal-sets').innerHTML=Array.from({length:ex.sets},(_,i)=>\\`<div class="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5"><span class="font-semibold text-gray-400 w-16 text-sm">Série \\${i+1}</span><div class="flex-1 grid grid-cols-2 gap-2"><input type="number" placeholder="\\${ex.reps} reps" class="bg-gray-800 rounded-lg px-3 py-2 text-center text-sm border border-gray-700 focus:border-cyan-500 outline-none"><input type="number" placeholder="Kg" class="bg-gray-800 rounded-lg px-3 py-2 text-center text-sm border border-gray-700 focus:border-cyan-500 outline-none"></div><button onclick="this.classList.toggle('text-green-500');this.classList.toggle('text-gray-600')" class="text-gray-600 hover:text-green-500 transition-colors"><i class="fas fa-check-circle text-xl"></i></button></div>\\`).join(''),document.getElementById('exercise-modal').classList.add('active'),document.body.style.overflow='hidden'}function closeModal(){document.getElementById('exercise-modal').classList.remove('active'),document.getElementById('exercise-video').src='',document.body.style.overflow=''}function showRestTimer(){document.getElementById('timer-modal').classList.add('active'),resetTimer()}function closeTimer(){document.getElementById('timer-modal').classList.remove('active'),resetTimer()}function setTimer(s){totalTime=s,timerSeconds=s,updateTimerDisplay(),resetTimer()}function updateTimerDisplay(){document.getElementById('timer-display').textContent=timerSeconds;const c=document.getElementById('timer-circle'),circ=2*Math.PI*88,off=circ-timerSeconds/totalTime*circ;c.style.strokeDashoffset=off}function toggleTimer(){const btn=document.getElementById('timer-toggle');timerRunning?(clearInterval(timerInterval),timerRunning=!1,btn.innerHTML='<i class="fas fa-play"></i>',btn.classList.remove('pulse-ring')):(timerRunning=!0,btn.innerHTML='<i class="fas fa-pause"></i>',btn.classList.add('pulse-ring'),timerInterval=setInterval(()=>{timerSeconds--,updateTimerDisplay(),timerSeconds<=0&&(clearInterval(timerInterval),timerRunning=!1,btn.innerHTML='<i class="fas fa-play"></i>',btn.classList.remove('pulse-ring'),'vibrate'in navigator&&navigator.vibrate([200,100,200]),sendNotification('⏱️ Timer Finalizado','Seu descanso acabou! Próxima série.'))},1e3))}function resetTimer(){clearInterval(timerInterval),timerRunning=!1,timerSeconds=totalTime,updateTimerDisplay(),document.getElementById('timer-toggle').innerHTML='<i class="fas fa-play"></i>',document.getElementById('timer-toggle').classList.remove('pulse-ring')}function startWorkoutTimer(){const first=document.querySelector('.exercise-card:not(.opacity-60)');first&&(first.scrollIntoView({behavior:'smooth',block:'center'}),first.classList.add('neon-border'),setTimeout(()=>first.classList.remove('neon-border'),2e3))}function exportData(){const data={completedExercises:completedExercises,exportDate:new Date().toISOString(),version:'1.0'},blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url,a.download=\\`fitpro-backup-\\${new Date().toISOString().split('T')[0]}.json\\`,document.body.appendChild(a),a.click(),document.body.removeChild(a),URL.revokeObjectURL(url),sendNotification('✅ Backup Exportado','Seus dados foram salvos com sucesso!')}function importData(){document.getElementById('import-file').click()}function handleFileImport(e){const file=e.target.files[0];if(!file)return;const reader=new FileReader;reader.onload=e=>{try{const data=JSON.parse(e.target.result);data.completedExercises&&(completedExercises=data.completedExercises,localStorage.setItem('fitpro_completed',JSON.stringify(completedExercises)),loadWorkout(currentWorkout),updateStats(),sendNotification('✅ Backup Importado','Seus dados foram restaurados com sucesso!'))}catch(err){alert('Erro ao importar arquivo. Verifique se é um backup válido do FitPro.')}},reader.readAsText(file)}function showSection(sec){'progress'===sec?alert('📊 Seção de Progresso\\n\\nEm breve com gráficos de evolução!'):'settings'===sec&&confirm('Deseja limpar todo o progresso?')&&(completedExercises={},localStorage.removeItem('fitpro_completed'),loadWorkout(currentWorkout),updateStats())}function toggleProfile(){alert('👤 Perfil do Aluno\\n\\nNome: Aluno FitPro\\nPlano: ABC + DE\\nObjetivo: Hipertrofia\\nFrequência: 5x/semana')}window.onclick=function(e){e.target.classList.contains('modal')&&('exercise-modal'===e.target.id&&closeModal(),'timer-modal'===e.target.id&&closeTimer())},document.addEventListener('keydown',e=>{'Escape'===e.key&&(closeModal(),closeTimer())});let lastTouchEnd=0;document.addEventListener('touchend',e=>{const now=Date.now();now-lastTouchEnd<=300&&e.preventDefault(),lastTouchEnd=now},{passive:!1}),document.addEventListener('DOMContentLoaded',()=>{renderWorkoutNav(),loadWorkout('A'),updateStats(),setupSwipeGestures(),requestNotificationPermission()});
`
};

// Criar todos os arquivos
Object.keys(files).forEach(filename => {
    const filePath = path.join(baseDir, filename);
    fs.writeFileSync(filePath, files[filename]);
    console.log(`${colors.green}✓${colors.reset} ${filename} criado`);
});

// Criar ícones SVG simples (base64) como placeholder
const icon192 = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><rect width="192" height="192" fill="#0891b2" rx="24"/><text x="96" y="120" font-family="Arial" font-size="80" font-weight="bold" fill="white" text-anchor="middle">💪</text></svg>`);
const icon512 = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#0891b2" rx="64"/><text x="256" y="320" font-family="Arial" font-size="200" font-weight="bold" fill="white" text-anchor="middle">💪</text></svg>`);

fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), icon192);
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), icon512);
console.log(`${colors.green}✓${colors.reset} Ícones placeholder criados`);

console.log(`\n${colors.cyan}═══════════════════════════════════════${colors.reset}`);
console.log(`${colors.green}✓ Setup completo!${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════${colors.reset}\n`);

console.log(`📁 Local: ${colors.yellow}${baseDir}${colors.reset}\n`);

console.log(`${colors.cyan}Comandos para executar agora:${colors.reset}`);
console.log(`  ${colors.yellow}cd fitpro${colors.reset}`);
console.log(`  ${colors.yellow}git init${colors.reset}`);
console.log(`  ${colors.yellow}git add .${colors.reset}`);
console.log(`  ${colors.yellow}git commit -m "Primeira versão FitPro"${colors.reset}`);
console.log(`  ${colors.yellow}git remote add origin https://github.com/SEU-USUARIO/fitpro.git${colors.reset}`);
console.log(`  ${colors.yellow}git push -u origin main${colors.reset}\n`);

console.log(`${colors.green}🚀 Depois é só conectar no Netlify!${colors.reset}\n`);
