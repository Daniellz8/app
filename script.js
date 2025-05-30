// ===============================================
// 1. Definição das Variáveis e Constantes Globais
// ===============================================

// Constantes de Ganho (conforme sua especificação)
const XP_PER_LESSON = 100;
const XP_BONUS_PER_PROJECT = 1000;
const FOLLOWERS_PER_1000_XP = 42;
const FOLLOWERS_BONUS_PER_PROJECT = 50;
const REVENUE_PER_PROJECT = 300;
const EXERCISE_REVENUE_PER_30_DEBUG = 30; // Corrigido para 30 (era 50)
const EXERCISE_REVENUE_PER_50_DEBUG = 50; // Corrigido para 50 (era 150)
const MONTHLY_COST = 600;
const REAL_REWARD_CONVERSION_FACTOR = 0.2; // 200/1000 = 0.2 -> 20% da receita líquida.
const FOLLOWERS_FOR_10_STARS = 3086; // Meta para 10 estrelas

// Frases motivacionais (Novidade!)
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
    "A vida é uma jornada, não um destino.",
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
    dailyDebugsCompleted: 0, // Debugs feitos no dia atual
    lastDebugDate: null,      // Data do último debug registrado (para reset diário)
    exercisesCompleted: 0, // Contador total de debugs de todos os tempos (não foi modificado, mantido como antes)
    projectsCompleted: 0,
    simulatedRevenue: 0, // Receita total simulada (acumulativa)
    totalFollowers: 0,
    recentActivities: [], // Atividades da dashboard (limite para exibição)
    activityHistory: [], // Histórico COMPLETO de todas as atividades
    dailyActivitySummary: {}, // NOVO: Armazena um resumo das atividades por dia
    lastDailySummaryDate: null, // NOVO: Data da última vez que o resumo diário foi gerado
    timerSeconds: 0, // Tempo do cronômetro em segundos
    pomodoro: {
        isRunning: false,
        isFocusMode: true,
        remainingSeconds: 0,
        focusDuration: 25 * 60, // 25 minutos em segundos
        breakDuration: 5 * 60 // 5 minutos em segundos
    },
    exercisesPerWeek: {}, // Armazena exercícios concluídos por semana (formato 'YYYY-WW')
    activeProjects: [], // Lista de projetos em andamento/pausados
    completedProjects: [], // Lista de projetos concluídos
    journalEntries: [], // Entradas do diário
    lessonEntries: [], // Entradas de aulas teóricas com título e anotações
    dailyDebugRewardsPaid: { // Quais marcos foram pagos no dia atual
        hasPaid30: false,
        hasPaid50: false
    },
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

// NOVO: Elemento para a seção de frases motivacionais (já está no HTML, apenas obtenha a referência)
const dailyMotivationalPhraseElement = document.getElementById('dailyMotivationalPhrase');

// ===============================================
// 3. Funções de Lógica do Jogo
// ===============================================

function adjustMainContentMargin() {
    const headerHeight = headerElement.offsetHeight;
    mainContentElement.style.marginTop = `${headerHeight + 25}px`;
}

function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}

// Função para verificar se a data mudou e resetar o contador diário de debugs E as recompensas pagas
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
        gameState.dailyDebugRewardsPaid = { hasPaid30: false, hasPaid50: false };
        gameState.lastDebugDate = today.toISOString(); // Atualiza a data do último debug
        saveGameState(); // Salva o estado após o reset
    }
}

// NOVO: Função para gerar e armazenar o resumo diário
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
                revenueGained: 0
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

