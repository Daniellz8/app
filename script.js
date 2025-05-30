// ===============================================
// 1. Definição das Variáveis e Constantes Globais
// ===============================================

// Constantes de Ganho (conforme sua especificação)
const XP_PER_LESSON = 100;
const XP_BONUS_PER_PROJECT = 1000;
const FOLLOWERS_PER_1000_XP = 42;
const FOLLOWERS_BONUS_PER_PROJECT = 50;
const REVENUE_PER_PROJECT = 300;

// Novas constantes para as recompensas de debug, mais claras e alinhadas à sua lógica
const REWARD_FOR_FIRST_30 = 50;
const REWARD_FOR_FIRST_50 = 150; // Total para os primeiros 50
const REWARD_FOR_NEXT_30_AFTER_50 = 30; // Para cada bloco de 30 após os múltiplos de 50 (ex: 51-80, 101-130)

const MONTHLY_COST = 600;
const REAL_REWARD_CONVERSION_FACTOR = 0.2; // 200/1000 = 0.2 -> 20% da receita líquida.
const FOLLOWERS_FOR_10_STARS = 3086; // Meta para 10 estrelas

// Frases motivacionais
const MOTIVATIONAL_PHRASES = [
    "Acredite no seu potencial. Ele é ilimitado.",
    "Pequenos passos todos os dias levam a grandes conquistas.",
    "Seu esforço de hoje é o sucesso de amanhã.",
    "Não desista. O melhor ainda está por vir.",
    "A mudança começa em você.",
    "Transforme desafios em oportunidades.",
    "Inspire-se, mas seja a sua própria motivação.",
    "Cada novo dia é uma nova chance de recomeçar.",
    "A persistência realiza o impossível.",
    "Você é mais forte do que pensa.",
    "Celebre cada pequena vitória.",
    "Siga em frente, mesmo que devagar.",
    "O sucesso é a soma de pequenos esforços repetidos.",
    "Nunca é tarde para ser quem você realmente quer ser.",
    "Seu único limite é você mesmo.",
    "Aprenda com o passado, viva o presente, sonhe com o futuro.",
    "Faça o que for preciso, mas nunca pare de sonhar.",
    "A vida é uma jornada, não é um destino.",
    "Quebre suas barreiras. Supere-se!",
    "Acredite que você pode, e você estará no meio do caminho.",
    "Dê o seu melhor e deixe o resto acontecer.",
    "A força não vem da capacidade física, mas de uma vontade indomável.",
    "Seja a energia que você quer atrair.",
    "Sua atitude determina sua direção.",
    "Conquiste seus medos e liberte seu potencial.",
    "O caminho para o sucesso está sempre em construção.",
    "Respire fundo e siga em frente. Você consegue!",
    "A sua coragem é maior que o seu medo.",
    "Faça de cada dia uma obra-prima.",
    "Onde há vontade, há um caminho.",
    "Comece de onde você está. Use o que você tem. Faça o que você pode."
];

// Estado inicial do jogo (valores padrão)
let gameState = {
    totalXP: 0,
    lessonsCompleted: 0,
    dailyDebugsCompleted: 0,       // Debugs feitos no dia atual
    lastDebugDate: null,           // Data do último debug registrado (para reset diário)
    dailyDebugRevenueAccumulated: 0, // NOVO: Receita acumulada APENAS dos debugs do dia atual
    exercisesCompleted: 0,         // Contador total de debugs de todos os tempos
    projectsCompleted: 0,
    simulatedRevenue: 0,           // Receita total simulada (acumulativa de debugs e projetos)
    totalFollowers: 0,
    recentActivities: [],          // Atividades da dashboard (limite para exibição)
    activityHistory: [],           // Histórico COMPLETO de todas as atividades
    dailyActivitySummary: {},      // NOVO: Armazena um resumo das atividades por dia
    lastDailySummaryDate: null,    // NOVO: Data da última vez que o resumo diário foi gerado
    timerSeconds: 0,               // Tempo do cronômetro em segundos
    pomodoro: {
        isRunning: false,
        isFocusMode: true,
        remainingSeconds: 0,
        focusDuration: 25 * 60,    // 25 minutos em segundos
        breakDuration: 5 * 60      // 5 minutos em segundos
    },
    exercisesPerWeek: {},          // Armazena exercícios concluídos por semana (formato 'YYYY-WW')
    activeProjects: [],            // Lista de projetos em andamento/pausados
    completedProjects: [],         // Lista de projetos concluídos
    journalEntries: [],            // Entradas do diário
    lessonEntries: [],             // Entradas de aulas teóricas com título e anotações
    currentMotivationalPhrase: "", // NOVO: Frase motivacional do dia
    lastMotivationalPhraseDate: null // NOVO: Data da última atualização da frase
};

// ===============================================
// 2. Referências aos Elementos HTML (DOM)
// ===============================================

const headerElement = document.querySelector('header.fixed-dashboard');
const mainContentElement = document.querySelector('main.content-below-dashboard');

const xpTotalElement = document.getElementById('xpTotal');
const totalFollowersElement = document.getElementById('totalFollowers');
const starRatingElement = document.getElementById('starRating');
const simulatedRevenueElement = document.getElementById('simulatedRevenue');
const realRewardElement = document.getElementById('realReward');
const monthlyCostElement = document.getElementById('monthlyCost');
const exercisesCompletedCountElement = document.getElementById('exercisesCompletedCount');

