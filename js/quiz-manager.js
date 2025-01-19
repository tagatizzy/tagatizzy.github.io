function getRandomQuestions(questions, count) {
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

class QuizManager {
    constructor() {
        this.currentModule = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
    }

    async loadModule(moduleNumber) {
        try {
            const response = await fetch(`data/module${moduleNumber}/questions.json`);
            const data = await response.json();
            
            // Sélectionne le nombre requis de questions aléatoirement
            const randomQuestions = getRandomQuestions(
                data.questions, 
                data.moduleInfo.requiredQuestions
            );
            
            this.questions = randomQuestions;
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.displayQuestion();
        } catch (error) {
            console.error('Erreur lors du chargement des questions:', error);
        }
    }
    // ... reste du code inchangé
}
