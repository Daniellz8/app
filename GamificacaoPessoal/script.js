// ===============================================
// 1. Definição das Variáveis e Constantes Globais
// ===============================================

// Constantes de Ganho (conforme sua especificação)
const XP_PER_LESSON = 100;
const XP_BONUS_PER_PROJECT = 1000;
const FOLLOWERS_PER_1000_XP = 42;
const FOLLOWERS_BONUS_PER_PROJECT = 50;
const REVENUE_PER_PROJECT = 300;
const EXERCISE_REVENUE_30 = 50;
const EXERCISE_REVENUE_50_ADDITIONAL = 100; // Adicional aos 30 exercícios, totalizando 150
const MONTHLY_COST = 600;
const REAL_REWARD_CONVERSION_FACTOR = 0.2; // 200/1000 = 0.2
const FOLLOWERS_FOR_10_STARS = 3086; // Meta para 10 estrelas

// Estado inicial do jogo (valores padrão)
let gameState = {
    totalXP: 0,
    lessonsCompleted: 0,
    exercisesCompleted: 0, // Contador TOTAL de exercícios de debug
    projectsCompleted: 0,
    simulatedRevenue: 0,
    totalFollowers: 0,
    recentActivities: [], // Atividades da dashboard (limite para exibição)
    activityHistory: [], // Histórico COMPLETO de todas as atividades
    timerSeconds: 0, // Tempo do cronômetro em segundos
    exercisesPerWeek: {}, // Armazena exercícios concluídos por semana (formato 'YYYY-WW')
    activeProjects: [], // Lista de projetos em andamento/pausados
    completedProjects: [], // Lista de projetos concluídos
    journalEntries: [] // Entradas do diário
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
const exercisesCompletedCountElement = document.getElementById('exercisesCompletedCount'); // Novo elemento na dashboard

const activityListElement = document.getElementById('activityList'); // Lista de atividades RECENTES na dashboard
const activityHistoryListElement = document.getElementById('activityHistoryList'); // Nova: Lista de TODAS as atividades

const addLessonButton = document.getElementById('addLesson');
const addSmallDebugButton = document.getElementById('addSmallDebug');
const addLargeDebugButton = document.getElementById('addLargeDebug');
// const addProjectButton = document.getElementById('addProject'); // Este será removido ou reusado (já comentado)

const timerDisplayElement = document.getElementById('timerDisplay');
const startTimerButton = document.getElementById('startTimer');
const pauseTimerButton = document.getElementById('pauseTimer');
const resetTimerButton = document.getElementById('resetTimer');

const exercisesChartCanvas = document.getElementById('exercisesChart');
let exercisesChart; // Variável para armazenar a instância do gráfico

const newProjectNameInput = document.getElementById('newProjectName');
const createNewProjectButton = document.getElementById('createNewProject');
const activeProjectsContainer = document.getElementById('activeProjectsContainer');
const viewCompletedProjectsButton = document.getElementById('viewCompletedProjects');

const openDailyJournalButton = document.getElementById('openDailyJournal');
const resetDataButton = document.getElementById('resetData');

// Referências dos Modais
const journalModal = document.getElementById('journalModal');
const completedProjectsModal = document.getElementById('completedProjectsModal');
const closeButtons = document.querySelectorAll('.modal .close-button'); // Todos os botões de fechar modais

const journalEntryTextarea = document.getElementById('journalEntry');
const saveJournalEntryButton = document.getElementById('saveJournalEntry');
const journalEntriesList = document.getElementById('journalEntriesList');
const completedProjectsList = document.getElementById('completedProjectsList');

// ===============================================
// 3. Funções de Lógica do Jogo
// ===============================================

/**
 * Ajusta o margin-top do conteúdo principal para que não seja coberto pelo header fixo.
 */
function adjustMainContentMargin() {
    const headerHeight = headerElement.offsetHeight;
    mainContentElement.style.marginTop = `${headerHeight}px`;
}

/**
 * Retorna o número da semana do ano para uma dada data.
 * Baseado na norma ISO 8601 (semana começa na segunda-feira).
 * @param {Date} date A data para calcular a semana.
 * @returns {string} Formato 'YYYY-WW' (ex: '2023-45').
 */
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return `${d.getUTCFullYear()}-${String(weekNo).padStart(2, '0')}`;
}

