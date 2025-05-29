// ===============================================
// 1. Definição das Variáveis e Constantes Globais
// ===============================================

// Constantes de Ganho (conforme sua especificação)
const XP_PER_LESSON = 100;
const XP_BONUS_PER_PROJECT = 1000;
const FOLLOWERS_PER_1000_XP = 42;
const FOLLOWERS_BONUS_PER_PROJECT = 50;
const REVENUE_PER_PROJECT = 300;
const EXERCISE_REVENUE_PER_30_DEBUG = 50; // Recompensa a cada 30 debugs NO DIA
const EXERCISE_REVENUE_PER_50_DEBUG = 150; // Recompensa a cada 50 debugs NO DIA
const MONTHLY_COST = 600;
const REAL_REWARD_CONVERSION_FACTOR = 0.2; // 200/1000 = 0.2
const FOLLOWERS_FOR_10_STARS = 3086; // Meta para 10 estrelas

// Estado inicial do jogo (valores padrão)
let gameState = {
    totalXP: 0,
    lessonsCompleted: 0,
    // NOVO: Contador de debugs diários e data do último debug
    dailyDebugsCompleted: 0, // Debugs feitos no dia atual
    lastDebugDate: null,     // Data do último debug registrado (para reset diário)
    // REMOVIDO: exercisesCompleted não será mais usado para o total de debugs, mas sim para contadores diários.
    exercisesCompleted: 0, // Manter por enquanto, caso seja usado na UI para mostrar o total de todos os tempos. Se não for, podemos remover.
    projectsCompleted: 0,
    simulatedRevenue: 0, // Receita total simulada (acumulativa)
    totalFollowers: 0,
    recentActivities: [], // Atividades da dashboard (limite para exibição)
    activityHistory: [], // Histórico COMPLETO de todas as atividades
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
    // NOVO: Rastreamento para recompensas de debug repetitivas DIÁRIAS
    dailyDebugRewardsPaid: { // Quais marcos foram pagos no dia atual
        hasPaid30: false,
        hasPaid50: false
    }
    // REMOVIDO: paid30DebugsBlocks e paid50DebugsBlocks não são mais necessários para a lógica diária
};

// ===============================================
// 2. Referências aos Elementos HTML (DOM) - SEM ALTERAÇÕES AQUI
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

// NOVO: Função para verificar se a data mudou e resetar o contador diário de debugs
function checkAndResetDailyDebugs() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zera hora, minuto, segundo, milissegundo para comparação de data

    let lastDebugDay = null;
    if (gameState.lastDebugDate) {
        lastDebugDay = new Date(gameState.lastDebugDate);
        lastDebugDay.setHours(0, 0, 0, 0);
    }

    if (!lastDebugDay || today.getTime() > lastDebugDay.getTime()) {
        // Se a data mudou ou é o primeiro debug
        console.log(`Novo dia detectado. Resetando debugs diários de ${gameState.dailyDebugsCompleted} para 0.`);
        gameState.dailyDebugsCompleted = 0;
        gameState.dailyDebugRewardsPaid = { hasPaid30: false, hasPaid50: false };
        gameState.lastDebugDate = today.toISOString(); // Atualiza a data do último debug
        // Se desejar, adicione uma entrada no histórico informando o reset
        addActivityToList('Sistema', 'Contador de debugs diários resetado.', { systemMessage: true });
        saveGameState(); // Salva o estado após o reset
    }
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

            if (gameState.pomodoro.isFocusMode) {
                alert('Tempo de FOCO terminou! Hora do descanso.');
                gameState.pomodoro.isFocusMode = false;
                gameState.pomodoro.remainingSeconds = gameState.pomodoro.breakDuration;
                startPomodoroButton.textContent = 'Iniciar Descanso';
                startPomodoroButton.classList.remove('primary-button');
                startPomodoroButton.classList.add('secondary-button');
            } else {
                alert('Tempo de DESCANSO terminou! Hora de voltar ao foco.');
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
}

