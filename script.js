document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const taskDeadline = document.getElementById('taskDeadline');
    const taskCategory = document.getElementById('taskCategory');
    const focusModeBtn = document.getElementById('focusModeBtn');
    const completedTasks = document.getElementById('completedTasks');
    const gamificationPoints = document.getElementById('points');
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    
    let points = 0;
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let focusMode = false;

    // Função para carregar as tarefas
    function loadTasks() {
        console.log("Carregando tarefas...");
        taskList.innerHTML = '';  // Limpa a lista de tarefas
        tasks.forEach((task, index) => {
            const taskDiv = document.createElement('div');
            taskDiv.classList.add('task');
            taskDiv.innerHTML = `
                <span>
                    ${task.text} (Categoria: ${task.category}, Prazo: ${task.deadline})
                </span>
                <button class="removeTaskBtn" data-index="${index}">Remover</button>
                <button class="completeTaskBtn" data-index="${index}">Concluir</button>
                <button class="addSubtaskBtn" data-index="${index}">Adicionar Subtarefa</button>
            `;
            taskList.appendChild(taskDiv);
        });

        // Adicionar ouvintes de eventos para os botões de tarefas
        const removeButtons = document.querySelectorAll('.removeTaskBtn');
        removeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                removeTask(index);
            });
        });

        const completeButtons = document.querySelectorAll('.completeTaskBtn');
        completeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                completeTask(index);
            });
        });

        const addSubtaskButtons = document.querySelectorAll('.addSubtaskBtn');
        addSubtaskButtons.forEach(button => {
            button.addEventListener('click', () => {
                const index = button.getAttribute('data-index');
                addSubtask(index);
            });
        });
    }

    // Função para adicionar tarefa
    function addTask() {
        const taskText = taskInput.value.trim();
        const deadline = taskDeadline.value;
        const category = taskCategory.value;

        if (taskText) {
            tasks.push({ text: taskText, deadline: deadline, category: category, subtasks: [], completed: false });
            localStorage.setItem('tasks', JSON.stringify(tasks));
            taskInput.value = '';  // Limpa o campo de entrada
            loadTasks();
        } else {
            console.log("Tarefa não adicionada. O campo está vazio.");
        }
    }

    // Função para remover tarefa
    function removeTask(index) {
        tasks.splice(index, 1);
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
    }

    // Função para concluir tarefa
    function completeTask(index) {
        tasks[index].completed = true;
        points += 10;  // Ganha pontos ao concluir tarefa
        localStorage.setItem('tasks', JSON.stringify(tasks));
        loadTasks();
        updatePoints();
    }

    // Função para adicionar subtarefa
    function addSubtask(index) {
        const subtask = prompt('Digite a subtarefa:');
        if (subtask) {
            tasks[index].subtasks.push(subtask);
            localStorage.setItem('tasks', JSON.stringify(tasks));
            loadTasks();
        }
    }

    // Função para alternar o Modo de Foco
    function toggleFocusMode() {
        focusMode = !focusMode;
        focusModeBtn.innerText = focusMode ? 'Sair do Modo Foco' : 'Modo Foco';
        taskList.style.display = focusMode ? 'none' : 'block';
        localStorage.setItem('focusMode', focusMode ? 'enabled' : 'disabled');
    }

    // Função para mudar o tema (Claro/Escuro)
    function changeTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }

    // Carregar o tema ao iniciar a página
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark');
    } else {
        document.body.classList.remove('dark');
    }

    // Função para atualizar pontos de gamificação
    function updatePoints() {
        gamificationPoints.innerText = points;
    }

    // Função para carregar histórico de tarefas completadas
    function loadCompletedTasks() {
        console.log("Carregando tarefas completadas...");
        completedTasks.innerHTML = ''; // Limpa a lista de tarefas completadas

        tasks.forEach((task) => {
            if (task.completed) {
                const taskDiv = document.createElement('div');
                taskDiv.classList.add('task');
                taskDiv.innerHTML = `
                    <span>${task.text} (Categoria: ${task.category}, Concluída)</span>
                `;
                completedTasks.appendChild(taskDiv);
            }
        });
    }

    // Adicionar ouvintes de eventos para os botões de tema
    lightThemeBtn.addEventListener('click', () => changeTheme('light'));
    darkThemeBtn.addEventListener('click', () => changeTheme('dark'));

    // Adicionar ouvintes de evento para o Modo Foco
    focusModeBtn.addEventListener('click', toggleFocusMode);

    // Adicionar tarefa ao clicar no botão
    addTaskBtn.addEventListener('click', addTask);

    // Adicionar tarefa ao pressionar Enter
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    // Carregar tarefas e tarefas completadas
    loadTasks();
    loadCompletedTasks(); // Chama a função para exibir as tarefas completadas

    // Funcionalidade de voz com Web Speech API
    function voiceControl() {
        const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.lang = 'pt-BR';
        recognition.start();

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript.toLowerCase();
            if (transcript.includes('adicionar tarefa')) {
                taskInput.value = transcript.replace('adicionar tarefa', '').trim();
                addTask();
            } else if (transcript.includes('concluir tarefa')) {
                const taskIndex = parseInt(transcript.split(' ')[2]);
                completeTask(taskIndex);
            }
        }
    }

    // Ativar controle de voz
    voiceControl();
});

