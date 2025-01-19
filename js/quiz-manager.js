/**
 * Gestionnaire de Quiz pour la préparation à l'examen EASA
 * Cette classe gère le chargement, l'affichage et le suivi des questions
 */
class QuizManager {
    constructor() {
        // Initialisation des propriétés de base
        this.currentModule = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;

        // Attendre que le document soit chargé avant d'initialiser
        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
        });

        console.log('QuizManager créé');
    }

    /**
     * Initialise les écouteurs d'événements et prépare l'interface
     */
    initialize() {
        // Ajoute les écouteurs pour les boutons de module
        const moduleButtons = document.querySelectorAll('[data-module]');
        moduleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const moduleId = e.target.dataset.module;
                console.log(`Module ${moduleId} sélectionné`);
                this.loadModule(moduleId);
            });
        });

        console.log('QuizManager initialisé');
    }

    /**
     * Charge les questions pour un module spécifique
     */
    async loadModule(moduleNumber) {
        console.log(`Chargement du module ${moduleNumber}`);
        try {
            const response = await fetch(`data/module3/${moduleNumber}_1.json`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Questions chargées:', data);
            
            this.questions = data.questions;
            this.currentModule = moduleNumber;
            this.currentQuestionIndex = 0;
            this.score = 0;
            
            this.displayQuestion();
        } catch (error) {
            console.error('Erreur de chargement:', error);
            this.handleError(error);
        }
    }

    /**
     * Affiche la question actuelle
     */
    displayQuestion() {
        console.log(`Affichage de la question ${this.currentQuestionIndex + 1}`);
        
        const quizContainer = document.getElementById('quiz-container');
        if (!this.questions.length) {
            quizContainer.innerHTML = '<p>Aucune question disponible</p>';
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;

        // Construit l'HTML de la question
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
                            id="option-${index}"
                            class="option"
                            onclick="quizManager.checkAnswer(${index})"
                        >
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Vérifie la réponse sélectionnée
     */
    checkAnswer(selectedIndex) {
        console.log(`Vérification de la réponse: ${selectedIndex}`);
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;
        
        if (isCorrect) {
            this.score++;
        }

        // Désactive tous les boutons après la réponse
        const buttons = document.querySelectorAll('.option');
        buttons.forEach(button => {
            button.disabled = true;
            if (parseInt(button.id.split('-')[1]) === question.correctAnswer) {
                button.style.backgroundColor = '#e8f6e8';
            } else if (parseInt(button.id.split('-')[1]) === selectedIndex && !isCorrect) {
                button.style.backgroundColor = '#fde8e8';
            }
        });

        // Ajoute l'explication
        const explanationDiv = document.createElement('div');
        explanationDiv.className = `explanation ${isCorrect ? 'correct' : 'incorrect'}`;
        explanationDiv.innerHTML = `
            <h4>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h4>
            <p>${question.explanation}</p>
            <button onclick="quizManager.nextQuestion()">
                ${this.currentQuestionIndex + 1 < this.questions.length ? 'Question suivante' : 'Voir les résultats'}
            </button>
        `;

        document.querySelector('.quiz-question').appendChild(explanationDiv);
    }

    /**
     * Passe à la question suivante ou affiche les résultats
     */
    nextQuestion() {
        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    /**
     * Affiche les résultats finaux du quiz
     */
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
                <button onclick="quizManager.loadModule('${this.currentModule}')">
                    Recommencer le quiz
                </button>
                <button onclick="location.reload()">
                    Retour à la sélection des modules
                </button>
            </div>
        `;
    }

    /**
     * Gère les erreurs qui peuvent survenir
     */
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

// Création de l'instance globale du Quiz Manager
window.quizManager = new QuizManager();