const activityListElement = document.getElementById('activityList');
const activityHistoryListElement = document.getElementById('activityHistoryList');

const addLessonButton = document.getElementById('addLesson');
const resolveDebugButton = document.getElementById('resolveDebug');

const timerDisplayElement = document.getElementById('timerDisplay');
const startTimerButton = document.getElementById('startTimer');
const pauseTimerButton = document.getElementById('pauseTimer');
const resetTimerButton = document.getElementById('resetTimer');

const pomodoroDisplayElement = document.getElementById('pomodoroDisplay');
const startPomodoroButton = document.getElementById('startPomodoro');
const pausePomodoroButton = document.getElementById('pausePomodoro');
const resetPomodoroButton = document.getElementById('resetPomodoro');
const focusTimeInput = document.getElementById('focusTime');
const breakTimeInput = document.getElementById('breakTime');

const exercisesTableBody = document.querySelector('#exercisesTable tbody');

const newProjectNameInput = document.getElementById('newProjectName');
const createNewProjectButton = document.getElementById('createNewProject');
const activeProjectsContainer = document.getElementById('activeProjectsContainer');
const viewCompletedProjectsButton = document.getElementById('viewCompletedProjects');

const openDailyJournalButton = document.getElementById('openDailyJournal');
const resetDataButton = document.getElementById('resetData');

const journalModal = document.getElementById('journalModal');
const completedProjectsModal = document.getElementById('completedProjectsModal');
const lessonModal = document.getElementById('lessonModal');
const closeButtons = document.querySelectorAll('.modal .close-button');

const lessonTitleInput = document.getElementById('lessonTitle');
const lessonNotesTextarea = document.getElementById('lessonNotes');
const saveLessonDetailsButton = document.getElementById('saveLessonDetails');

const journalTitleInput = document.getElementById('journalTitle');
const journalEntryTextarea = document.getElementById('journalEntry');
const saveJournalEntryButton = document.getElementById('saveJournalEntry');
const journalEntriesList = document.getElementById('journalEntriesList');
const completedProjectsList = document.getElementById('completedProjectsList');

const dailyMotivationalPhraseElement = document.getElementById('dailyMotivationalPhrase');

// ===============================================
// 3. Funções de Lógica do Jogo
// ===============================================

function adjustMainContentMargin() {
    const headerHeight = headerElement.offsetHeight;
    // Define a variável CSS personalizada que será usada pelo 'main'
    document.documentElement.style.setProperty('--dashboard-height', `${headerHeight}px`);
    // O padding-top do main é definido no CSS usando essa variável
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}

// Função para verificar se a data mudou e resetar o contador diário de debugs E a receita diária de debugs
function checkAndResetDailyDebugs() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera hora, minuto, segundo, milissegundo para comparação de data

    let lastDebugDay = null;
    if (gameState.lastDebugDate) {
        lastDebugDay = new Date(gameState.lastDebugDate);
        lastDebugDay.setHours(0, 0, 0, 0);
    }

    if (!lastDebugDay || today.getTime() > lastDebugDay.getTime()) {
        console.log(`Novo dia detectado. Resetando debugs diários de ${gameState.dailyDebugsCompleted} para 0.`);
        gameState.dailyDebugsCompleted = 0;
        // Zera a receita acumulada dos debugs apenas para o dia atual
        gameState.dailyDebugRevenueAccumulated = 0;
        gameState.lastDebugDate = today.toISOString(); // Atualiza a data do último debug
        saveGameState(); // Salva o estado após o reset
    }
}

// Função para gerar e armazenar o resumo diário
function generateDailySummary() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera hora para comparação

    let lastSummaryDay = null;
    if (gameState.lastDailySummaryDate) {
        lastSummaryDay = new Date(gameState.lastDailySummaryDate);
        lastSummaryDay.setHours(0, 0, 0, 0);
    }

    // Se a data do último resumo for anterior a hoje, ou se nunca houve um resumo
    if (!lastSummaryDay || today.getTime() > lastSummaryDay.getTime()) {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1); // Pega o dia anterior para resumir

        const yesterdayActivities = gameState.activityHistory.filter(activity => {
            const activityDate = new Date(activity.dateObj);
            activityDate.setHours(0, 0, 0, 0);
            return activityDate.getTime() === yesterday.getTime();
        });

        if (yesterdayActivities.length > 0) {
            // Contagem de atividades para o resumo
            let summary = {
                lessons: 0,
                debugs: 0,
                projectsCompleted: 0,
                journalEntries: 0,
                projectActions: 0, // Para pausas/retomas de projetos
                revenueGained: 0 // A receita total que foi ganha nas atividades do dia anterior
            };

            yesterdayActivities.forEach(activity => {
                if (activity.type === 'Aula') summary.lessons++;
                else if (activity.type === 'Exercício') {
                    summary.debugs++;
                    // Para somar a receita do debug no resumo diário
                    if (activity.detail.includes('Recebeu R$')) {
                        const regex = /R\$([\d,\.]+)/;
                        const match = activity.detail.match(regex);
                        if (match && match[1]) {
                            summary.revenueGained += parseFloat(match[1].replace(',', '.'));
                        }
                    }
                }
                else if (activity.type === 'Projeto Concluído') {
                    summary.projectsCompleted++;
                    const regex = /R\$([\d,\.]+)/;
                    const match = activity.detail.match(regex);
                    if (match && match[1]) {
                        summary.revenueGained += parseFloat(match[1].replace(',', '.'));
                    }
                }
                else if (activity.type === 'Diário') summary.journalEntries++;
                else if (activity.type === 'Projeto Pausado' || activity.type === 'Projeto Retomado' || activity.type === 'Projeto Arquivado') {
                    summary.projectActions++;
                }
            });

            let summaryMessage = `Resumo de ${yesterday.toLocaleDateString('pt-BR')}: `;
            let parts = [];
            if (summary.lessons > 0) parts.push(`${summary.lessons} Aulas`);
            if (summary.debugs > 0) parts.push(`${summary.debugs} Debugs`);
            if (summary.projectsCompleted > 0) parts.push(`${summary.projectsCompleted} Projetos Concluídos`);
            if (summary.journalEntries > 0) parts.push(`${summary.journalEntries} Entradas no Diário`);
            if (summary.projectActions > 0) parts.push(`${summary.projectActions} Ações de Projeto`);
            if (summary.revenueGained > 0) parts.push(`R$${summary.revenueGained.toFixed(2).replace('.', ',')} de Receita`);

            if (parts.length > 0) {
                summaryMessage += parts.join(', ') + ".";
                addActivityToList('Resumo Diário', summaryMessage, { dailySummary: true });
            } else {
                addActivityToList('Resumo Diário', `Nenhuma atividade significativa em ${yesterday.toLocaleDateString('pt-BR')}.`, { dailySummary: true });
            }
        }
        // Atualiza a data do último resumo gerado para hoje, para não gerar novamente no mesmo dia
        gameState.lastDailySummaryDate = today.toISOString();
        saveGameState();
    }
}

