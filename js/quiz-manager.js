/**
 * Gestionnaire de Quiz pour la préparation à l'examen EASA
 * Cette classe gère le chargement des questions, l'affichage et le suivi des scores
 */
class QuizManager {
    /**
     * Initialise un nouveau gestionnaire de quiz
     */
    constructor() {
        // Stockage des données du quiz
        this.currentModule = null;        // Module actuel
        this.questions = [];              // Liste des questions
        this.currentQuestionIndex = 0;    // Index de la question actuelle
        this.score = 0;                   // Score du quiz
        
        // Initialisation des écouteurs d'événements
        this.initializeEventListeners();
        
        console.log('Quiz Manager initialisé');
    }

    /**
     * Configure les écouteurs d'événements pour l'interface utilisateur
     */
    initializeEventListeners() {
        // Attend que le DOM soit chargé avant d'ajouter les écouteurs
        document.addEventListener('DOMContentLoaded', () => {
            const moduleButtons = document.querySelectorAll('[data-module]');
            moduleButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    const moduleId = e.target.getAttribute('data-module');
                    this.loadModule(moduleId);
                });
            });
        });
    }

    /**
     * Charge les questions pour un module spécifique
     * @param {string} moduleNumber - Numéro du module à charger
     */
    async loadModule(moduleNumber) {
        console.log(`Chargement du module ${moduleNumber}`);
        try {
            // Charge le fichier JSON du module
            const response = await fetch(`data/module${moduleNumber}/3_1.json`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Questions chargées:', data);
            
            // Mélange les questions et en sélectionne le nombre requis
            this.questions = this.shuffleQuestions(data.questions, data.moduleInfo.requiredQuestions);
            this.currentModule = moduleNumber;
            this.currentQuestionIndex = 0;
            this.score = 0;
            
            // Affiche la première question
            this.displayQuestion();
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Mélange les questions et en sélectionne un nombre spécifique
     * @param {Array} questions - Liste complète des questions
     * @param {number} count - Nombre de questions à sélectionner
     * @returns {Array} Questions sélectionnées
     */
    shuffleQuestions(questions, count) {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, count);
    }

    /**
     * Affiche la question actuelle
     */
    displayQuestion() {
        const quizContainer = document.getElementById('quiz-container');
        
        // Vérifie s'il reste des questions
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
                        <button class="option" data-index="${index}">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Ajoute les écouteurs pour les boutons de réponse
        const optionButtons = quizContainer.querySelectorAll('.option');
        optionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedIndex = parseInt(e.target.getAttribute('data-index'));
                this.checkAnswer(selectedIndex);
            });
        });
    }

    /**
     * Vérifie la réponse sélectionnée
     * @param {number} selectedIndex - Index de la réponse sélectionnée
     */
    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;
        
        if (isCorrect) {
            this.score++;
        }

        this.displayExplanation(isCorrect, question.explanation);
    }

    /**
     * Affiche l'explication après une réponse
     * @param {boolean} isCorrect - Indique si la réponse était correcte
     * @param {string} explanation - Explication de la réponse
     */
    displayExplanation(isCorrect, explanation) {
        const quizContainer = document.getElementById('quiz-container');
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'explanation';
        explanationDiv.innerHTML = `
            <div class="${isCorrect ? 'correct' : 'incorrect'}">
                <h4>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h4>
                <p>${explanation}</p>
                <button class="next-button">
                    ${this.currentQuestionIndex + 1 < this.questions.length ? 'Question suivante' : 'Voir les résultats'}
                </button>
            </div>
        `;

        const nextButton = explanationDiv.querySelector('.next-button');
        nextButton.addEventListener('click', () => this.nextQuestion());

        // Désactive les boutons de réponse
        const optionButtons = quizContainer.querySelectorAll('.option');
        optionButtons.forEach(button => button.disabled = true);

        quizContainer.appendChild(explanationDiv);
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
     * Gère les erreurs de chargement et autres problèmes
     * @param {Error} error - L'erreur à gérer
     */
    handleError(error) {
        console.error('Erreur:', error);
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

// Création de l'instance du Quiz Manager
const quizManager = new QuizManager();