/**
 * Calcula o número de estrelas com base nos seguidores totais.
 * A avaliação é linear até 10 estrelas.
 * @returns {number} O número de estrelas arredondado para baixo.
 */
function calculateStarRating() {
    if (gameState.totalFollowers >= FOLLOWERS_FOR_10_STARS) {
        return 10;
    }
    return Math.floor((gameState.totalFollowers / FOLLOWERS_FOR_10_STARS) * 10);
}

/**
 * Adiciona uma estrela preenchida para cada estrela calculada.
 * Atualiza visualmente as estrelas no HTML.
 */
function updateStarRatingDisplay() {
    const stars = starRatingElement.querySelectorAll('.star');
    const currentStars = calculateStarRating();

    stars.forEach((star, index) => {
        if (index < currentStars) {
            star.classList.add('filled');
            star.textContent = '★'; // Estrela preenchida Unicode
        } else {
            star.classList.remove('filled');
            star.textContent = '☆'; // Estrela vazia Unicode
        }
    });
}

/**
 * Formata segundos para o formato HH:MM:SS.
 * @param {number} totalSeconds O total de segundos.
 * @returns {string} Tempo formatado.
 */
function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
        .map(v => v < 10 ? '0' + v : v)
        .join(':');
}

let timerInterval; // Variável para armazenar o ID do setInterval

/**
 * Inicia o cronômetro.
 */
function startTimer() {
    if (!timerInterval) { // Evita múltiplos intervalos
        timerInterval = setInterval(() => {
            gameState.timerSeconds++;
            updateTimerDisplay();
            saveGameState(); // Salva o timer a cada segundo
        }, 1000);
    }
}

/**
 * Pausa o cronômetro.
 */
function pauseTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    saveGameState();
}

/**
 * Zera o cronômetro.
 */
function resetTimer() {
    pauseTimer();
    gameState.timerSeconds = 0;
    updateTimerDisplay();
    saveGameState();
}

/**
 * Atualiza o display do cronômetro.
 */
function updateTimerDisplay() {
    timerDisplayElement.textContent = formatTime(gameState.timerSeconds);
}


/**
 * Atualiza todos os valores na interface do usuário.
 */
function updateUI() {
    xpTotalElement.textContent = `${gameState.totalXP} XP`;
    totalFollowersElement.textContent = gameState.totalFollowers.toLocaleString('pt-BR');
    updateStarRatingDisplay();
    simulatedRevenueElement.textContent = `R$ ${gameState.simulatedRevenue.toFixed(2).replace('.', ',')}`;

    const netSimulatedRevenue = Math.max(0, gameState.simulatedRevenue - MONTHLY_COST);
    realRewardElement.textContent = `R$ ${(netSimulatedRevenue * REAL_REWARD_CONVERSION_FACTOR).toFixed(2).replace('.', ',')}`;

    monthlyCostElement.textContent = `R$ ${MONTHLY_COST.toFixed(2).replace('.', ',')}`;
    exercisesCompletedCountElement.textContent = gameState.exercisesCompleted; // Atualiza o contador de debugs

    updateRecentActivityList(); // Atualiza a lista de atividades recentes na dashboard
    updateActivityHistoryList(); // NOVO: Atualiza a lista de histórico de atividades
    updateExercisesChart(); // Atualiza o gráfico também
    renderActiveProjects(); // Renderiza os projetos ativos
}

/**
 * Adiciona uma nova atividade ao histórico COMPLETO e à lista de recentes.
 * @param {string} type O tipo de atividade (e.g., 'Aula', 'Exercício', 'Projeto').
 * @param {string} detail Detalhes da atividade.
 */
function addActivityToList(type, detail) {
    const now = new Date();
    const dateString = now.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const activity = {
        type: type,
        detail: detail,
        timestamp: `${dateString} ${timeString}`,
        dateObj: now.toISOString() // Guarda a data como ISO string para ordenação
    };

    // Adiciona ao histórico completo
    gameState.activityHistory.unshift(activity); // Adiciona no início para os mais recentes aparecerem primeiro

    // Adiciona à lista de recentes (limitada para exibição na dashboard)
    gameState.recentActivities.unshift(activity);
    const MAX_RECENT_ACTIVITIES_DISPLAY = 5; // Limite menor para a dashboard
    if (gameState.recentActivities.length > MAX_RECENT_ACTIVITIES_DISPLAY) {
        gameState.recentActivities = gameState.recentActivities.slice(0, MAX_RECENT_ACTIVITIES_DISPLAY);
    }
}