// Função para atualizar a frase motivacional diária
function updateMotivationalPhrase() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let lastPhraseDay = null;
    if (gameState.lastMotivationalPhraseDate) {
        lastPhraseDay = new Date(gameState.lastMotivationalPhraseDate);
        lastPhraseDay.setHours(0, 0, 0, 0);
    }

    if (!lastPhraseDay || today.getTime() > lastPhraseDay.getTime()) {
        const randomIndex = Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length);
        gameState.currentMotivationalPhrase = MOTIVATIONAL_PHRASES[randomIndex];
        gameState.lastMotivationalPhraseDate = today.toISOString();
        saveGameState();
    }
    // Garante que o elemento seja atualizado mesmo que a frase não mude (ex: ao recarregar a página no mesmo dia)
    dailyMotivationalPhraseElement.textContent = gameState.currentMotivationalPhrase;
}


function calculateStarRating() {
    if (gameState.totalFollowers >= FOLLOWERS_FOR_10_STARS) {
        return 10;
    }
    return Math.floor((gameState.totalFollowers / FOLLOWERS_FOR_10_STARS) * 10);
}

function updateStarRatingDisplay() {
    const stars = starRatingElement.querySelectorAll('.star');
    const currentStars = calculateStarRating();

    stars.forEach((star, index) => {
        if (index < currentStars) {
            star.classList.add('filled');
            star.textContent = '★';
        } else {
            star.classList.remove('filled');
            star.textContent = '☆';
        }
    });
}

let timerInterval;
let pomodoroInterval;

function formatTime(totalSeconds, includeHours = true) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const parts = [minutes, seconds].map(v => v < 10 ? '0' + v : v);
    if (includeHours) {
        parts.unshift(hours < 10 ? '0' + hours : hours);
    }
    return parts.join(':');
}

function startTimer() {
    if (!timerInterval) {
        timerInterval = setInterval(() => {
            gameState.timerSeconds++;
            updateTimerDisplay();
            saveGameState();
        }, 1000);
    }
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    saveGameState();
}

function resetTimer() {
    pauseTimer();
    gameState.timerSeconds = 0;
    updateTimerDisplay();
    saveGameState();
}

function updateTimerDisplay() {
    timerDisplayElement.textContent = formatTime(gameState.timerSeconds);
}

function startPomodoro() {
    if (gameState.pomodoro.isRunning) return;

    gameState.pomodoro.isRunning = true;
    startPomodoroButton.textContent = gameState.pomodoro.isFocusMode ? 'Em Foco...' : 'Em Descanso...';
    startPomodoroButton.disabled = true;

    pomodoroInterval = setInterval(() => {
        gameState.pomodoro.remainingSeconds--;
        updatePomodoroDisplay();

        if (gameState.pomodoro.remainingSeconds <= 0) {
            clearInterval(pomodoroInterval);
            pomodoroInterval = null;
            gameState.pomodoro.isRunning = false;

            console.log(gameState.pomodoro.isFocusMode ? 'Tempo de FOCO terminou! Hora do descanso.' : 'Tempo de DESCANSO terminou! Hora de voltar ao foco.');

            if (gameState.pomodoro.isFocusMode) {
                gameState.pomodoro.isFocusMode = false;
                gameState.pomodoro.remainingSeconds = gameState.pomodoro.breakDuration;
                startPomodoroButton.textContent = 'Iniciar Descanso';
                startPomodoroButton.classList.remove('primary-button');
                startPomodoroButton.classList.add('secondary-button');
            } else {
                gameState.pomodoro.isFocusMode = true;
                gameState.pomodoro.remainingSeconds = gameState.pomodoro.focusDuration;
                startPomodoroButton.textContent = 'Iniciar Foco';
                startPomodoroButton.classList.remove('secondary-button');
                startPomodoroButton.classList.add('primary-button');
            }
            startPomodoroButton.disabled = false;
            updatePomodoroDisplay();
            saveGameState();
        }
        // Save state on each tick to persist timer progress
        saveGameState();
    }, 1000);
}

