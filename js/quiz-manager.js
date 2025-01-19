class QuizManager {
    constructor() {
        this.currentModule = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        
        // Afficher un message lors de l'initialisation
        console.log('QuizManager initialisé');
    }

    async loadModule(moduleNumber) {
        console.log('Chargement du module:', moduleNumber);
        try {
            // Tentons de charger le fichier 3_1.json pour commencer
            const response = await fetch(`data/module3/3_1.json`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            console.log('Données chargées:', data);
            
            this.questions = data.questions;
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.displayQuestion();
        } catch (error) {
            console.error('Erreur lors du chargement des questions:', error);
            // Affichons l'erreur à l'utilisateur
            document.getElementById('quiz-container').innerHTML = `
                <div class="error">
                    Une erreur s'est produite lors du chargement des questions. 
                    Détails : ${error.message}
                </div>
            `;
        }
    }

    displayQuestion() {
        console.log('Affichage de la question:', this.currentQuestionIndex);
        
        if (!this.questions || this.questions.length === 0) {
            console.error('Aucune question disponible');
            return;
        }

        const question = this.questions[this.currentQuestionIndex];
        const quizContainer = document.getElementById('quiz-container');
        
        quizContainer.innerHTML = `
            <div class="quiz-question">
                <h3>${question.question}</h3>
                <div class="options">
                    ${question.options.map((option, index) => `
                        <button onclick="quizManager.checkAnswer(${index})" class="option">
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
    }

    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestionIndex];
        if (selectedIndex === question.correctAnswer) {
            this.score++;
        }
        this.displayExplanation(selectedIndex === question.correctAnswer, question.explanation);
    }

    displayExplanation(isCorrect, explanation) {
        const quizContainer = document.getElementById('quiz-container');
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'explanation';
        explanationDiv.innerHTML = `
            <p class="${isCorrect ? 'correct' : 'incorrect'}">
                ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
            </p>
            <p>${explanation}</p>
            <button onclick="quizManager.nextQuestion()">Question suivante</button>
        `;
        quizContainer.appendChild(explanationDiv);
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
        const quizContainer = document.getElementById('quiz-container');
        const percentage = (this.score / this.questions.length) * 100;
        
        quizContainer.innerHTML = `
            <div class="results">
                <h2>Quiz terminé!</h2>
                <p>Votre score: ${this.score}/${this.questions.length} (${percentage.toFixed(1)}%)</p>
                <button onclick="quizManager.loadModule('3')">Recommencer</button>
            </div>
        `;
    }
}

// Créer une instance du gestionnaire de quiz
const quizManager = new QuizManager();
// À la fin du fichier quiz-manager.js
// Rendre quizManager accessible globalement
window.quizManager = new QuizManager();