/**
 * Renderiza a lista de atividades recentes no HTML da dashboard.
 */
function updateRecentActivityList() {
    activityListElement.innerHTML = ''; // Limpa a lista existente
    if (gameState.recentActivities.length === 0) {
        activityListElement.innerHTML = '<li>Nenhuma atividade recente.</li>';
        return;
    }
    gameState.recentActivities.forEach(activity => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<span>${activity.type}:</span> ${activity.detail} (${activity.timestamp})`;
        activityListElement.appendChild(listItem);
    });
}

/**
 * NOVO: Renderiza a lista completa de atividades no histórico.
 */
function updateActivityHistoryList() {
    activityHistoryListElement.innerHTML = ''; // Limpa a lista existente
    if (gameState.activityHistory.length === 0) {
        activityHistoryListElement.innerHTML = '<div class="no-activities-message">Nenhuma atividade registrada ainda.</div>';
        return;
    }

    // Ordenar as atividades por data (mais recente primeiro)
    const sortedActivities = [...gameState.activityHistory].sort((a, b) => new Date(b.dateObj) - new Date(a.dateObj));

    sortedActivities.forEach(activity => {
        const listItem = document.createElement('li');
        listItem.classList.add('activity-item');
        listItem.innerHTML = `
            <span>${activity.type}: ${activity.detail}</span>
            <span class="activity-date">${activity.timestamp}</span>
        `;
        activityHistoryListElement.appendChild(listItem);
    });
}


/**
 * Salva o estado atual do jogo no localStorage.
 */
function saveGameState() {
    localStorage.setItem('gamificationGameState', JSON.stringify(gameState));
}

/**
 * Carrega o estado do jogo do localStorage.
 * Se não houver estado salvo, usa o estado inicial.
 */
function loadGameState() {
    const savedState = localStorage.getItem('gamificationGameState');
    if (savedState) {
        try {
            const parsedState = JSON.parse(savedState);
            // Mescla o estado salvo com o estado inicial para garantir novas propriedades
            gameState = { ...gameState, ...parsedState };

            // Garantir que arrays/objetos sejam inicializados se não existirem
            // e que o campo dateObj seja convertido para Date se vier de string
            if (!Array.isArray(gameState.recentActivities)) {
                gameState.recentActivities = [];
            }
            if (!Array.isArray(gameState.activityHistory)) { // NOVO: Inicializa activityHistory
                gameState.activityHistory = [];
            }
            // Converte dateObj de string ISO para objeto Date para ordenação
            gameState.activityHistory.forEach(activity => {
                if (typeof activity.dateObj === 'string') {
                    activity.dateObj = new Date(activity.dateObj);
                }
            });


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

        } catch (e) {
            console.error("Erro ao carregar gameState do localStorage:", e);
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

    // Receita Simulada
    let revenueExercises = 0;
    if (gameState.exercisesCompleted >= 50) {
        revenueExercises = EXERCISE_REVENUE_30 + EXERCISE_REVENUE_50_ADDITIONAL; // 50 + 100 = 150
    } else if (gameState.exercisesCompleted >= 30) {
        revenueExercises = EXERCISE_REVENUE_30; // 50
    }
    let revenueProjects = gameState.projectsCompleted * REVENUE_PER_PROJECT;
    gameState.simulatedRevenue = revenueExercises + revenueProjects;
}

/**
 * Inicializa ou atualiza o gráfico de exercícios por semana.
 */
function updateExercisesChart() {
    const labels = Object.keys(gameState.exercisesPerWeek).sort(); // Semanas ordenadas
    const data = labels.map(week => gameState.exercisesPerWeek[week]);

    if (exercisesChart) {
        exercisesChart.destroy(); // Destrói a instância anterior do gráfico
    }

    const ctx = exercisesChartCanvas.getContext('2d');
    exercisesChart = new Chart(ctx, {
        type: 'line', // Alterado para gráfico de linha
        data: {
            labels: labels,
            datasets: [{
                label: 'Exercícios Concluídos',
                data: data,
                backgroundColor: 'rgba(54, 162, 235, 0.4)', // Fundo abaixo da linha
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.3, // Curva suave na linha
                fill: true // Preenche a área abaixo da linha
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantidade de Exercícios'
                    },
                    ticks: {
                        stepSize: 1, // Garante que o eixo Y mostre números inteiros
                        precision: 0 // Remove casas decimais
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Semana do Ano (YYYY-WW)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function (context) {
                            return `Semana: ${context[0].label}`;
                        },
                        label: function (context) {
                            return `Exercícios: ${context.raw}`;
                        }
                    }
                },
                legend: {
                    display: false // Oculta a legenda se houver apenas um dataset
                }
            }
        }
    });
}

// ===============================================
// 4. Lógica de Gerenciamento de Projetos
// ===============================================

function createNewProject() {
    const projectName = newProjectNameInput.value.trim();
    if (projectName) {
        const newProject = {
            id: Date.now(), // ID único baseado no timestamp
            name: projectName,
            status: 'Em Andamento', // 'Em Andamento', 'Pausado', 'Concluído'
            startDate: new Date().toLocaleDateString('pt-BR'),
            lastUpdate: new Date().toLocaleDateString('pt-BR')
        };
        gameState.activeProjects.push(newProject);
        newProjectNameInput.value = ''; // Limpa o input
        saveGameState();
        renderActiveProjects();
        addActivityToList('Projeto Criado', `Novo projeto: "${projectName}"`);
    } else {
        alert('Por favor, digite um nome para o projeto.');
    }
}

function renderActiveProjects() {
    activeProjectsContainer.innerHTML = ''; // Limpa o container
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

    // Adiciona event listeners aos botões de cada card
    activeProjectsContainer.querySelectorAll('.project-buttons button').forEach(button => {
        button.addEventListener('click', (event) => {
            const projectId = parseInt(event.target.dataset.id);
            const project = gameState.activeProjects.find(p => p.id === projectId);
            if (!project) return;

            const action = event.target.classList[0]; // 'pause', 'resume', 'complete', 'archive'
            project.lastUpdate = new Date().toLocaleDateString('pt-BR'); // Atualiza data da última ação

            if (action === 'pause') {
                project.status = 'Pausado';
                addActivityToList('Projeto Pausado', `"${project.name}" foi pausado.`);
            } else if (action === 'resume') {
                project.status = 'Em Andamento';
                addActivityToList('Projeto Retomado', `"${project.name}" foi retomado.`);
            } else if (action === 'complete') {
                project.status = 'Concluído';
                gameState.projectsCompleted++; // Incrementa o contador de projetos concluídos
                recalculateMetrics(); // Recalcula XP e receita
                addActivityToList('Projeto Concluído', `"${project.name}" concluído!`);

                // Move o projeto para a lista de concluídos e remove dos ativos
                gameState.completedProjects.push(project);
                gameState.activeProjects = gameState.activeProjects.filter(p => p.id !== projectId);
                updateUI(); // Atualiza dashboard
            } else if (action === 'archive') {
                if (confirm(`Tem certeza que deseja arquivar o projeto "${project.name}"? Ele será removido da lista de ativos.`)) {
                    gameState.activeProjects = gameState.activeProjects.filter(p => p.id !== projectId);
                    addActivityToList('Projeto Arquivado', `"${project.name}" foi arquivado (removido da lista de ativos).`);
                } else {
                    return; // Não faz nada se o usuário cancelar
                }
            }
            saveGameState();
            renderActiveProjects(); // Re-renderiza projetos ativos
        });
    });
}

function renderCompletedProjects() {
    completedProjectsList.innerHTML = '';
    if (gameState.completedProjects.length === 0) {
        completedProjectsList.innerHTML = '<li>Nenhum projeto concluído ainda.</li>';
        return;
    }
    // Ordenar projetos concluídos por data de conclusão (mais recente primeiro)
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
    const entryText = journalEntryTextarea.value.trim();
    if (entryText) {
        const now = new Date();
        const dateString = now.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        const newEntry = {
            date: dateString,
            time: timeString,
            text: entryText
        };
        gameState.journalEntries.unshift(newEntry); // Adiciona a entrada mais recente no topo
        journalEntryTextarea.value = ''; // Limpa a textarea
        saveGameState();
        renderJournalEntries();
        addActivityToList('Diário', `Nova entrada no diário (${dateString}).`);
    } else {
        alert('Por favor, escreva algo para salvar no diário.');
    }
}

function renderJournalEntries() {
    journalEntriesList.innerHTML = '';
    if (gameState.journalEntries.length === 0) {
        journalEntriesList.innerHTML = '<li>Nenhuma entrada no diário ainda.</li>';
        return;
    }
    gameState.journalEntries.forEach(entry => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `<strong>${entry.date} às ${entry.time}:</strong> ${entry.text}`;
        journalEntriesList.appendChild(listItem);
    });
}


// ===============================================
// 6. Funções de Manipulação de Eventos (Botões)
// ===============================================

addLessonButton.addEventListener('click', () => {
    gameState.lessonsCompleted++;
    recalculateMetrics();
    addActivityToList('Aula', `Aula #${gameState.lessonsCompleted}`);
    saveGameState();
    updateUI();
});