function pausePomodoro() {
    clearInterval(pomodoroInterval);
    pomodoroInterval = null;
    gameState.pomodoro.isRunning = false;
    startPomodoroButton.textContent = gameState.pomodoro.isFocusMode ? 'Retomar Foco' : 'Retomar Descanso';
    startPomodoroButton.disabled = false;
    saveGameState();
}

function resetPomodoro() {
    pausePomodoro();
    gameState.pomodoro.isFocusMode = true;
    gameState.pomodoro.remainingSeconds = gameState.pomodoro.focusDuration;
    startPomodoroButton.textContent = 'Iniciar Foco';
    startPomodoroButton.classList.remove('secondary-button');
    startPomodoroButton.classList.add('primary-button');
    updatePomodoroDisplay();
    saveGameState();
}

function updatePomodoroDisplay() {
    pomodoroDisplayElement.textContent = formatTime(gameState.pomodoro.remainingSeconds, false);
}

function loadPomodoroSettings() {
    const focusMin = parseInt(focusTimeInput.value);
    const breakMin = parseInt(breakTimeInput.value);

    if (!isNaN(focusMin) && focusMin > 0) {
        gameState.pomodoro.focusDuration = focusMin * 60;
    }
    if (!isNaN(breakMin) && breakMin > 0) {
        gameState.pomodoro.breakDuration = breakMin * 60;
    }

    if (!gameState.pomodoro.isRunning && gameState.pomodoro.isFocusMode) {
        gameState.pomodoro.remainingSeconds = gameState.pomodoro.focusDuration;
        updatePomodoroDisplay();
    }
    saveGameState();
}

function updateUI() {
    xpTotalElement.textContent = `${gameState.totalXP} XP`;
    totalFollowersElement.textContent = gameState.totalFollowers.toLocaleString('pt-BR');
    updateStarRatingDisplay();
    simulatedRevenueElement.textContent = `R$ ${gameState.simulatedRevenue.toFixed(2).replace('.', ',')}`;

    // === LÓGICA DE CÁLCULO DA RECOMPENSA REAL ===
    // Se a receita simulada for menor que o custo mensal, a receita líquida é 0.
    const netSimulatedRevenue = Math.max(0, gameState.simulatedRevenue - MONTHLY_COST);
    // A recompensa real é uma porcentagem da receita líquida.
    realRewardElement.textContent = `R$ ${(netSimulatedRevenue * REAL_REWARD_CONVERSION_FACTOR).toFixed(2).replace('.', ',')}`;
    // ===========================================

    monthlyCostElement.textContent = `R$ ${MONTHLY_COST.toFixed(2).replace('.', ',')}`;
    exercisesCompletedCountElement.textContent = gameState.dailyDebugsCompleted; // Mostra debugs diários aqui

    updateRecentActivityList();
    updateActivityHistoryList();
    renderExercisesTable();
    renderActiveProjects();

    focusTimeInput.value = gameState.pomodoro.focusDuration / 60;
    breakTimeInput.value = gameState.pomodoro.breakDuration / 60;
    updatePomodoroDisplay();

    updateMotivationalPhrase();
}

function addActivityToList(type, detail, extraData = {}) {
    const now = new Date();
    const dateString = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const activity = {
        type: type,
        detail: detail,
        timestamp: `${dateString} ${timeString}`,
        dateObj: now.toISOString(), // Mantém a data completa para filtragem e ordenação
        ...extraData
    };

    // Adiciona ao histórico completo
    gameState.activityHistory.unshift(activity);

    // Atualiza atividades recentes
    // Filtra atividades que não são resumos diários para a lista de "Atividade Recente"
    // e pega as 5 mais recentes
    const MAX_RECENT_ACTIVITIES_DISPLAY = 5;
    gameState.recentActivities = gameState.activityHistory.filter(act => !act.dailySummary).slice(0, MAX_RECENT_ACTIVITIES_DISPLAY);

    updateRecentActivityList();
    // Não chama updateActivityHistoryList aqui pois ela será chamada por updateUI
}

function updateRecentActivityList() {
    activityListElement.innerHTML = '';
    // Filtra atividades que não são resumos diários para a lista de "Atividade Recente"
    const recentActivitiesForDisplay = gameState.activityHistory.filter(act => !act.dailySummary);

    if (recentActivitiesForDisplay.length === 0) {
        activityListElement.innerHTML = '<li>Nenhuma atividade recente.</li>';
        return;
    }
    const displayLimit = 5; // Limite de 5 atividades recentes
    recentActivitiesForDisplay.slice(0, displayLimit).forEach(activity => {
        const listItem = document.createElement('li');
        let displayDetail = activity.detail;
        if (activity.type === 'Aula' && activity.lessonTitle) {
            displayDetail = `Aula: "${activity.lessonTitle}"` + (activity.lessonNotes ? ` (Anotações: "${activity.lessonNotes.substring(0, 50)}...")` : '');
        } else if (activity.type === 'Diário' && activity.journalTitle) {
            displayDetail = `Diário: "${activity.journalTitle}"`;
        } else if (activity.type === 'Sistema' && activity.systemMessage) {
            displayDetail = activity.detail; // Não adiciona prefixo
        }
        listItem.innerHTML = `<span>${activity.type}:</span> ${displayDetail} (${activity.timestamp})`;
        activityListElement.appendChild(listItem);
    });
}