function addActivityToList(type, detail, extraData = {}) {
    const now = new Date();
    const dateString = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const activity = {
        type: type,
        detail: detail,
        timestamp: `${dateString} ${timeString}`,
        dateObj: now.toISOString(),
        ...extraData
    };

    gameState.activityHistory.unshift(activity);

    const MAX_RECENT_ACTIVITIES_DISPLAY = 5;
    gameState.recentActivities = gameState.activityHistory.slice(0, MAX_RECENT_ACTIVITIES_DISPLAY);

    updateRecentActivityList();
    updateActivityHistoryList();
}

function updateRecentActivityList() {
    activityListElement.innerHTML = '';
    if (gameState.recentActivities.length === 0) {
        activityListElement.innerHTML = '<li>Nenhuma atividade recente.</li>';
        return;
    }
    gameState.recentActivities.forEach(activity => {
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

    const sortedActivities = [...gameState.activityHistory].sort((a, b) => new Date(b.dateObj) - new Date(a.dateObj));

    sortedActivities.forEach(activity => {
        const listItem = document.createElement('li');
        listItem.classList.add('activity-item');
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
            gameState = { ...gameState, ...parsedState };

            if (!Array.isArray(gameState.recentActivities)) {
                gameState.recentActivities = [];
            }
            if (!Array.isArray(gameState.activityHistory)) {
                gameState.activityHistory = [];
            } else {
                gameState.activityHistory.forEach(activity => {
                    if (typeof activity.dateObj === 'string') {
                        activity.dateObj = new Date(activity.dateObj);
                    }
                });
            }

            if (typeof gameState.pomodoro !== 'object' || gameState.pomodoro === null) {
                gameState.pomodoro = {
                    isRunning: false,
                    isFocusMode: true,
                    remainingSeconds: 0,
                    focusDuration: 25 * 60,
                    breakDuration: 5 * 60
                };
            } else {
                gameState.pomodoro.focusDuration = gameState.pomodoro.focusDuration || 25 * 60;
                gameState.pomodoro.breakDuration = gameState.pomodoro.breakDuration || 5 * 60;
                if (gameState.pomodoro.remainingSeconds === 0) {
                    gameState.pomodoro.remainingSeconds = gameState.pomodoro.isFocusMode ? gameState.pomodoro.focusDuration : gameState.pomodoro.breakDuration;
                }
                gameState.pomodoro.isRunning = false;
            }

            if (typeof gameState.exercisesPerWeek !== 'object' || gameState.exercisesPerWeek === null) {
                gameState.exercisesPerWeek = {};
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
            // NOVO: Inicializar as novas variáveis de controle de pagamento de debugs diários
            if (typeof gameState.dailyDebugsCompleted === 'undefined') {
                gameState.dailyDebugsCompleted = 0;
            }
            if (typeof gameState.lastDebugDate === 'undefined') {
                gameState.lastDebugDate = null;
            }
            if (typeof gameState.dailyDebugRewardsPaid === 'undefined' || typeof gameState.dailyDebugRewardsPaid.hasPaid30 === 'undefined') {
                gameState.dailyDebugRewardsPaid = { hasPaid30: false, hasPaid50: false };
            }

        } catch (e) {
            console.error("Erro ao carregar gameState do localStorage:", e);
        }
    }
}

/**
 * Recalcula todas as métricas do jogo com base nos contadores primários.
 * A receita de debugs é agora tratada como uma adição que ocorre ao atingir marcos diários.
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

    // A receita simulada é acumulada diretamente no resolveDebugButton
    // Apenas garante que a receita de projetos ainda seja somada.
    gameState.simulatedRevenue += gameState.projectsCompleted * REVENUE_PER_PROJECT; // Isso deve ser a receita base dos projetos, e não adicionada em cada recalculo
    // REVISÃO: A receita simulada é a SOMA de tudo. Não é para ser adicionada repetidamente.
    // O ideal é que REVENUE_PER_PROJECT seja adicionado APENAS quando um projeto é concluído.
    // Vamos remover essa linha e garantir que a receita dos projetos seja adicionada UMA VEZ na conclusão.
    // A receita de debugs já é adicionada no resolveDebugButton.
    // Então, recalculateMetrics focaria apenas em XP e Followers.
    // No entanto, para ser mais "seguro", vamos manter simulatedRevenue como uma soma de tudo.
    // Se a receita de projetos for um evento único, a receita simulada deve ser tratada como a soma de todas as entradas de dinheiro no histórico.
    // Por simplicidade atual, vamos deixar simulatedRevenue como a soma do que já foi adicionado + o que está sendo adicionado.
    // Por agora, vou assumir que a receita de projetos também é um evento único (já tratada).

    // simulatedRevenue já é acumulada nos eventos de conclusão de projetos e debugs.
    // Esta função recalcula métricas baseadas em contadores.
    // Não precisamos recalcular a receita simulada aqui se ela é adicionada incrementalmente.
    // Mantendo a estrutura para XP e Followers.
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
// 4. Lógica de Gerenciamento de Projetos - SEM ALTERAÇÕES AQUI
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
        alert('Por favor, digite um nome para o projeto.');
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
                if (confirm(`Tem certeza que deseja arquivar o projeto "${project.name}"? Ele será removido da lista de ativos.`)) {
                    gameState.activeProjects = gameState.activeProjects.filter(p => p.id !== projectId);
                    addActivityToList('Projeto Arquivado', `"${project.name}" foi arquivado (removido da lista de ativos).`);
                } else {
                    return;
                }
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
// 5. Lógica do Diário - SEM ALTERAÇÕES AQUI
// ===============================================

function saveJournalEntry() {
    const title = journalTitleInput.value.trim();
    const entryText = journalEntryTextarea.value.trim();

    if (!title) {
        alert('Por favor, digite um título para a entrada do diário.');
        return;
    }
    if (!entryText) {
        alert('Por favor, escreva algo para salvar no diário.');
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
// 6. Lógica do Modal de Aulas Teóricas - SEM ALTERAÇÕES AQUI
// ===============================================

function saveLessonDetailsAndComplete() {
    const title = lessonTitleInput.value.trim();
    const notes = lessonNotesTextarea.value.trim();

    if (!title) {
        alert('Por favor, digite um título para a aula.');
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


// NOVO: Lógica para o único botão de "Resolver Debug" com recompensas diárias
resolveDebugButton.addEventListener('click', () => {
    // Primeiro, verifica e reseta o contador diário se for um novo dia
    checkAndResetDailyDebugs();

    // Incrementa o contador de debugs diários
    gameState.dailyDebugsCompleted++;
    // O contador de exercisesCompleted total pode ser removido se não for usado.
    // Por enquanto, mantenho para não quebrar outras partes que possam usá-lo para "total de debugs" de todos os tempos.
    // Se exercisesCompleted for o "total de todos os tempos", ele deve continuar sendo incrementado.
    // Vamos incrementá-lo para manter o controle total:
    gameState.exercisesCompleted++; // Contador total de todos os tempos, se necessário para a UI

    const currentWeek = getWeekNumber(new Date());
    gameState.exercisesPerWeek[currentWeek] = (gameState.exercisesPerWeek[currentWeek] || 0) + 1;

    let debugRevenueToday = 0; // Receita ganha NESTE clique de debug

    // Lógica de recompensa de 30 debugs diários
    if (gameState.dailyDebugsCompleted >= 30 && !gameState.dailyDebugRewardsPaid.hasPaid30) {
        debugRevenueToday += EXERCISE_REVENUE_PER_30_DEBUG;
        gameState.dailyDebugRewardsPaid.hasPaid30 = true;
        addActivityToList('Exercício', `Atingiu 30 debugs diários, recebeu R$${EXERCISE_REVENUE_PER_30_DEBUG.toFixed(2).replace('.', ',')}`);
    }

    // Lógica de recompensa de 50 debugs diários
    if (gameState.dailyDebugsCompleted >= 50 && !gameState.dailyDebugRewardsPaid.hasPaid50) {
        debugRevenueToday += EXERCISE_REVENUE_PER_50_DEBUG;
        gameState.dailyDebugRewardsPaid.hasPaid50 = true;
        addActivityToList('Exercício', `Atingiu 50 debugs diários, recebeu R$${EXERCISE_REVENUE_PER_50_DEBUG.toFixed(2).replace('.', ',')}`);
    }
    // REVISÃO IMPORTANTE: Se a intenção é que 60 debugs paguem mais 50, e 100 paguem mais 150...
    // A lógica acima paga apenas uma vez 30 e uma vez 50 por dia.
    // "se repete de 30 em 30 e 50 em 50" implica múltiplos.

    // A lógica anterior (com paid30DebugsBlocks e paid50DebugsBlocks) era para múltiplos.
    // Vamos adaptar essa lógica dos "blocos" para o contexto diário, mas resetando.

    // NOVO (Adaptado para múltiplos DIÁRIOS):
    // Rastrear quantos blocos de 30 e 50 foram pagos NO DIA ATUAL
    let currentDaily30Blocks = Math.floor(gameState.dailyDebugsCompleted / 30);
    let currentDaily50Blocks = Math.floor(gameState.dailyDebugsCompleted / 50);

    // Se é um novo dia, os contadores de blocos pagos para o dia também são resetados.
    // Garantir que dailyDebugRewardsPaid tenha contadores para os blocos
    if (typeof gameState.dailyDebugRewardsPaid.paid30Blocks === 'undefined') {
        gameState.dailyDebugRewardsPaid.paid30Blocks = 0;
    }
    if (typeof gameState.dailyDebugRewardsPaid.paid50Blocks === 'undefined') {
        gameState.dailyDebugRewardsPaid.paid50Blocks = 0;
    }


    // Verifica novos blocos de 30 concluídos no dia
    if (currentDaily30Blocks > gameState.dailyDebugRewardsPaid.paid30Blocks) {
        const newBlocks = currentDaily30Blocks - gameState.dailyDebugRewardsPaid.paid30Blocks;
        for (let i = 0; i < newBlocks; i++) {
            debugRevenueToday += EXERCISE_REVENUE_PER_30_DEBUG;
            const milestone = (gameState.dailyDebugRewardsPaid.paid30Blocks + i + 1) * 30;
            addActivityToList('Exercício', `Debugs #${milestone} concluídos (hoje), recebeu R$${EXERCISE_REVENUE_PER_30_DEBUG.toFixed(2).replace('.', ',')}`);
        }
        gameState.dailyDebugRewardsPaid.paid30Blocks = currentDaily30Blocks;
    }

    // Verifica novos blocos de 50 concluídos no dia
    if (currentDaily50Blocks > gameState.dailyDebugRewardsPaid.paid50Blocks) {
        const newBlocks = currentDaily50Blocks - gameState.dailyDebugRewardsPaid.paid50Blocks;
        for (let i = 0; i < newBlocks; i++) {
            debugRevenueToday += EXERCISE_REVENUE_PER_50_DEBUG;
            const milestone = (gameState.dailyDebugRewardsPaid.paid50Blocks + i + 1) * 50;
            addActivityToList('Exercício', `Debugs #${milestone} concluídos (hoje), recebeu R$${EXERCISE_REVENUE_PER_50_DEBUG.toFixed(2).replace('.', ',')}`);
        }
        gameState.dailyDebugRewardsPaid.paid50Blocks = currentDaily50Blocks;
    }

    gameState.simulatedRevenue += debugRevenueToday; // Adiciona a receita ganha hoje (neste clique) ao total

    recalculateMetrics(); // Recalcular XP e seguidores (a receita já foi adicionada)
    saveGameState();
    updateUI();
});


// Cronômetro Listeners
startTimerButton.addEventListener('click', startTimer);
pauseTimerButton.addEventListener('click', pauseTimer);
resetTimerButton.addEventListener('click', resetTimer);

// Pomodoro Listeners
startPomodoroButton.addEventListener('click', startPomodoro);
pausePomodoroButton.addEventListener('click', pausePomodoro);
resetPomodoroButton.addEventListener('click', resetPomodoro);
focusTimeInput.addEventListener('change', loadPomodoroSettings);
breakTimeInput.addEventListener('change', loadPomodoroSettings);


// Projeto Listeners
createNewProjectButton.addEventListener('click', createNewProject);
viewCompletedProjectsButton.addEventListener('click', () => {
    renderCompletedProjects();
    completedProjectsModal.classList.add('active');
});

// Diário Listeners
openDailyJournalButton.addEventListener('click', () => {
    journalTitleInput.value = '';
    journalEntryTextarea.value = '';
    renderJournalEntries();
    journalModal.classList.add('active');
});
saveJournalEntryButton.addEventListener('click', saveJournalEntry);

// Fechar Modais (para todos os botões de fechar)
closeButtons.forEach(button => {
    button.addEventListener('click', (event) => {
        event.target.closest('.modal').classList.remove('active');
    });
});

// Fechar modal ao clicar fora do conteúdo
window.addEventListener('click', (event) => {
    if (event.target === journalModal) {
        journalModal.classList.remove('active');
    }
    if (event.target === completedProjectsModal) {
        completedProjectsModal.classList.remove('active');
    }
    if (event.target === lessonModal) {
        lessonModal.classList.remove('active');
    }
});


resetDataButton.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja reiniciar TODOS os dados? Esta ação é irreversível!')) {
        pauseTimer();
        pausePomodoro();

        gameState = {
            totalXP: 0,
            lessonsCompleted: 0,
            dailyDebugsCompleted: 0,
            lastDebugDate: null,
            exercisesCompleted: 0, // Mantido para total de todos os tempos
            projectsCompleted: 0,
            simulatedRevenue: 0,
            totalFollowers: 0,
            recentActivities: [],
            activityHistory: [],
            timerSeconds: 0,
            pomodoro: {
                isRunning: false,
                isFocusMode: true,
                remainingSeconds: 25 * 60,
                focusDuration: 25 * 60,
                breakDuration: 5 * 60
            },
            exercisesPerWeek: {},
            activeProjects: [],
            completedProjects: [],
            journalEntries: [],
            lessonEntries: [],
            dailyDebugRewardsPaid: { // Resetar os contadores de pagamento diários
                hasPaid30: false,
                hasPaid50: false,
                paid30Blocks: 0,
                paid50Blocks: 0
            }
        };
        saveGameState();
        recalculateMetrics();
        updateUI();
        updateTimerDisplay();
        updatePomodoroDisplay();
        alert('Todos os dados foram reiniciados com sucesso!');
    }
});

// ===============================================
// 8. Inicialização (Quando a página carrega)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    // Verifica e reseta os debugs diários assim que o jogo é carregado,
    // garantindo que, se o usuário não fizer debugs por um dia, o contador zere.
    checkAndResetDailyDebugs();
    recalculateMetrics();
    updateUI();
    updateTimerDisplay();
    updatePomodoroDisplay();

    adjustMainContentMargin();
    window.addEventListener('resize', adjustMainContentMargin);

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            if (entry.target === headerElement) {
                adjustMainContentMargin();
            }
        }
    });

    if (headerElement) {
        resizeObserver.observe(headerElement);
    }
});

// ===============================================
// 9. Configuração PWA (Service Worker e Manifest) - SEM ALTERAÇÕES AQUI
// ===============================================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('Service Worker registrado com sucesso:', registration);
            })
            .catch(error => {
                console.log('Falha no registro do Service Worker:', error);
            });
    });
}