addSmallDebugButton.addEventListener('click', () => {
    gameState.exercisesCompleted++;
    const currentWeek = getWeekNumber(new Date());
    gameState.exercisesPerWeek[currentWeek] = (gameState.exercisesPerWeek[currentWeek] || 0) + 1;

    recalculateMetrics();
    addActivityToList('Exercício', `Debug Pequeno #${gameState.exercisesCompleted}`);
    saveGameState();
    updateUI();
});

addLargeDebugButton.addEventListener('click', () => {
    gameState.exercisesCompleted++;
    const currentWeek = getWeekNumber(new Date());
    gameState.exercisesPerWeek[currentWeek] = (gameState.exercisesPerWeek[currentWeek] || 0) + 1;

    recalculateMetrics();
    addActivityToList('Exercício', `Debug Grande #${gameState.exercisesCompleted}`);
    saveGameState();
    updateUI();
});

// Cronômetro Listeners
startTimerButton.addEventListener('click', startTimer);
pauseTimerButton.addEventListener('click', pauseTimer);
resetTimerButton.addEventListener('click', resetTimer);

// Projeto Listeners
createNewProjectButton.addEventListener('click', createNewProject);
viewCompletedProjectsButton.addEventListener('click', () => {
    renderCompletedProjects(); // Renderiza a lista de projetos concluídos
    completedProjectsModal.classList.add('active'); // Mostra o modal
});