function updateActivityHistoryList() {
    activityHistoryListElement.innerHTML = '';
    if (gameState.activityHistory.length === 0) {
        activityHistoryListElement.innerHTML = '<p class="no-activities-message">Nenhuma atividade registrada ainda.</p>';
        return;
    }

    // Sort activities by date in descending order
    const sortedActivities = [...gameState.activityHistory].sort((a, b) => {
        // Garante que 'dateObj' seja um objeto Date para a comparação
        const dateA = typeof a.dateObj === 'string' ? new Date(a.dateObj) : a.dateObj;
        const dateB = typeof b.dateObj === 'string' ? new Date(b.dateObj) : b.dateObj;
        return dateB - dateA;
    });

    sortedActivities.forEach(activity => {
        const listItem = document.createElement('li');
        listItem.classList.add('activity-item');
        if (activity.dailySummary) {
            listItem.classList.add('daily-summary-item'); // Adiciona classe para estilização de resumo
        }

        let activityDetail = activity.detail;
        if (activity.type === 'Aula' && activity.lessonTitle) {
            activityDetail = `Aula: "${activity.lessonTitle}"` + (activity.lessonNotes ? ` - Anotações: "${activity.lessonNotes.substring(0, 50)}..."` : '');
        } else if (activity.type === 'Diário' && activity.journalTitle) {
            activityDetail = `Diário: "${activity.journalTitle}"`;
        } else if (activity.type === 'Sistema') { // 'systemMessage' não é uma propriedade universal, use 'type'
            activityDetail = activity.detail;
        }

        listItem.innerHTML = `
            <span>${activity.type}: ${activityDetail}</span>
            <span class="activity-date">${activity.timestamp}</span>
        `;
        activityHistoryListElement.appendChild(listItem);
    });
}

function saveGameState() {
    localStorage.setItem('gamificationGameState', JSON.stringify(gameState));
}

function loadGameState() {
    const savedState = localStorage.getItem('gamificationGameState');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            // Mescla o estado salvo com o estado padrão, garantindo que novas propriedades sejam inicializadas
            gameState = {
                ...gameState,
                ...parsedState,
                // Garante que sub-objetos críticos sejam mesclados corretamente ou inicializados
                pomodoro: { ...gameState.pomodoro, ...(parsedState.pomodoro || {}) },
                exercisesPerWeek: { ...gameState.exercisesPerWeek, ...(parsedState.exercisesPerWeek || {}) },
                dailyActivitySummary: { ...gameState.dailyActivitySummary, ...(parsedState.dailyActivitySummary || {}) },
            };

            // Correções de tipo e valores padrão para arrays que podem ter sido nulos/undefined
            if (!Array.isArray(gameState.recentActivities)) {
                gameState.recentActivities = [];
            }
            if (!Array.isArray(gameState.activityHistory)) {
                gameState.activityHistory = [];
            } else {
                // Converte dateObj para objeto Date se for string ISO para operações de data
                gameState.activityHistory.forEach(activity => {
                    if (typeof activity.dateObj === 'string' && !isNaN(new Date(activity.dateObj))) {
                        activity.dateObj = new Date(activity.dateObj);
                    } else if (!(activity.dateObj instanceof Date)) {
                        activity.dateObj = new Date(); // Fallback seguro
                    }
                });
            }

            if (!Array.isArray(gameState.activeProjects)) {
                gameState.activeProjects = [];
            }
            if (!Array.isArray(gameState.completedProjects)) {
                gameState.completedProjects = [];
            }
            if (!Array.isArray(gameState.journalEntries)) {
                gameState.journalEntries = [];
            }
            if (!Array.isArray(gameState.lessonEntries)) {
                gameState.lessonEntries = [];
            }

            // Inicializações para novas propriedades que podem não existir em estados salvos antigos
            if (typeof gameState.dailyDebugsCompleted === 'undefined') {
                gameState.dailyDebugsCompleted = 0;
            }
            if (typeof gameState.lastDebugDate === 'undefined') {
                gameState.lastDebugDate = null;
            }
            if (typeof gameState.dailyDebugRevenueAccumulated === 'undefined') { // NOVO
                gameState.dailyDebugRevenueAccumulated = 0;
            }
            if (typeof gameState.lastDailySummaryDate === 'undefined') {
                gameState.lastDailySummaryDate = null;
            }
            if (typeof gameState.currentMotivationalPhrase === 'undefined') {
                gameState.currentMotivationalPhrase = "";
            }
            if (typeof gameState.lastMotivationalPhraseDate === 'undefined') {
                gameState.lastMotivationalPhraseDate = null;
            }

        } catch (e) {
            console.error("Erro ao carregar gameState do localStorage:", e);
            // Em caso de erro grave na leitura, limpa o localStorage para evitar problemas futuros
            localStorage.removeItem('gamificationGameState');
            // Recarrega a página para iniciar com o estado padrão limpo
            location.reload();
        }
    }
}

/**
 * Recalcula todas as métricas do jogo com base nos contadores primários.
 */
