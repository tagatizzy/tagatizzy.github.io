/**
 * Gestionnaire de Quiz pour la préparation à l'examen EASA
 * Cette classe gère le chargement, l'affichage et le suivi des questions
 */
class QuizManager {
    constructor() {
        // Initialisation des propriétés de base
        this.currentModule = null;     // Module actuellement sélectionné
        this.questions = [];           // Liste des questions chargées
        this.currentQuestionIndex = 0; // Index de la question actuelle
        this.score = 0;               // Score du quiz en cours

        // S'assurer que le DOM est chargé avant d'initialiser
        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
            console.log('QuizManager initialisé');
        });
    }

    /**
     * Initialise les écouteurs d'événements pour les boutons de module
     */
    initialize() {
        const moduleButtons = document.querySelectorAll('[data-module]');
        moduleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const moduleId = e.target.dataset.module;
                console.log('Module sélectionné:', moduleId);
                this.loadModule(moduleId);
            });
        });
    }

    /**
     * Charge les questions du module sélectionné
     */
    async loadModule(moduleNumber) {
        console.log('Chargement du module:', moduleNumber);
        try {
            // Charger le fichier JSON du module
            const response = await fetch(`data/module3/3_1.json`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Questions chargées:', data);
            
            // Initialiser le quiz avec les questions chargées
            this.questions = data.questions;
            this.currentModule = moduleNumber;
            this.currentQuestionIndex = 0;
            this.score = 0;
            
            // Afficher la première question
            this.displayQuestion();
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            this.handleError(error);
        }
    }

    /**
     * Affiche la question actuelle et configure les écouteurs d'événements
     */
    displayQuestion() {
        console.log('Affichage question:', this.currentQuestionIndex + 1);
        
        const quizContainer = document.getElementById('quiz-container');
        if (!this.questions.length) {
            quizContainer.innerHTML = '<p>Aucune question disponible</p>';
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;

        // Construction du HTML de la question
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
                        >
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;

        // Ajout des écouteurs d'événements sur les options APRÈS leur création
        const optionButtons = quizContainer.querySelectorAll('.option');
        optionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const selectedIndex = parseInt(e.target.dataset.index);
                console.log('Option sélectionnée:', selectedIndex);
                this.checkAnswer(selectedIndex);
            });
        });
    }

    /**
     * Vérifie la réponse sélectionnée et affiche le feedback
     */
    checkAnswer(selectedIndex) {
        console.log('Vérification réponse:', selectedIndex);
        
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;
        
        // Mise à jour du score
        if (isCorrect) {
            this.score++;
        }

        // Désactiver les options et montrer la bonne réponse
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

        // Créer la zone d'explication
        const explanationDiv = document.createElement('div');
        explanationDiv.className = `explanation ${isCorrect ? 'correct' : 'incorrect'}`;
        explanationDiv.innerHTML = `
            <h4>${isCorrect ? '✓ Correct!' : '✗ Incorrect'}</h4>
            <p>${question.explanation}</p>
            <button class="next-button">
                ${this.currentQuestionIndex + 1 < this.questions.length ? 'Question suivante' : 'Voir les résultats'}
            </button>
        `;

        // Ajouter l'explication et configurer le bouton suivant
        const quizQuestion = document.querySelector('.quiz-question');
        quizQuestion.appendChild(explanationDiv);

        // Configurer le bouton suivant
        const nextButton = explanationDiv.querySelector('.next-button');
        nextButton.addEventListener('click', () => this.nextQuestion());
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
                <div class="action-buttons">
                    <button onclick="quizManager.loadModule('${this.currentModule}')">
                        Recommencer le quiz
                    </button>
                    <button onclick="location.reload()">
                        Retour au menu principal
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Gère les erreurs qui peuvent survenir
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

// Création de l'instance globale du Quiz Manager
window.quizManager = new QuizManager();
console.log('QuizManager créé et attaché à window');
