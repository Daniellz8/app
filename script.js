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
const REAL_REWARD_CONVERSION_FACTOR = 0.2; // 200/1000 = 0.2
const FOLLOWERS_FOR_10_STARS = 3086; // Meta para 10 estrelas

// Frases motivacionais (Novidade!)
const MOTIVATIONAL_PHRASES = [
    "A persistência realiza o impossível.",
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "Não espere por oportunidades, crie-as.",
    "Acredite em você e tudo será possível.",
    "O único lugar onde o sucesso vem antes do trabalho é no dicionário.",
    "Transforme seus limites em novas possibilidades.",
    "O futuro pertence àqueles que acreditam na beleza de seus sonhos.",
    "Seja a mudança que você deseja ver no mundo da programação.",
    "Pequenos passos todos os dias levam a grandes resultados.",
    "Codifique hoje o futuro que você quer viver amanhã."
];

// Estado inicial do jogo (valores padrão)
let gameState = {
    totalXP: 0,
    lessonsCompleted: 0,
    dailyDebugsCompleted: 0, // Debugs feitos no dia atual
    lastDebugDate: null,      // Data do último debug registrado (para reset diário)
    exercisesCompleted: 0, // Contador total de debugs de todos os tempos
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
const exercisesCompletedCountElement = document.getElementById('exercisesCompletedCount'); // Este agora mostrará os debugs diários

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

// NOVO: Elemento para a seção de frases motivacionais
const motivationalPhraseSection = document.createElement('section');
motivationalPhraseSection.classList.add('metrics-card', 'motivational-phrase-section'); // Adicionei 'metrics-card' para manter o estilo
motivationalPhraseSection.innerHTML = `
    <h3>Inspiração Diária</h3>
    <p id="dailyMotivationalPhrase" class="motivational-phrase"></p>
`;
// Encontre onde inserir esta seção. Ex: após action-buttons-container ou timers-section
// Vou inserir após timers-section para seguir a estrutura de 'sections'
const timersSection = document.querySelector('.timers-section');
timersSection.parentNode.insertBefore(motivationalPhraseSection, timersSection.nextSibling);

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
        // addActivityToList('Sistema', 'Contador de debugs diários resetado.', { systemMessage: true }); // Não adiciona mais no log, pois é um comportamento interno
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

    const netSimulatedRevenue = Math.max(0, gameState.simulatedRevenue - MONTHLY_COST);
    realRewardElement.textContent = `R$ ${(netSimulatedRevenue * REAL_REWARD_CONVERSION_FACTOR).toFixed(2).replace('.', ',')}`;

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
                gameState.activeProjects = gameState.activeProjects.filter(p => p.id !== projectId);
                updateUI();
            } else if (action === 'archive') {
                console.log(`Tem certeza que deseja arquivar o projeto "${project.name}"? Ele será removido da lista de ativos.`);
                gameState.activeProjects = gameState.activeProjects.filter(p => p.id !== projectId);
                addActivityToList('Projeto Arquivado', `"${project.name}" foi arquivado (removido da lista de ativos).`);
            }
            saveGameState();
            renderActiveProjects();
        });
    });
}

function renderCompletedProjects() {
    completedProjectsList.innerHTML = '';
    if (gameState.completedProjects.length === 0) {
        completedProjectsList.innerHTML = '<li>Nenhum projeto concluído ainda.</li>';
        return;
    }
    const sortedCompletedProjects = [...gameState.completedProjects].sort((a, b) => new Date(b.lastUpdate) - new Date(a.lastUpdate));

    sortedCompletedProjects.forEach(project => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `${project.name}<span>Concluído em: ${project.lastUpdate}</span>`;
        completedProjectsList.appendChild(listItem);
    });
}


// ===============================================
// 5. Lógica do Diário
// ===============================================

