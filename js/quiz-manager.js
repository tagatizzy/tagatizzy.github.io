class QuizManager {
    constructor() {
        this.currentModule = null;
        this.questions = [];
        this.allQuestions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.requiredQuestions = 0;

        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
            console.log('QuizManager initialisé');
        });
    }

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

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async loadModule(moduleNumber) {
        console.log('Chargement du module:', moduleNumber);
        try {
            // Charger le fichier JSON
            const response = await fetch(`data/module3/3_1.json`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Extraire le nombre requis de questions depuis moduleInfo
            this.requiredQuestions = data.moduleInfo.requiredQuestions;
            console.log(`Nombre de questions requis: ${this.requiredQuestions}`);
            
            // Mélanger toutes les questions et en sélectionner le nombre requis
            this.allQuestions = data.questions;
            const shuffledQuestions = this.shuffleArray([...this.allQuestions]);
            this.questions = shuffledQuestions.slice(0, this.requiredQuestions);
            
            console.log(`Questions sélectionnées: ${this.questions.length}`);
            
            // Réinitialiser le quiz
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

    // Le reste du code reste identique...
    // [Incluez ici le reste des méthodes: displayQuestion, checkAnswer, etc.]
}

// Création de l'instance globale
window.quizManager = new QuizManager();