// NOVO: Função para atualizar a frase motivacional diária
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

    updateMotivationalPhrase(); // NOVO: Atualiza a frase motivacional
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
    updateActivityHistoryList();
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
    const sortedActivities = [...gameState.activityHistory].sort((a, b) => new Date(b.dateObj) - new Date(a.dateObj));

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
        } else if (activity.type === 'Sistema' && activity.systemMessage) {
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
                dailyDebugRewardsPaid: { ...gameState.dailyDebugRewardsPaid, ...(parsedState.dailyDebugRewardsPaid || {}) },
                exercisesPerWeek: { ...gameState.exercisesPerWeek, ...(parsedState.exercisesPerWeek || {}) },
                dailyActivitySummary: { ...gameState.dailyActivitySummary, ...(parsedState.dailyActivitySummary || {}) }, // NOVO
            };


            // Correções de tipo e valores padrão para arrays que podem ter sido nulos/undefined
            if (!Array.isArray(gameState.recentActivities)) {
                gameState.recentActivities = [];
            }
            if (!Array.isArray(gameState.activityHistory)) {
                gameState.activityHistory = [];
            } else {
                // Converte dateObj para objeto Date se for string ISO
                gameState.activityHistory.forEach(activity => {
                    if (typeof activity.dateObj === 'string' && !isNaN(new Date(activity.dateObj))) {
                        activity.dateObj = new Date(activity.dateObj);
                    } else if (!(activity.dateObj instanceof Date)) {
                        activity.dateObj = new Date(); // Fallback
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
            if (typeof gameState.dailyDebugRewardsPaid.hasPaid30 === 'undefined') {
                gameState.dailyDebugRewardsPaid.hasPaid30 = false;
            }
            if (typeof gameState.dailyDebugRewardsPaid.hasPaid50 === 'undefined') {
                gameState.dailyDebugRewardsPaid.hasPaid50 = false;
            }
            if (typeof gameState.lastDailySummaryDate === 'undefined') { // NOVO
                gameState.lastDailySummaryDate = null;
            }
            if (typeof gameState.currentMotivationalPhrase === 'undefined') { // NOVO
                gameState.currentMotivationalPhrase = "";
            }
            if (typeof gameState.lastMotivationalPhraseDate === 'undefined') { // NOVO
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
        console.log('Por favor, digite um nome para o projeto.');
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

            const action = event.target.classList[0];
            project.lastUpdate = new Date().toLocaleDateString('pt-BR');

            if (action === 'pause') {
                project.status = 'Pausado';
                addActivityToList('Projeto Pausado', `"${project.name}" foi pausado.`);
            } else if (action === 'resume') {
                project.status = 'Em Andamento';
                addActivityToList('Projeto Retomado', `"${project.name}" foi retomado.`);
            } else if (action === 'complete') {
                project.status = 'Concluído';
                gameState.projectsCompleted++;
                gameState.simulatedRevenue += REVENUE_PER_PROJECT; // Adiciona receita do projeto aqui
                recalculateMetrics(); // Recalcula XP e seguidores
                addActivityToList('Projeto Concluído', `"${project.name}" concluído! Recebeu R$${REVENUE_PER_PROJECT.toFixed(2).replace('.', ',')}`);

                gameState.completedProjects.push(project);
                gameState.activeProjects = gameState.activeProjects.filter(p => p.id !== projectId); // Remove dos ativos

            } else if (action === 'archive') {
                // Ao arquivar, move diretamente para completedProjects como "Arquivado"
                project.status = 'Arquivado';
                addActivityToList('Projeto Arquivado', `"${project.name}" foi arquivado.`);
                gameState.completedProjects.push(project);
                gameState.activeProjects = gameState.activeProjects.filter(p => p.id !== projectId); // Remove dos ativos
            }
            saveGameState();
            updateUI(); // Atualiza a interface
        });
    });
}


function renderCompletedProjects() {
    completedProjectsList.innerHTML = '';
    if (gameState.completedProjects.length === 0) {
        completedProjectsList.innerHTML = '<p>Nenhum projeto concluído ou arquivado.</p>';
        return;
    }
    gameState.completedProjects.forEach(project => {
        const listItem = document.createElement('li');
        listItem.textContent = `${project.name} (Status: ${project.status}) - Concluído em: ${project.lastUpdate}`;
        completedProjectsList.appendChild(listItem);
    });
}

// ===============================================
// 5. Funções do Diário de Bordo
// ===============================================

