class QuizManager {
    constructor() {
        // Initialisation des propriétés essentielles
        this.currentModule = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;

        // Attendre que la page soit chargée
        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
        });
    }

    initialize() {
        const moduleButtons = document.querySelectorAll('[data-module]');
        moduleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const moduleId = e.target.dataset.module;
                this.loadModule(moduleId);
            });
        });
    }

    async loadModule(moduleNumber) {
        try {
            // Chargement du fichier JSON
            const response = await fetch(`data/module3/3_1.json`);
            if (!response.ok) throw new Error('Erreur de chargement');
            const data = await response.json();

            // Récupération de toutes les questions et mélange
            const allQuestions = [...data.questions];
            const shuffled = this.shuffleQuestions(allQuestions);

            // Sélection du nombre exact de questions requis
            const requiredQuestions = data.moduleInfo.requiredQuestions || 2; // Par défaut 2 si non spécifié
            this.questions = shuffled.slice(0, requiredQuestions);
            
            // Réinitialisation du quiz
            this.currentModule = moduleNumber;
            this.currentQuestionIndex = 0;
            this.score = 0;

            // Démarrage du quiz
            this.displayQuestion();
        } catch (error) {
            this.handleError(error);
        }
    }

    shuffleQuestions(questions) {
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
        return questions;
    }

    displayQuestion() {
        const quizContainer = document.getElementById('quiz-container');
        if (!this.questions.length) {
            quizContainer.innerHTML = '<p>Aucune question disponible</p>';
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;

        quizContainer.innerHTML = `
            <div class="quiz-question">
                <div class="progress-bar">
                    <div class="progress" style="width: ${progress}%"></div>
                </div>
                <h3>Question ${this.currentQuestionIndex + 1}/${this.questions.length}</h3>
                <p>${question.question}</p>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <button 
                            class="option" 
                            data-index="${index}"
                        >${option}</button>
                    `).join('')}
                </div>
            </div>
        `;

        // Ajout des écouteurs d'événements pour les réponses
        const optionButtons = quizContainer.querySelectorAll('.option');
        optionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedIndex = parseInt(e.target.dataset.index);
                this.checkAnswer(selectedIndex);
            });
        });
    }

    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;

        if (isCorrect) {
            this.score++;
        }

        // Désactivation des boutons après la réponse
        const optionButtons = document.querySelectorAll('.option');
        optionButtons.forEach(button => {
            button.disabled = true;
            const index = parseInt(button.dataset.index);
            if (index === question.correctAnswer) {
                button.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                button.classList.add('incorrect');
            }
        });

        // Affichage de l'explication
        const explanationDiv = document.createElement('div');
        explanationDiv.className = `explanation ${isCorrect ? 'correct' : 'incorrect'}`;
        explanationDiv.innerHTML = `
            <h4>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h4>
            <p>${question.explanation}</p>
            <button class="next-button">
                ${this.currentQuestionIndex + 1 < this.questions.length ? 'Question suivante' : 'Voir les résultats'}
            </button>
        `;

        document.querySelector('.quiz-question').appendChild(explanationDiv);

        // Configuration du bouton suivant
        const nextButton = explanationDiv.querySelector('.next-button');
        nextButton.addEventListener('click', () => this.nextQuestion());
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        const percentage = (this.score / this.questions.length) * 100;
        const quizContainer = document.getElementById('quiz-container');
        
        quizContainer.innerHTML = `
            <div class="results">
                <h2>Quiz terminé!</h2>
                <div class="score-card">
                    <p>Votre score: ${this.score}/${this.questions.length}</p>
                    <p>Pourcentage: ${percentage.toFixed(1)}%</p>
                </div>
                <div class="action-buttons">
                    <button onclick="quizManager.loadModule('${this.currentModule}')">
                        Recommencer (nouvelles questions)
                    </button>
                    <button onclick="location.reload()">
                        Retour au menu
                    </button>
                </div>
            </div>
        `;
    }

    handleError(error) {
        const quizContainer = document.getElementById('quiz-container');
        quizContainer.innerHTML = `
            <div class="error-message">
                <h3>Une erreur s'est produite</h3>
                <p>${error.message}</p>
                <button onclick="location.reload()">Réessayer</button>
            </div>
        `;
    }
}

// Création de l'instance globale
window.quizManager = new QuizManager();
