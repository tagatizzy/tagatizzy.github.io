// Gestionnaire principal du quiz
class QuizManager {
    constructor() {
        this.currentModule = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
    }

    // Charge les questions pour un module spécifique
    async loadModule(moduleNumber) {
        try {
            // Nous chargerons les questions depuis notre JSON
            const response = await fetch(`data/module${moduleNumber}/questions.json`);
            const data = await response.json();
            this.questions = data.questions;
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.displayQuestion();
        } catch (error) {
            console.error('Erreur lors du chargement des questions:', error);
        }
    }

    // Affiche la question courante
    displayQuestion() {
        if (this.questions.length === 0) return;

        const question = this.questions[this.currentQuestionIndex];
        const quizContainer = document.getElementById('quiz-container');
        
        quizContainer.innerHTML = `
            <div class="quiz-question">
                <h3>${question.question}</h3>
                ${question.options.map((option, index) => `
                    <div class="option" onclick="quizManager.checkAnswer(${index})">
                        ${option}
                    </div>
                `).join('')}
            </div>
            <div class="progress-bar">
                <div class="progress" style="width: ${(this.currentQuestionIndex / this.questions.length) * 100}%"></div>
            </div>
        `;
    }

    // Vérifie la réponse sélectionnée
    checkAnswer(selectedIndex) {
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;

        if (isCorrect) {
            this.score++;
        }

        // Affiche l'explication
        const explanationDiv = document.createElement('div');
        explanationDiv.className = 'explanation';
        explanationDiv.innerHTML = `
            <p>${isCorrect ? '✓ Correct' : '✗ Incorrect'}</p>
            <p>${question.explanation}</p>
        `;
        document.querySelector('.quiz-question').appendChild(explanationDiv);
        explanationDiv.style.display = 'block';

        // Passe à la question suivante après un délai
        setTimeout(() => this.nextQuestion(), 3000);
    }

    // Passe à la question suivante
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    // Affiche les résultats finaux
    showResults() {
        const quizContainer = document.getElementById('quiz-container');
        const percentage = (this.score / this.questions.length) * 100;
        
        quizContainer.innerHTML = `
            <div class="results">
                <h2>Quiz terminé !</h2>
                <p>Votre score : ${this.score}/${this.questions.length} (${percentage.toFixed(1)}%)</p>
                <button onclick="quizManager.loadModule(${this.currentModule})">Recommencer</button>
            </div>
        `;
    }
}

// Initialisation du gestionnaire de quiz
const quizManager = new QuizManager();

// Fonction pour sélectionner un module
function selectModule(moduleNumber) {
    quizManager.currentModule = moduleNumber;
    quizManager.loadModule(moduleNumber);
}
