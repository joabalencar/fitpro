// Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(r => console.log('SW registrado'))
            .catch(e => console.log('SW erro', e));
    });
}

// PWA Install
const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
let deferredPrompt;

window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    if (!isStandalone) {
        setTimeout(() => {
            document.getElementById('install-banner').style.display = 'flex';
        }, 2000);
    }
});

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(c => {
            if (c.outcome === 'accepted') console.log('Instalado');
            deferredPrompt = null;
            document.getElementById('install-banner').style.display = 'none';
        });
    }
}

function dismissInstall() {
    document.getElementById('install-banner').style.display = 'none';
    localStorage.setItem('installDismissed', Date.now().toString());
}

const dismissed = localStorage.getItem('installDismissed');
if (dismissed && (Date.now() - parseInt(dismissed)) < 7 * 24 * 60 * 60 * 1000) {
    document.getElementById('install-banner').style.display = 'none';
}

// Online/Offline
function updateOnlineStatus() {
    document.getElementById('offline-indicator').style.display = navigator.onLine ? 'none' : 'block';
}
window.addEventListener('online', updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function sendNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: body, icon: './icons/icon-192x192.png' });
    }
}

// ===== DADOS DOS TREINOS =====
const workoutPlans = {
    A: {
        name: 'TREINO A', color: 'cyan', muscles: 'PEITO • OMBROS • TRÍCEPS', day: 'Segunda-feira',
        exercises: [
            { name: 'Supino Reto Barra', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/WwXS2TeFmeg', equipment: 'Barra e Banco', difficulty: 'Intermediário', target: 'Peitoral Maior', tips: 'Mantenha a escápula retraída e os cotovelos em ~75°.', instructions: ['Deite-se no banco reto, pés firmes no chão', 'Segure a barra com pegada na largura dos ombros', 'Retire a barra do suporte com braços estendidos', 'Desça controladamente até o meio do peito', 'Empurre para cima contraindo o peitoral'] },
            { name: 'Crucifixo Inclinado Halter', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/ajd71waivyg', equipment: 'Halteres e Banco Inclinado', difficulty: 'Intermediário', target: 'Peitoral Superior', tips: 'Mantenha leve flexão nos cotovelos durante todo o movimento.', instructions: ['Ajuste o banco em 30-45° de inclinação', 'Segure um halter em cada mão sobre o peito', 'Abra os braços em arco até sentir alongamento', 'Feche os braços contraindo o peitoral', 'Mantenha os cotovelos sempre levemente flexionados'] },
            { name: 'Desenvolvimento c/ Halter', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/0JfYxMRsUCQ', equipment: 'Halteres', difficulty: 'Intermediário', target: 'Deltoides', tips: 'Não arqueie as costas excessivamente.', instructions: ['Sente-se com os halteres na altura dos ombros', 'Palmas voltadas para frente', 'Empurre os pesos para cima até estender os braços', 'Desça controladamente até a altura dos ombros', 'Mantenha o core estável durante todo o movimento'] },
            { name: 'Elevação Lateral', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/3VcKaXpzqRo', equipment: 'Halteres', difficulty: 'Iniciante', target: 'Deltóide Lateral', tips: 'Não eleve acima da linha dos ombros.', instructions: ['Em pé, halteres ao lado do corpo', 'Leve inclinação para frente do tronco', 'Eleve os braços lateralmente até a altura dos ombros', 'Mantenha leve flexão nos cotovelos', 'Desça controladamente sem soltar o peso'] },
            { name: 'Elevação Frontal', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/-t7fuZ0KhDA', equipment: 'Halteres', difficulty: 'Iniciante', target: 'Deltóide Anterior', tips: 'Evite balançar o corpo.', instructions: ['Em pé, segure os halteres à frente das coxas', 'Mantenha os cotovelos levemente flexionados', 'Eleve um braço de cada vez à frente do corpo', 'Levante até a altura dos ombros', 'Desça controladamente alternando os braços'] },
            { name: 'Tríceps Pulley c/ Corda', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/kiuVA1lKdiU', equipment: 'Polia Alta + Corda', difficulty: 'Intermediário', target: 'Tríceps', tips: 'Mantenha os cotovelos fixos ao lado do corpo.', instructions: ['Prenda a corda na polia alta', 'Segure uma extremidade em cada mão', 'Cotovelos fixos ao lado do corpo', 'Empurre para baixo estendendo os braços', 'Separe as mãos no final do movimento'] },
            { name: 'Tríceps Pulley', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/2-LAMcpMYDQ', equipment: 'Polia Alta', difficulty: 'Iniciante', target: 'Tríceps', tips: 'Mantenha os cotovelos colados ao corpo.', instructions: ['Segure a barra da polia com pegada pronada', 'Cotovelos fixos ao lado do corpo', 'Empurre a barra para baixo até estender os braços', 'Contraia o tríceps no final', 'Volte controladamente sem soltar o peso'] },
            { name: 'Abdominal Reto', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/MKmrqcoCZdc', equipment: 'Peso Corporal', difficulty: 'Iniciante', target: 'Reto do Abdômen', tips: 'Não puxe a cabeça com as mãos.', instructions: ['Deite-se com joelhos flexionados e pés no chão', 'Mãos cruzadas sobre o peito ou atrás da cabeça', 'Contraia o abdômen elevando os ombros do chão', 'Mantenha a parte baixa das costas no chão', 'Desça controladamente sem relaxar completamente'] }
        ]
    },
    B: {
        name: 'TREINO B', color: 'orange', muscles: 'PERNAS • POSTERIOR', day: 'Terça-feira',
        exercises: [
            { name: 'Agachamento Livre/Smith', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/ultWZbUMPL8', equipment: 'Barra ou Smith', difficulty: 'Intermediário', target: 'Quadríceps e Glúteos', tips: 'Mantenha os joelhos alinhados com os pés.', instructions: ['Posicione a barra sobre os trapézios', 'Pés na largura dos ombros', 'Desça flexionando joelhos e quadris', 'Mantenha o peito erguido e costas retas', 'Empurre o chão para subir'] },
            { name: 'Afundo com Halter', sets: 4, reps: 8, video: 'https://www.youtube.com/embed/L8fvyBHUPew', equipment: 'Halteres', difficulty: 'Intermediário', target: 'Quadríceps e Glúteos', tips: 'O joelho de trás quase toca o chão.', instructions: ['Segure um halter em cada mão', 'Dê um passo à frente com uma perna', 'Desça até que o joelho de trás quase toque o chão', 'Empurre com o calcanhar da frente para voltar', 'Alterne as pernas a cada repetição'] },
            { name: 'Banco Extensor', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/YyvSfVjQeL0', equipment: 'Máquina Extensora', difficulty: 'Iniciante', target: 'Quadríceps', tips: 'Não estenda completamente as pernas no topo.', instructions: ['Sente-se ajustando o rolo sobre os tornozelos', 'Costas firmemente apoiadas', 'Estenda as pernas contraindo os quadríceps', 'Segure a contração por 1 segundo', 'Desça controladamente'] },
            { name: 'Banco Flexor', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/1Tq3QdYUuHs', equipment: 'Máquina Flexora', difficulty: 'Iniciante', target: 'Isquiotibiais', tips: 'Não levante os quadris do banco.', instructions: ['Deite-se de bruços na máquina', 'Calcanhares atrás do rolo', 'Flexione os joelhos puxando o rolo para cima', 'Contraia os isquiotibiais no topo', 'Desça controladamente'] },
            { name: 'Banco Adutor', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/H3DHCz5CbD0', equipment: 'Máquina Adutora', difficulty: 'Iniciante', target: 'Adutores', tips: 'Controle o movimento na fase excêntrica.', instructions: ['Sente-se na máquina com as pernas nas almofadas', 'Ajuste a amplitude conforme sua mobilidade', 'Feche as pernas contra a resistência', 'Contraia os adutores no final', 'Abra controladamente sentindo o alongamento'] },
            { name: 'Banco Abdutor', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/G_8LItOiZ0Q', equipment: 'Máquina Abdutora', difficulty: 'Iniciante', target: 'Glúteo Médio', tips: 'Mantenha o tronco ereto.', instructions: ['Sente-se com as pernas juntas nas almofadas', 'Segure as alças laterais', 'Abra as pernas contra a resistência', 'Contraia o glúteo no final do movimento', 'Feche controladamente'] },
            { name: 'Panturrilha em Pé', sets: 4, reps: 15, video: 'https://www.youtube.com/embed/gwLzBJYoWlI', equipment: 'Máquina ou Step', difficulty: 'Iniciante', target: 'Gastrocnêmio', tips: 'Use amplitude completa.', instructions: ['Posicione as pontas dos pés na plataforma', 'Calcanhares para fora da plataforma', 'Eleve os calcanhares ao máximo possível', 'Segure 2 segundos no topo', 'Desça até o alongamento completo'] }
        ]
    },
    C: {
        name: 'TREINO C', color: 'green', muscles: 'COSTAS • BÍCEPS', day: 'Quarta-feira',
        exercises: [
            { name: 'Puxada Alta Aberta', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/mPmfwbc_svw', equipment: 'Polia Alta', difficulty: 'Iniciante', target: 'Dorsais', tips: 'Não leve os cotovelos para trás.', instructions: ['Sente-se na máquina com as coxas presas', 'Segure a barra com pegada ampla', 'Puxe a barra até a parte superior do peito', 'Contraia os dorsais no fundo', 'Volte controladamente sentindo o alongamento'] },
            { name: 'Puxada Fechada Supinada', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/8yv7T2aDzPo', equipment: 'Polia Alta', difficulty: 'Iniciante', target: 'Dorsais e Bíceps', tips: 'A pegada supinada ativa mais os bíceps.', instructions: ['Segure a barra com pegada fechada e supinada', 'Sente-se com as coxas presas', 'Puxe a barra em direção ao esterno', 'Contraia as costas no final', 'Desça estendendo os braços completamente'] },
            { name: 'Remada Curvada', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/FWJR5Ve8bnQ', equipment: 'Barra', difficulty: 'Intermediário', target: 'Dorsais e Romboides', tips: 'Mantenha as costas retas e paralelas ao chão.', instructions: ['Segure a barra com pegada pronada', 'Incline o tronco a ~45°', 'Puxe a barra em direção ao abdômen', 'Contraia as escápulas no topo', 'Desça controladamente'] },
            { name: 'Remada Baixa Supinada', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/nlrXZW7pw94', equipment: 'Polia Baixa', difficulty: 'Intermediário', target: 'Latíssimo do Dorso', tips: 'A pegada supinada permite maior amplitude.', instructions: ['Sente-se na polia baixa com os pés apoiados', 'Segure a barra com pegada supinada', 'Puxe a barra em direção ao abdômen inferior', 'Contraia os dorsais no final', 'Estenda os braços sentindo o alongamento'] },
            { name: 'Encolhimento com Barra', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/8lP7JvA0i3c', equipment: 'Barra', difficulty: 'Iniciante', target: 'Trapézio', tips: 'Não role os ombros para trás.', instructions: ['Segure a barra à frente das coxas', 'Mantenha os braços estendidos', 'Eleve os ombros em direção às orelhas', 'Segure a contração por 1 segundo', 'Desça controladamente'] },
            { name: 'Rosca Alternada', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/sAq_ocpRh_I', equipment: 'Halteres', difficulty: 'Iniciante', target: 'Bíceps Braquial', tips: 'Não balançe o corpo.', instructions: ['Em pé, segure um halter em cada mão', 'Palmas voltadas para frente', 'Flexione um cotovelo de cada vez', 'Gire o punho no topo (supinação)', 'Desça controladamente alternando os braços'] },
            { name: 'Rosca Martelo', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/zC3nLlEvin4', equipment: 'Halteres', difficulty: 'Iniciante', target: 'Braquial e Bíceps', tips: 'A pegada neutra trabalha mais o braquial.', instructions: ['Segure os halteres com pegada neutra', 'Cotovelos fixos ao lado do corpo', 'Flexione os cotovelos alternadamente', 'Contraia o bíceps no topo', 'Desça controladamente'] },
            { name: 'Abdominal Reto', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/MKmrqcoCZdc', equipment: 'Peso Corporal', difficulty: 'Iniciante', target: 'Reto do Abdômen', tips: 'Exale ao subir.', instructions: ['Deite-se com joelhos flexionados', 'Mãos cruzadas sobre o peito', 'Eleve os ombros do chão contraindo o abdômen', 'Mantenha a lombar no chão', 'Desça sem relaxar completamente'] }
        ]
    },
    D: {
        name: 'TREINO D', color: 'purple', muscles: 'PERNAS • GLÚTEOS', day: 'Sexta-feira',
        exercises: [
            { name: 'Agachamento Sumo no Smith', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/6gTu6aSa-lQ', equipment: 'Máquina Smith', difficulty: 'Intermediário', target: 'Quadríceps e Adutores', tips: 'Pés bem afastados e voltados para fora ativa mais os adutores.', instructions: ['Posicione-se na máquina Smith com pegada sumô', 'Pés bem afastados e voltados para fora', 'Desça até as coxas ficarem paralelas', 'Mantenha o tronco ereto', 'Empurre o chão para subir'] },
            { name: 'Stiff', sets: 4, reps: 8, video: 'https://www.youtube.com/embed/1uLrM7gzQao', equipment: 'Barra ou Halteres', difficulty: 'Intermediário', target: 'Isquiotibiais e Glúteos', tips: 'Mantenha leve flexão nos joelhos.', instructions: ['Segure a barra com pegada pronada', 'Mantenha leve flexão nos joelhos', 'Empurre os quadris para trás inclinando o tronco', 'Desça até sentir alongamento nos isquiotibiais', 'Volte empurrando os quadris para frente'] },
            { name: 'Banco Extensor Unilateral', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/YyvSfVjQeL0', equipment: 'Máquina Extensora', difficulty: 'Intermediário', target: 'Quadríceps', tips: 'Trabalhe uma perna de cada vez.', instructions: ['Sente-se na máquina extensora', 'Trabalhe uma perna de cada vez', 'Estenda a perna contraindo o quadríceps', 'Segure a contração no topo', 'Alterne as pernas a cada série'] },
            { name: 'Banco Flexor', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/1Tq3QdYUuHs', equipment: 'Máquina Flexora', difficulty: 'Iniciante', target: 'Isquiotibiais', tips: 'Ajuste bem o rolo acima dos calcanhares.', instructions: ['Deite-se de bruços na máquina', 'Ajuste o rolo acima dos calcanhares', 'Flexione os joelhos puxando o rolo', 'Contraia os isquiotibiais', 'Desça controladamente'] },
            { name: 'Banco Adutor', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/H3DHCz5CbD0', equipment: 'Máquina Adutora', difficulty: 'Iniciante', target: 'Adutores', tips: 'Controle a fase excêntrica.', instructions: ['Sente-se na máquina com as pernas nas almofadas', 'Ajuste a amplitude do movimento', 'Feche as pernas contra a resistência', 'Contraia os adutores no final', 'Abra controladamente'] },
            { name: 'Banco Abdutor', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/G_8LItOiZ0Q', equipment: 'Máquina Abdutora', difficulty: 'Iniciante', target: 'Glúteo Médio', tips: 'Mantenha o tronco ereto.', instructions: ['Sente-se com as pernas juntas', 'Segure as alças laterais', 'Abra as pernas contra a resistência', 'Contraia o glúteo no topo', 'Feche controladamente'] },
            { name: 'Panturrilha em Pé', sets: 4, reps: 15, video: 'https://www.youtube.com/embed/gwLzBJYoWlI', equipment: 'Máquina ou Step', difficulty: 'Iniciante', target: 'Gastrocnêmio', tips: 'Use amplitude completa.', instructions: ['Posicione as pontas dos pés na plataforma', 'Calcanhares para fora', 'Eleve os calcanhares ao máximo', 'Segure 2 segundos no topo', 'Desça até o alongamento completo'] }
        ]
    },
    E: {
        name: 'TREINO E', color: 'pink', muscles: 'COSTAS • PEITO • BRAÇOS', day: 'Sábado',
        exercises: [
            { name: 'Puxada Alta Aberta', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/mPmfwbc_svw', equipment: 'Polia Alta', difficulty: 'Iniciante', target: 'Dorsais', tips: 'Abra o peito e puxe com os cotovelos.', instructions: ['Sente-se na máquina com as coxas presas', 'Segure a barra com pegada ampla', 'Puxe até a parte superior do peito', 'Contraia os dorsais', 'Volte controladamente'] },
            { name: 'Remada Baixa Supinada', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/nlrXZW7pw94', equipment: 'Polia Baixa', difficulty: 'Intermediário', target: 'Latíssimo do Dorso', tips: 'A pegada supinada permite maior carga.', instructions: ['Sente-se na polia baixa', 'Segure a barra com pegada supinada', 'Puxe em direção ao abdômen', 'Contraia as costas no final', 'Estenda os braços controladamente'] },
            { name: 'Supino Inclinado com Halter', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/ajd71waivyg', equipment: 'Halteres e Banco Inclinado', difficulty: 'Intermediário', target: 'Peitoral Superior', tips: 'Incline o banco em 30-45°.', instructions: ['Ajuste o banco em 30-45°', 'Segure os halteres na altura do peito', 'Empurre para cima até quase tocarem', 'Desça controladamente', 'Mantenha os cotovelos em ~75°'] },
            { name: 'Elevação Lateral', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/3VcKaXpzqRo', equipment: 'Halteres', difficulty: 'Iniciante', target: 'Deltóide Lateral', tips: 'Use pesos moderados.', instructions: ['Em pé, halteres ao lado do corpo', 'Leve inclinação para frente', 'Eleve os braços lateralmente', 'Mantenha leve flexão nos cotovelos', 'Desça controladamente'] },
            { name: 'Elevação Frontal', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/-t7fuZ0KhDA', equipment: 'Halteres', difficulty: 'Iniciante', target: 'Deltóide Anterior', tips: 'Evite balançar.', instructions: ['Segure os halteres à frente das coxas', 'Eleve um braço de cada vez', 'Levante até a altura dos ombros', 'Desça controladamente', 'Alterne os braços'] },
            { name: 'Tríceps Pulley c/ Corda', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/kiuVA1lKdiU', equipment: 'Polia + Corda', difficulty: 'Intermediário', target: 'Tríceps', tips: 'Mantenha os cotovelos fixos.', instructions: ['Prenda a corda na polia alta', 'Cotovelos fixos ao lado do corpo', 'Empurre para baixo estendendo os braços', 'Separe as mãos no final', 'Volte controladamente'] },
            { name: 'Rosca Direta Barra', sets: 4, reps: 10, video: 'https://www.youtube.com/embed/FWJR5Ve8bnQ', equipment: 'Barra', difficulty: 'Iniciante', target: 'Bíceps Braquial', tips: 'Não balançe o corpo.', instructions: ['Segure a barra com pegada supinada', 'Cotovelos fixos ao lado do corpo', 'Flexione os cotovelos levantando a barra', 'Contraia o bíceps no topo', 'Desça controladamente'] },
            { name: 'Abdominal Infra', sets: 4, reps: 12, video: 'https://www.youtube.com/embed/3VfL2YcZrFA', equipment: 'Banco ou Solo', difficulty: 'Intermediário', target: 'Reto Inferior do Abdômen', tips: 'Levante os quadris do chão.', instructions: ['Deite-se de costas com as mãos ao lado do corpo', 'Levante as pernas com joelhos levemente flexionados', 'Eleve os quadris do chão impulsionando com o abdômen', 'Contraia o reto inferior no topo', 'Desça controladamente'] }
        ]
    }
};

// ===== ESTADO =====
let currentWorkout = 'A';
let completedExercises = JSON.parse(localStorage.getItem('fitpro_completed') || '{}');
let timerInterval;
let timerSeconds = 60;
let timerRunning = false;
let totalTime = 60;
let touchStartX = 0;
let touchEndX = 0;

// ===== SWIPE =====
function setupSwipeGestures() {
    const c = document.getElementById('app-container');
    c.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    c.addEventListener('touchend', e => { touchEndX = e.changedTouches[0].screenX; handleSwipe(); }, { passive: true });
}

function handleSwipe() {
    const d = touchStartX - touchEndX;
    if (Math.abs(d) > 50) {
        const w = ['A', 'B', 'C', 'D', 'E'];
        const i = w.indexOf(currentWorkout);
        if (d > 0 && i < w.length - 1) loadWorkout(w[i + 1]);
        else if (d < 0 && i > 0) loadWorkout(w[i - 1]);
    }
}

// ===== NAV =====
function renderWorkoutNav() {
    const n = document.getElementById('workout-nav');
    const tabs = [
        { k: 'A', l: 'Treino A', d: 'Segunda', c: 'cyan' },
        { k: 'B', l: 'Treino B', d: 'Terça', c: 'orange' },
        { k: 'C', l: 'Treino C', d: 'Quarta', c: 'green' },
        { k: 'D', l: 'Treino D', d: 'Sexta', c: 'purple' },
        { k: 'E', l: 'Treino E', d: 'Sábado', c: 'pink' }
    ];
    n.innerHTML = tabs.map(x => {
        const isActive = x.k === currentWorkout;
        return '<button onclick="loadWorkout(\'' + x.k + '\')" class="workout-tab px-6 py-4 rounded-xl font-semibold text-sm min-w-[120px] ' + (isActive ? 'active' : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50') + ' border border-white/5" data-workout="' + x.k + '">' +
            '<div class="text-xs opacity-70 mb-1">' + x.d + '</div>' +
            '<div class="font-display text-lg">' + x.l + '</div>' +
            '</button>';
    }).join('');
}

// ===== CARREGAR TREINO =====
function loadWorkout(wk) {
    currentWorkout = wk;
    const w = workoutPlans[wk];

    document.querySelectorAll('.workout-tab').forEach(t => {
        if (t.dataset.workout === wk) {
            t.classList.add('active');
            t.classList.remove('bg-gray-800/50', 'text-gray-400');
        } else {
            t.classList.remove('active');
            t.classList.add('bg-gray-800/50', 'text-gray-400');
        }
    });

    document.getElementById('workout-tag').textContent = w.name;
    document.getElementById('workout-tag').className = 'px-3 py-1 bg-' + w.color + '-500/20 text-' + w.color + '-400 rounded-full text-xs font-bold tracking-wider';
    document.getElementById('workout-date').textContent = w.day;
    document.getElementById('workout-title').textContent = w.muscles;
    document.getElementById('workout-subtitle').textContent = w.exercises.length + ' exercícios • ' + w.exercises.reduce((a, b) => a + b.sets, 0) + ' séries totais';

    const c = document.getElementById('exercises-list');
    c.innerHTML = w.exercises.map((ex, idx) => {
        const eid = wk + '_' + idx;
        const isDone = completedExercises[eid];
        const videoId = ex.video.match(/embed\/([^?]+)/)[1];
        return '<div class="exercise-card glass-effect rounded-2xl p-4 md:p-6 ' + (isDone ? 'opacity-60' : '') + '" id="card-' + eid + '">' +
            '<div class="flex flex-col md:flex-row gap-4">' +
            '<div class="relative w-full md:w-56 h-32 bg-gray-800 rounded-xl overflow-hidden cursor-pointer group shrink-0" onclick="openExerciseModal(\'' + wk + '\',' + idx + ')">' +
            '<img src="https://img.youtube.com/vi/' + videoId + '/mqdefault.jpg" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" loading="lazy">' +
            '<div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">' +
            '<div class="w-12 h-12 rounded-full bg-cyan-500/80 flex items-center justify-center group-hover:scale-110 transition-transform"><i class="fas fa-play text-white ml-1"></i></div></div>' +
            '<div class="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs backdrop-blur"><i class="fas fa-play-circle mr-1"></i>Ver vídeo</div></div>' +
            '<div class="flex-1 min-w-0">' +
            '<div class="flex justify-between items-start mb-2">' +
            '<div class="min-w-0"><h3 class="font-bold text-lg truncate">' + ex.name + '</h3>' +
            '<div class="flex flex-wrap gap-2 mt-1">' +
            '<span class="muscle-tag px-2 py-0.5 rounded text-xs font-medium">' + ex.target + '</span>' +
            '<span class="bg-white/5 px-2 py-0.5 rounded text-xs text-gray-400">' + ex.equipment + '</span></div></div>' +
            '<button onclick="toggleExerciseComplete(\'' + eid + '\')" class="check-btn w-10 h-10 rounded-full ' + (isDone ? 'completed' : 'bg-white/10 hover:bg-white/20') + ' flex items-center justify-center transition-all shrink-0 ml-2" id="check-' + eid + '">' +
            '<i class="fas fa-check text-white"></i></button></div>' +
            '<div class="grid grid-cols-3 gap-2 mb-3">' +
            '<div class="bg-white/5 rounded-lg p-2 text-center"><p class="text-gray-400 text-xs">Séries</p><p class="font-bold font-display text-cyan-400">' + ex.sets + '</p></div>' +
            '<div class="bg-white/5 rounded-lg p-2 text-center"><p class="text-gray-400 text-xs">Reps</p><p class="font-bold font-display text-purple-400">' + ex.reps + '</p></div>' +
            '<div class="bg-white/5 rounded-lg p-2 text-center"><p class="text-gray-400 text-xs">Descanso</p><p class="font-bold font-display text-green-400">60s</p></div></div>' +
            '<div class="flex gap-2">' +
            '<button onclick="openExerciseModal(\'' + wk + '\',' + idx + ')" class="flex-1 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium transition-colors border border-cyan-500/20"><i class="fas fa-info-circle mr-2"></i>Ver Execução</button>' +
            '<button onclick="showRestTimer()" class="px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition-colors"><i class="fas fa-stopwatch text-gray-400"></i></button>' +
            '</div></div></div></div>';
    }).join('');

    updateProgress();
}

// ===== PROGRESSO =====
function toggleExerciseComplete(eid) {
    completedExercises[eid] = !completedExercises[eid];
    localStorage.setItem('fitpro_completed', JSON.stringify(completedExercises));
    const btn = document.getElementById('check-' + eid);
    const card = document.getElementById('card-' + eid);
    if (completedExercises[eid]) {
        btn.classList.remove('bg-white/10', 'hover:bg-white/20');
        btn.classList.add('completed');
        card.classList.add('opacity-60');
        if ('vibrate' in navigator) navigator.vibrate(50);
    } else {
        btn.classList.add('bg-white/10', 'hover:bg-white/20');
        btn.classList.remove('completed');
        card.classList.remove('opacity-60');
    }
    updateProgress();
    updateStats();
}

function updateProgress() {
    const w = workoutPlans[currentWorkout];
    let done = 0;
    w.exercises.forEach((_, i) => {
        if (completedExercises[currentWorkout + '_' + i]) done++;
    });
    const pct = Math.round(done / w.exercises.length * 100);
    document.getElementById('progress-percent').textContent = pct + '%';
    if (pct === 100) sendNotification('Treino Concluído!', 'Parabéns! Você completou todo o treino de hoje.');
}

function updateStats() {
    let done = 0, total = 0;
    Object.keys(workoutPlans).forEach(k => {
        workoutPlans[k].exercises.forEach((_, i) => {
            total++;
            if (completedExercises[k + '_' + i]) done++;
        });
    });
    document.getElementById('weekly-workouts').textContent = done + '/' + total;
    document.getElementById('total-volume').textContent = done;
}

// ===== MODAL DE EXERCÍCIO =====
function openExerciseModal(wk, idx) {
    const ex = workoutPlans[wk].exercises[idx];
    document.getElementById('modal-title').textContent = ex.name;
    document.getElementById('modal-subtitle').textContent = ex.target + ' • ' + ex.sets + 'x' + ex.reps;
    document.getElementById('modal-equipment').textContent = ex.equipment;
    document.getElementById('modal-difficulty').textContent = ex.difficulty;
    document.getElementById('modal-target').textContent = ex.target;
    document.getElementById('modal-tips').textContent = ex.tips;
    document.getElementById('modal-instructions').innerHTML = ex.instructions.map((inst, i) =>
        '<li class="flex gap-3 items-start">' +
        '<span class="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 border border-cyan-500/30">' + (i + 1) + '</span>' +
        '<span class="text-gray-300 leading-relaxed">' + inst + '</span></li>'
    ).join('');
    document.getElementById('exercise-video').src = ex.video + '?autoplay=1';
    document.getElementById('modal-sets').innerHTML = Array.from({ length: ex.sets }, (_, i) =>
        '<div class="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">' +
        '<span class="font-semibold text-gray-400 w-16 text-sm">Série ' + (i + 1) + '</span>' +
        '<div class="flex-1 grid grid-cols-2 gap-2">' +
        '<input type="number" placeholder="' + ex.reps + ' reps" class="bg-gray-800 rounded-lg px-3 py-2 text-center text-sm border border-gray-700 focus:border-cyan-500 outline-none">' +
        '<input type="number" placeholder="Kg" class="bg-gray-800 rounded-lg px-3 py-2 text-center text-sm border border-gray-700 focus:border-cyan-500 outline-none"></div>' +
        '<button onclick="this.classList.toggle(\'text-green-500\');this.classList.toggle(\'text-gray-600\')" class="text-gray-600 hover:text-green-500 transition-colors"><i class="fas fa-check-circle text-xl"></i></button></div>'
    ).join('');
    document.getElementById('exercise-modal').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('exercise-modal').classList.remove('active');
    document.getElementById('exercise-video').src = '';
    document.body.style.overflow = '';
}

// ===== TIMER =====
function showRestTimer() {
    document.getElementById('timer-modal').classList.add('active');
    resetTimer();
}

function closeTimer() {
    document.getElementById('timer-modal').classList.remove('active');
    resetTimer();
}

function setTimer(s) {
    totalTime = s;
    timerSeconds = s;
    updateTimerDisplay();
    clearInterval(timerInterval);
    timerRunning = false;
    document.getElementById('timer-toggle').innerHTML = '<i class="fas fa-play"></i>';
}

function updateTimerDisplay() {
    document.getElementById('timer-display').textContent = timerSeconds;
    const circ = 2 * Math.PI * 88;
    const off = circ - (timerSeconds / totalTime) * circ;
    document.getElementById('timer-circle').style.strokeDashoffset = off;
}

function toggleTimer() {
    const btn = document.getElementById('timer-toggle');
    if (timerRunning) {
        clearInterval(timerInterval);
        timerRunning = false;
        btn.innerHTML = '<i class="fas fa-play"></i>';
    } else {
        timerRunning = true;
        btn.innerHTML = '<i class="fas fa-pause"></i>';
        timerInterval = setInterval(() => {
            timerSeconds--;
            updateTimerDisplay();
            if (timerSeconds <= 0) {
                clearInterval(timerInterval);
                timerRunning = false;
                btn.innerHTML = '<i class="fas fa-play"></i>';
                if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);
                sendNotification('Timer Finalizado', 'Seu descanso acabou! Próxima série.');
            }
        }, 1000);
    }
}

function resetTimer() {
    clearInterval(timerInterval);
    timerRunning = false;
    timerSeconds = totalTime;
    updateTimerDisplay();
    document.getElementById('timer-toggle').innerHTML = '<i class="fas fa-play"></i>';
}

// ===== OUTRAS FUNÇÕES =====
function startWorkoutTimer() {
    const first = document.querySelector('.exercise-card:not(.opacity-60)');
    if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function exportData() {
    const data = { completedExercises, exportDate: new Date().toISOString(), version: '1.0' };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'fitpro-backup-' + new Date().toISOString().split('T')[0] + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function importData() {
    document.getElementById('import-file').click();
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
        try {
            const data = JSON.parse(e.target.result);
            if (data.completedExercises) {
                completedExercises = data.completedExercises;
                localStorage.setItem('fitpro_completed', JSON.stringify(completedExercises));
                loadWorkout(currentWorkout);
                updateStats();
                alert('Backup importado com sucesso!');
            }
        } catch (err) {
            alert('Erro ao importar arquivo. Verifique se é um backup válido do FitPro.');
        }
    };
    reader.readAsText(file);
}

function showSection(sec) {
    if (sec === 'progress') {
        alert('Seção de Progresso em breve!');
    } else if (sec === 'settings') {
        if (confirm('Deseja limpar todo o progresso?')) {
            completedExercises = {};
            localStorage.removeItem('fitpro_completed');
            loadWorkout(currentWorkout);
            updateStats();
        }
    }
}

function toggleProfile() {
    alert('Perfil do Aluno\n\nNome: Aluno FitPro\nPlano: ABC + DE\nObjetivo: Hipertrofia\nFrequência: 5x/semana');
}

// ===== EVENTOS =====
window.onclick = function (e) {
    if (e.target.classList.contains('modal')) {
        if (e.target.id === 'exercise-modal') closeModal();
        if (e.target.id === 'timer-modal') closeTimer();
    }
};

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeTimer(); }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) e.preventDefault();
    lastTouchEnd = now;
}, { passive: false });

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    renderWorkoutNav();
    loadWorkout('A');
    updateStats();
    setupSwipeGestures();
    requestNotificationPermission();
});