function recalculateMetrics() {
    // XP
    let xpTeoricoTotal = gameState.lessonsCompleted * XP_PER_LESSON;
    let xpBonusTotal = gameState.projectsCompleted * XP_BONUS_PER_PROJECT;
    gameState.totalXP = xpTeoricoTotal + xpBonusTotal;

    // Seguidores
    let followersXP = Math.floor(gameState.totalXP / 1000) * FOLLOWERS_PER_1000_XP;
    let followersBonusTotal = gameState.projectsCompleted * FOLLOWERS_BONUS_PER_PROJECT;
    gameState.totalFollowers = followersXP + followersBonusTotal;
}

function renderExercisesTable() {
    exercisesTableBody.innerHTML = '';

    const weeklyData = Object.entries(gameState.exercisesPerWeek)
        .sort(([weekA], [weekB]) => weekA.localeCompare(weekB));

    if (weeklyData.length === 0) {
        const row = exercisesTableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 2;
        cell.textContent = 'Nenhum exercício registrado por semana.';
        cell.style.textAlign = 'center';
        return;
    }

    weeklyData.forEach(([week, count]) => {
        const row = exercisesTableBody.insertRow();
        const weekCell = row.insertCell();
        const countCell = row.insertCell();

        weekCell.textContent = week;
        countCell.textContent = count;
    });
}

// ===============================================
// 4. Lógica de Gerenciamento de Projetos
// ===============================================

function createNewProject() {
    const projectName = newProjectNameInput.value.trim();
    if (projectName) {
        const newProject = {
            id: Date.now(),
            name: projectName,
            status: 'Em Andamento',
            startDate: new Date().toLocaleDateString('pt-BR'),
            lastUpdate: new Date().toLocaleDateString('pt-BR')
        };
        gameState.activeProjects.push(newProject);
        newProjectNameInput.value = '';
        saveGameState();
        renderActiveProjects();
        addActivityToList('Projeto Criado', `Novo projeto: "${projectName}"`);
    } else {
        alert('Por favor, digite um nome para o projeto.'); // Usar alert para feedback ao usuário
    }
}

function renderActiveProjects() {
    activeProjectsContainer.innerHTML = '';
    if (gameState.activeProjects.length === 0) {
        activeProjectsContainer.innerHTML = '<p class="no-projects-message">Nenhum projeto ativo.</p>';
        return;
    }

    gameState.activeProjects.forEach(project => {
        const projectCard = document.createElement('div');
        projectCard.classList.add('active-project-card');
        projectCard.innerHTML = `
            <h4>${project.name}</h4>
            <p class="project-status">Status: ${project.status} <br>
            Início: ${project.startDate} <br>
            Última Atualização: ${project.lastUpdate}</p>
            <div class="project-buttons">
                ${project.status === 'Em Andamento' ? `<button class="pause" data-id="${project.id}">Pausar</button>` : ''}
                ${project.status === 'Pausado' ? `<button class="resume" data-id="${project.id}">Retomar</button>` : ''}
                <button class="complete" data-id="${project.id}">Concluir</button>
                <button class="archive" data-id="${project.id}">Arquivar</button>
            </div>
        `;
        activeProjectsContainer.appendChild(projectCard);
    });

    activeProjectsContainer.querySelectorAll('.project-buttons button').forEach(button => {
        button.addEventListener('click', (event) => {
            const projectId = parseInt(event.target.dataset.id);
            const project = gameState.activeProjects.find(p => p.id === projectId);
            if (!project) return;

            const action = event.target.classList[0]; // 'pause', 'resume', 'complete', 'archive'
            project.lastUpdate = new Date().toLocaleDateString('pt-BR');

            if (action === 'pause') {
                project.status = 'Pausado';
                addActivityToList('Projeto Pausado', `"${project.name}" foi pausado.`);
            } else if (action === 'resume') {
                project.status = 'Em Andamento';
                addActivityToList('Projeto Retomado', `"${project.name}" foi retomado.`);
            } else if (action === 'complete') {
                // Remove de projetos ativos
                gameState.activeProjects = gameState.activeProjects.filter(p => p.id !== projectId);
                // Adiciona a projetos concluídos
                project.status = 'Concluído';
                project.completionDate = new Date().toLocaleDateString('pt-BR');
                gameState.completedProjects.push(project);

                // Recompensas por projeto
                gameState.projectsCompleted++;
                gameState.totalXP += XP_BONUS_PER_PROJECT;
                gameState.totalFollowers += FOLLOWERS_BONUS_PER_PROJECT;
                gameState.simulatedRevenue += REVENUE_PER_PROJECT; // Adiciona ao acumulado total de receita
                addActivityToList('Projeto Concluído', `"${project.name}" concluído! Ganhou ${XP_BONUS_PER_PROJECT} XP, ${FOLLOWERS_BONUS_PER_PROJECT} seguidores e R$${REVENUE_PER_PROJECT.toFixed(2).replace('.', ',')}.`);
            } else if (action === 'archive') {
                // Remove de projetos ativos sem adicionar a concluídos
                gameState.activeProjects = gameState.activeProjects.filter(p => p.id !== projectId);
                addActivityToList('Projeto Arquivado', `"${project.name}" foi arquivado.`);
            }

            saveGameState();
            recalculateMetrics(); // Recalcula XP e seguidores após qualquer alteração no projeto
            updateUI();
        });
    });
}