function saveJournalEntry() {
    const title = journalTitleInput.value.trim();
    const entryText = journalEntryTextarea.value.trim();

    if (!title) {
        console.log('Por favor, digite um título para a entrada do diário.');
        return;
    }
    if (!entryText) {
        console.log('Por favor, escreva algo para salvar no diário.');
        return;
    }

    const now = new Date();
    const dateString = now.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const newEntry = {
        title: title,
        date: dateString,
        time: timeString,
        text: entryText
    };
    gameState.journalEntries.unshift(newEntry);
    journalTitleInput.value = '';
    journalEntryTextarea.value = '';
    saveGameState();
    renderJournalEntries();
    addActivityToList('Diário', `Nova entrada: "${title}"`, { journalTitle: title });
}

function renderJournalEntries() {
    journalEntriesList.innerHTML = '';
    if (gameState.journalEntries.length === 0) {
        journalEntriesList.innerHTML = '<li>Nenhuma entrada no diário ainda.</li>';
        return;
    }
    gameState.journalEntries.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${entry.title} (${entry.date} às ${entry.time}):</strong> ${entry.text}`;
        journalEntriesList.appendChild(listItem);
    });
}

// ===============================================
// 6. Lógica do Modal de Aulas Teóricas
// ===============================================

function saveLessonDetailsAndComplete() {
    const title = lessonTitleInput.value.trim();
    const notes = lessonNotesTextarea.value.trim();

    if (!title) {
        console.log('Por favor, digite um título para a aula.');
        return;
    }

    gameState.lessonsCompleted++;
    recalculateMetrics();

    addActivityToList(
        'Aula',
        `Aula: "${title}"`,
        { lessonTitle: title, lessonNotes: notes }
    );

    gameState.lessonEntries.unshift({
        title: title,
        notes: notes,
        date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    });

    saveGameState();
    updateUI();
    lessonModal.classList.remove('active');
    lessonTitleInput.value = '';
    lessonNotesTextarea.value = '';
}


// ===============================================
// 7. Funções de Manipulação de Eventos (Botões)
// ===============================================

addLessonButton.addEventListener('click', () => {
    lessonModal.classList.add('active');
});

saveLessonDetailsButton.addEventListener('click', saveLessonDetailsAndComplete);


// Lógica para o único botão de "Resolver Debug" com recompensas diárias
resolveDebugButton.addEventListener('click', () => {
    // 1. Primeiro, verifica e reseta o contador diário se for um novo dia.
    checkAndResetDailyDebugs();

    // 2. Incrementa o contador de debugs diários e o contador total (se ainda usar).
    gameState.dailyDebugsCompleted++;
    gameState.exercisesCompleted++; // Contador total de todos os tempos, se necessário

    // 3. Adiciona ao registro de exercícios por semana.
    const currentWeek = getWeekNumber(new Date());
    gameState.exercisesPerWeek[currentWeek] = (gameState.exercisesPerWeek[currentWeek] || 0) + 1;

    let debugRevenueGained = 0; // Receita ganha NESTE clique de debug
    let activityDetailMessage = `Debug concluído. Total do dia: ${gameState.dailyDebugsCompleted}.`; // Mensagem base da atividade

    // 4. Lógica de Recompensa de Debugs Diários:
    // Priorizamos a recompensa de 50 debugs.
    if (gameState.dailyDebugsCompleted >= 50 && !gameState.dailyDebugRewardsPaid.hasPaid50) {
        // Se 30 já foi pago, a recompensa de 50 deve ser a diferença
        if (gameState.dailyDebugsCompleted >= 30 && gameState.dailyDebugRewardsPaid.hasPaid30) {
            debugRevenueGained = EXERCISE_REVENUE_PER_50_DEBUG - EXERCISE_REVENUE_PER_30_DEBUG;
            activityDetailMessage += ` Além disso, atingiu 50 debugs diários! Recebeu R$${debugRevenueGained.toFixed(2).replace('.', ',')} (ajustado pelo marco de 30 já pago).`;
        } else {
            // Se 30 não foi pago, a recompensa de 50 é o valor total
            debugRevenueGained = EXERCISE_REVENUE_PER_50_DEBUG;
            activityDetailMessage += ` Além disso, atingiu 50 debugs diários! Recebeu R$${EXERCISE_REVENUE_PER_50_DEBUG.toFixed(2).replace('.', ',')}.`;
        }
        gameState.dailyDebugRewardsPaid.hasPaid50 = true;
        gameState.dailyDebugRewardsPaid.hasPaid30 = true; // Marca 30 como pago também, pois 50 implica 30
    }
    // Se não atingiu 50 OU já pagou 50, verifica a recompensa de 30.
    else if (gameState.dailyDebugsCompleted >= 30 && !gameState.dailyDebugRewardsPaid.hasPaid30) {
        debugRevenueGained = EXERCISE_REVENUE_PER_30_DEBUG;
        activityDetailMessage += ` Além disso, atingiu 30 debugs diários! Recebeu R$${EXERCISE_REVENUE_PER_30_DEBUG.toFixed(2).replace('.', ',')}.`;
        gameState.dailyDebugRewardsPaid.hasPaid30 = true;
    }

    // 5. Adiciona a receita ganha (se houver) ao total simulado.
    gameState.simulatedRevenue += debugRevenueGained;

    // 6. Adiciona APENAS UMA entrada de atividade com a mensagem detalhada.
    addActivityToList('Exercício', activityDetailMessage);

    // 7. Atualiza a data do último debug para a verificação diária.
    gameState.lastDebugDate = new Date().toISOString();

    // 8. Recalcula métricas e atualiza a UI.
    recalculateMetrics();
    saveGameState();
    updateUI();
});


// ===============================================
// 8. Funções de Suporte (Modais, Reset, etc.)
// ===============================================

// Event Listeners para botões de controle do cronômetro
startTimerButton.addEventListener('click', startTimer);
pauseTimerButton.addEventListener('click', pauseTimer);
resetTimerButton.addEventListener('click', resetTimer);

// Event Listeners para botões de controle do pomodoro
startPomodoroButton.addEventListener('click', startPomodoro);
pausePomodoroButton.addEventListener('click', pausePomodoro);
resetPomodoroButton.addEventListener('click', resetPomodoro);
focusTimeInput.addEventListener('change', loadPomodoroSettings);
breakTimeInput.addEventListener('change', loadPomodoroSettings);


// Event Listeners para modais
closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.target.closest('.modal').classList.remove('active');
    });
});

window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
});

// Event Listener para abrir o diário
openDailyJournalButton.addEventListener('click', () => {
    journalModal.classList.add('active');
    renderJournalEntries(); // Renderiza as entradas existentes ao abrir
});

// Event Listener para salvar entrada do diário
saveJournalEntryButton.addEventListener('click', saveJournalEntry);

// Event Listener para criar novo projeto
createNewProjectButton.addEventListener('click', createNewProject);

// Event Listener para ver projetos concluídos
viewCompletedProjectsButton.addEventListener('click', () => {
    completedProjectsModal.classList.add('active');
    renderCompletedProjects();
});

// Event Listener para resetar todos os dados
resetDataButton.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja REINICIAR TODOS os dados? Esta ação é irreversível.')) {
        localStorage.removeItem('gamificationGameState');
        location.reload(); // Recarrega a página para iniciar com o estado padrão
    }
});


// ===============================================
// 9. Inicialização do Aplicativo
// ===============================================

// Chamar quando o DOM estiver completamente carregado
document.addEventListener('DOMContentLoaded', () => {
    loadGameState(); // Carrega o estado salvo
    checkAndResetDailyDebugs(); // Garante que o contador diário está correto para o dia
    generateDailySummary(); // Tenta gerar o resumo do dia anterior
    updateUI(); // Atualiza a interface com o estado carregado
    adjustMainContentMargin(); // Ajusta a margem do conteúdo principal

    // Adiciona o listener para o resize, garantindo que o ajuste funcione em mudanças de tamanho
    window.addEventListener('resize', adjustMainContentMargin);
});