function renderJournalEntries() {
    journalEntriesList.innerHTML = '';
    if (gameState.journalEntries.length === 0) {
        journalEntriesList.innerHTML = '<p>Nenhuma entrada no diário ainda.</p>';
        return;
    }
    // Ordenar as entradas do diário pela data mais recente primeiro
    const sortedEntries = [...gameState.journalEntries].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedEntries.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <strong>${entry.title}</strong>
            <span class="journal-date">${new Date(entry.date).toLocaleDateString('pt-BR')} ${new Date(entry.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
            <p>${entry.entry}</p>
            <button class="delete-journal-entry" data-id="${entry.id}">Excluir</button>
        `;
        journalEntriesList.appendChild(listItem);
    });

    // Adicionar event listeners para os botões de exclusão
    document.querySelectorAll('.delete-journal-entry').forEach(button => {
        button.addEventListener('click', (event) => {
            const entryIdToDelete = parseInt(event.target.dataset.id);
            gameState.journalEntries = gameState.journalEntries.filter(entry => entry.id !== entryIdToDelete);
            saveGameState();
            renderJournalEntries(); // Atualiza a lista no modal
            updateUI(); // Atualiza outras partes da UI se necessário
        });
    });
}

// ===============================================
// 6. Funções de Eventos
// ===============================================

addLessonButton.addEventListener('click', () => {
    lessonModal.style.display = 'block';
    lessonTitleInput.value = ''; // Limpa campos
    lessonNotesTextarea.value = '';
});

saveLessonDetailsButton.addEventListener('click', () => {
    const lessonTitle = lessonTitleInput.value.trim();
    const lessonNotes = lessonNotesTextarea.value.trim();

    gameState.lessonsCompleted++;
    recalculateMetrics(); // Recalcula XP e seguidores

    const activityDetail = `Concluiu uma aula teórica. ${lessonTitle ? `Título: "${lessonTitle}"` : ''}`;
    addActivityToList('Aula', activityDetail, { lessonTitle, lessonNotes });
    gameState.lessonEntries.push({ id: Date.now(), title: lessonTitle, notes: lessonNotes, date: new Date().toISOString() });

    saveGameState();
    updateUI();
    lessonModal.style.display = 'none';
});

resolveDebugButton.addEventListener('click', () => {
    gameState.dailyDebugsCompleted++;
    gameState.exercisesCompleted++; // Contador total de debugs
    recalculateMetrics(); // Recalcula XP e seguidores

    const currentWeek = getWeekNumber(new Date());
    gameState.exercisesPerWeek[currentWeek] = (gameState.exercisesPerWeek[currentWeek] || 0) + 1;

    let debugReward = 0;
    let rewardMessage = '';

    // Verifica recompensas por marcos diários
    if (gameState.dailyDebugsCompleted >= 30 && !gameState.dailyDebugRewardsPaid.hasPaid30) {
        debugReward += EXERCISE_REVENUE_PER_30_DEBUG;
        gameState.dailyDebugRewardsPaid.hasPaid30 = true;
        rewardMessage += ` Recebeu R$${EXERCISE_REVENUE_PER_30_DEBUG.toFixed(2).replace('.', ',')} (30 debugs).`;
    }
    if (gameState.dailyDebugsCompleted >= 50 && !gameState.dailyDebugRewardsPaid.hasPaid50) {
        debugReward += EXERCISE_REVENUE_PER_50_DEBUG;
        gameState.dailyDebugRewardsPaid.hasPaid50 = true;
        rewardMessage += ` Recebeu R$${EXERCISE_REVENUE_PER_50_DEBUG.toFixed(2).replace('.', ',')} (50 debugs).`;
    }

    if (debugReward > 0) {
        gameState.simulatedRevenue += debugReward;
        addActivityToList('Exercício', `Debug resolvido!${rewardMessage}`);
    } else {
        addActivityToList('Exercício', 'Debug resolvido!');
    }

    saveGameState();
    updateUI();
});

startTimerButton.addEventListener('click', startTimer);
pauseTimerButton.addEventListener('click', pauseTimer);
resetTimerButton.addEventListener('click', resetTimer);

startPomodoroButton.addEventListener('click', startPomodoro);
pausePomodoroButton.addEventListener('click', pausePomodoro);
resetPomodoroButton.addEventListener('click', resetPomodoro);

focusTimeInput.addEventListener('change', loadPomodoroSettings);
breakTimeInput.addEventListener('change', loadPomodoroSettings);

createNewProjectButton.addEventListener('click', createNewProject);
viewCompletedProjectsButton.addEventListener('click', () => {
    completedProjectsModal.style.display = 'block';
    renderCompletedProjects();
});

openDailyJournalButton.addEventListener('click', () => {
    journalModal.style.display = 'block';
    renderJournalEntries();
});

saveJournalEntryButton.addEventListener('click', () => {
    const journalTitle = journalTitleInput.value.trim();
    const journalEntry = journalEntryTextarea.value.trim();
    if (journalTitle && journalEntry) {
        gameState.journalEntries.push({
            id: Date.now(),
            title: journalTitle,
            entry: journalEntry,
            date: new Date().toISOString()
        });
        addActivityToList('Diário', `Nova entrada no diário: "${journalTitle}"`);
        journalTitleInput.value = '';
        journalEntryTextarea.value = '';
        saveGameState();
        renderJournalEntries();
        updateUI();
    } else {
        alert('Por favor, preencha o título e o conteúdo do diário.');
    }
});


resetDataButton.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja reiniciar TODOS os dados? Esta ação é irreversível!')) {
        localStorage.removeItem('gamificationGameState');
        // Recarrega a página para reiniciar o estado
        location.reload();
    }
});


// Fechar modais
closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.target.closest('.modal').style.display = 'none';
    });
});

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

// ===============================================
// 7. Inicialização
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    // Verifica e reseta debugs diários e recompensas pagas ANTES de atualizar a UI
    checkAndResetDailyDebugs();
    // Gera o resumo diário (se for um novo dia)
    generateDailySummary();
    // Atualiza a frase motivacional diária (se for um novo dia ou primeira carga)
    updateMotivationalPhrase();

    recalculateMetrics(); // Garante que XP e seguidores estejam corretos ao carregar
    updateUI(); // Atualiza toda a interface com os dados carregados/resetados
    adjustMainContentMargin(); // Ajusta a margem do conteúdo principal
    updateTimerDisplay(); // Garante que o timer display esteja correto ao carregar
});

// Ajusta a margem do conteúdo principal se a janela for redimensionada
window.addEventListener('resize', adjustMainContentMargin);

// Listener para Service Worker (já deve estar no seu index.html ou em outro lugar)
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', function() {
//         navigator.serviceWorker.register('service-worker.js')
//             .then(reg => console.log('Service Worker Registrado!', reg))
//             .catch(err => console.log('Erro ao registrar Service Worker:', err));
//     });
// }