function renderCompletedProjects() {
    completedProjectsList.innerHTML = '';
    if (gameState.completedProjects.length === 0) {
        completedProjectsList.innerHTML = '<p class="no-projects-message">Nenhum projeto concluído ainda.</p>';
        return;
    }
    gameState.completedProjects.forEach(project => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${project.name}</strong> - Concluído em ${project.completionDate} (Início: ${project.startDate})`;
        completedProjectsList.appendChild(listItem);
    });
}

// ===============================================
// 5. Funções de Eventos (Event Listeners)
// ===============================================

// Event Listener para adicionar aula
addLessonButton.addEventListener('click', () => {
    lessonTitleInput.value = '';
    lessonNotesTextarea.value = '';
    lessonModal.style.display = 'block';
});

saveLessonDetailsButton.addEventListener('click', () => {
    const title = lessonTitleInput.value.trim();
    const notes = lessonNotesTextarea.value.trim();

    if (title) {
        gameState.lessonsCompleted++;
        gameState.totalXP += XP_PER_LESSON;
        gameState.lessonEntries.push({ title, notes, date: new Date().toISOString() });
        addActivityToList('Aula', `Aula "${title}" concluída.`, { lessonTitle: title, lessonNotes: notes });
        recalculateMetrics();
        saveGameState();
        updateUI();
        lessonModal.style.display = 'none';
    } else {
        alert('O título da aula não pode estar vazio.');
    }
});

// Nova função para calcular o total de receita dado um número de debugs (para o dia atual)
function calculateTotalDebugRevenueForDailyCount(numDebugs) {
    let totalRevenue = 0;

    // Se o número de debugs é menor ou igual a 50
    if (numDebugs <= 50) {
        if (numDebugs >= 50) {
            totalRevenue = REWARD_FOR_FIRST_50; // Para 50 debugs, total é R$150
        } else if (numDebugs >= 30) {
            totalRevenue = REWARD_FOR_FIRST_30; // Para 30-49 debugs, total é R$50
        }
    } else {
        // Para mais de 50 debugs, aplicamos a lógica de blocos
        const numFiftyBlocks = Math.floor(numDebugs / 50);
        totalRevenue += numFiftyBlocks * REWARD_FOR_FIRST_50; // Cada bloco de 50 vale R$150

        const remainingDebugs = numDebugs % 50;

        // Se sobrou algum debug após os blocos de 50
        if (remainingDebugs > 0) {
            // E se o restante cobrir um "bloco" de 30
            if (remainingDebugs >= 30) {
                totalRevenue += REWARD_FOR_NEXT_30_AFTER_50; // Adiciona R$30 por esse bloco residual de 30
            }
        }
    }
    return totalRevenue;
}

// Event Listener para resolver debug
resolveDebugButton.addEventListener('click', () => {
    gameState.exercisesCompleted++;     // Contador geral de debugs (todos os tempos)
    gameState.dailyDebugsCompleted++;   // Contador diário de debugs

    const currentWeek = getWeekNumber(new Date());
    gameState.exercisesPerWeek[currentWeek] = (gameState.exercisesPerWeek[currentWeek] || 0) + 1;

    let debugRewardToAdd = 0;
    let rewardMessage = '';

    // Calcula a receita total que DEVERIA ter sido acumulada pelos debugs do DIA ATUAL
    const totalRevenueExpectedForDailyDebugs = calculateTotalDebugRevenueForDailyCount(gameState.dailyDebugsCompleted);

    // A recompensa a adicionar é a diferença entre o que deveria ter sido acumulado NO DIA e o que já foi acumulado NO DIA
    debugRewardToAdd = totalRevenueExpectedForDailyDebugs - gameState.dailyDebugRevenueAccumulated;

    // Garante que não adicione valores negativos ou zero desnecessariamente
    if (debugRewardToAdd < 0) {
        debugRewardToAdd = 0; // Não deve acontecer com a lógica correta, mas é um safeguard
        console.warn("Receita a adicionar negativa, ajustado para zero. Verifique a lógica ou estado salvo.");
    }

    if (debugRewardToAdd > 0) {
        // Adiciona ao total acumulado de receita (de todos os tempos)
        gameState.simulatedRevenue += debugRewardToAdd;
        // Acumula a receita de debugs apenas para o dia atual
        gameState.dailyDebugRevenueAccumulated += debugRewardToAdd;
        rewardMessage = ` Recebeu R$${debugRewardToAdd.toFixed(2).replace('.', ',')} por debugs.`;
    }

    addActivityToList('Exercício', `Debug resolvido! Total de debugs diários: ${gameState.dailyDebugsCompleted}.` + (rewardMessage || ''));
    saveGameState();
    recalculateMetrics(); // Para atualizar os followers, caso XP mude (embora debugs não deem XP diretamente)
    updateUI();
});


// Event Listeners do Cronômetro
startTimerButton.addEventListener('click', startTimer);
pauseTimerButton.addEventListener('click', pauseTimer);
resetTimerButton.addEventListener('click', resetTimer);

// Event Listeners do Pomodoro
startPomodoroButton.addEventListener('click', startPomodoro);
pausePomodoroButton.addEventListener('click', pausePomodoro);
resetPomodoroButton.addEventListener('click', resetPomodoro);
focusTimeInput.addEventListener('change', loadPomodoroSettings);
breakTimeInput.addEventListener('change', loadPomodoroSettings);


// Event Listener para criar novo projeto
createNewProjectButton.addEventListener('click', createNewProject);
viewCompletedProjectsButton.addEventListener('click', () => {
    renderCompletedProjects();
    completedProjectsModal.style.display = 'block';
});

// Event Listeners do Diário
openDailyJournalButton.addEventListener('click', () => {
    journalTitleInput.value = `Diário de ${new Date().toLocaleDateString('pt-BR')}`;
    journalEntryTextarea.value = '';
    renderJournalEntries(); // Renderiza as entradas existentes ao abrir o diário
    journalModal.style.display = 'block';
});

saveJournalEntryButton.addEventListener('click', () => {
    const title = journalTitleInput.value.trim();
    const entry = journalEntryTextarea.value.trim();
    if (entry) {
        gameState.journalEntries.push({ title, entry, date: new Date().toISOString() });
        addActivityToList('Diário', `Nova entrada de diário: "${title}"`, { journalTitle: title });
        saveGameState();
        renderJournalEntries();
        journalModal.style.display = 'none';
    } else {
        alert('A entrada do diário não pode estar vazia.');
    }
});

function renderJournalEntries() {
    journalEntriesList.innerHTML = '';
    if (gameState.journalEntries.length === 0) {
        journalEntriesList.innerHTML = '<p>Nenhuma entrada no diário ainda.</p>';
        return;
    }
    // Mostra as entradas mais recentes primeiro
    [...gameState.journalEntries].reverse().forEach(entry => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${entry.title}</strong> (${new Date(entry.date).toLocaleDateString('pt-BR')})
            <p>${entry.entry}</p>
        `;
        journalEntriesList.appendChild(listItem);
    });
}