// Diário Listeners
openDailyJournalButton.addEventListener('click', () => {
    renderJournalEntries(); // Renderiza as entradas do diário
    journalModal.classList.add('active'); // Mostra o modal
});
saveJournalEntryButton.addEventListener('click', saveJournalEntry);

// Fechar Modais (para todos os botões de fechar)
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        journalModal.classList.remove('active');
        completedProjectsModal.classList.remove('active');
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
});


resetDataButton.addEventListener('click', () => {
    if (confirm('Tem certeza que deseja reiniciar TODOS os dados, incluindo cronômetro, gráficos, projetos e diário? Esta ação é irreversível!')) {
        pauseTimer(); // Para o cronômetro antes de resetar
        gameState = {
            totalXP: 0,
            lessonsCompleted: 0,
            exercisesCompleted: 0,
            projectsCompleted: 0,
            simulatedRevenue: 0,
            totalFollowers: 0,
            recentActivities: [],
            activityHistory: [], // Resetar o histórico completo
            timerSeconds: 0,
            exercisesPerWeek: {},
            activeProjects: [],
            completedProjects: [],
            journalEntries: []
        };
        saveGameState();
        recalculateMetrics();
        updateUI();
        updateTimerDisplay(); // Garante que o cronômetro visualmente zere
        alert('Todos os dados foram reiniciados com sucesso!');
    }
});

// ===============================================
// 7. Inicialização (Quando a página carrega)
// ===============================================

document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    recalculateMetrics();
    updateUI();
    updateTimerDisplay(); // Garante que o display do timer seja atualizado ao carregar

    // Ajusta o margin-top do main após o DOM carregar e os estilos serem aplicados
    // Isso garante que o conteúdo não fique escondido sob a dashboard fixa.
    adjustMainContentMargin();
    // Re-ajusta a margem em caso de redimensionamento da janela (ex: rotação de tablet)
    window.addEventListener('resize', adjustMainContentMargin);
});

// ===============================================
// 8. Configuração PWA (Service Worker e Manifest)
// ===============================================

// Registra o Service Worker para funcionalidade offline
// Para testar offline, você precisa de um servidor local simples ou usar o Live Server no VS Code.
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