// Fechar modais
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        button.closest('.modal').style.display = 'none';
    });
});

// Fechar modais clicando fora
window.addEventListener('click', (event) => {
    if (event.target === journalModal) {
        journalModal.style.display = 'none';
    }
    if (event.target === completedProjectsModal) {
        completedProjectsModal.style.display = 'none';
    }
    if (event.target === lessonModal) {
        lessonModal.style.display = 'none';
    }
});


// Resetar Dados
resetDataButton.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja resetar todos os dados? Esta ação é irreversível.')) {
        localStorage.removeItem('gamificationGameState');
        location.reload(); // Recarrega a página para resetar o estado do jogo
    }
});


// ===============================================
// 6. Inicialização do Jogo
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    // Garante que o reset de debugs diários e recompensas ocorra no início de um novo dia
    checkAndResetDailyDebugs();
    generateDailySummary(); // Gera o resumo diário ao carregar a página (se for um novo dia)
    recalculateMetrics(); // Garante que as métricas calculadas estejam atualizadas ao carregar
    updateUI(); // Atualiza a interface com o estado carregado ou padrão
    adjustMainContentMargin(); // Ajusta a margem do conteúdo principal
    window.addEventListener('resize', adjustMainContentMargin); // Ajusta a margem ao redimensionar a janela

    // Se o pomodoro estava rodando ao recarregar, reinicie-o
    if (gameState.pomodoro.isRunning && gameState.pomodoro.remainingSeconds > 0) {
        // Ajusta o texto do botão com base no modo
        startPomodoroButton.textContent = gameState.pomodoro.isFocusMode ? 'Em Foco...' : 'Em Descanso...';
        startPomodoroButton.disabled = true; // Desabilita o botão para evitar múltiplos intervalos
        // Reinicia o intervalo do pomodoro
        pomodoroInterval = setInterval(() => {
            gameState.pomodoro.remainingSeconds--;
            updatePomodoroDisplay();
            if (gameState.pomodoro.remainingSeconds <= 0) {
                clearInterval(pomodoroInterval);
                pomodoroInterval = null;
                gameState.pomodoro.isRunning = false;
                if (gameState.pomodoro.isFocusMode) {
                    gameState.pomodoro.isFocusMode = false;
                    gameState.pomodoro.remainingSeconds = gameState.pomodoro.breakDuration;
                    startPomodoroButton.textContent = 'Iniciar Descanso';
                    startPomodoroButton.classList.remove('primary-button');
                    startPomodoroButton.classList.add('secondary-button');
                } else {
                    gameState.pomodoro.isFocusMode = true;
                    gameState.pomodoro.remainingSeconds = gameState.pomodoro.focusDuration;
                    startPomodoroButton.textContent = 'Iniciar Foco';
                    startPomodoroButton.classList.remove('secondary-button');
                    startPomodoroButton.classList.add('primary-button');
                }
                startPomodoroButton.disabled = false;
                updatePomodoroDisplay();
                saveGameState();
            }
            saveGameState(); // Salva o estado a cada segundo para persistir o progresso do timer
        }, 1000);
    } else {
        // Se o pomodoro não estava rodando ou já terminou, garante que o display e o botão estejam corretos
        gameState.pomodoro.isRunning = false; // Garante que o estado seja false
        startPomodoroButton.textContent = gameState.pomodoro.isFocusMode ? 'Iniciar Foco' : 'Iniciar Descanso';
        startPomodoroButton.classList.remove('secondary-button');
        startPomodoroButton.classList.add('primary-button');
        startPomodoroButton.disabled = false;
        // Garante que o remainingSeconds esteja correto ao carregar (se não estava rodando)
        if (gameState.pomodoro.remainingSeconds === 0) {
            gameState.pomodoro.remainingSeconds = gameState.pomodoro.focusDuration;
        }
        updatePomodoroDisplay();
    }
});