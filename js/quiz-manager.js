/**
 * Gestionnaire de Quiz pour la préparation à l'examen EASA
 * Cette version inclut la sélection aléatoire des questions pour mieux simuler l'examen
 * tout en offrant plus de variété dans la pratique
 */
class QuizManager {
    constructor() {
        // Initialisation des propriétés de base
        this.currentModule = null;     // Module actuellement sélectionné
        this.questions = [];           // Questions sélectionnées pour le quiz en cours
        this.allQuestions = [];        // Banque complète de questions disponibles
        this.currentQuestionIndex = 0; // Position dans le quiz actuel
        this.score = 0;               // Score du quiz en cours
        this.requiredQuestions = 0;    // Nombre de questions requis par le syllabus EASA

        // Initialisation quand le DOM est prêt
        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
            console.log('QuizManager initialisé');
        });
    }

    /**
     * Mélange un tableau de manière aléatoire
     * Utilise l'algorithme de Fisher-Yates pour un mélange équitable
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Sélectionne un nombre spécifique de questions au hasard
     * Cette fonction est cruciale pour respecter le format EASA
     */
    selectRandomQuestions(questions, count) {
        console.log(`Sélection de ${count} questions parmi ${questions.length} disponibles`);
        return this.shuffleArray([...questions]).slice(0, count);
    }

    /**
     * Charge le module et prépare le quiz avec le bon nombre de questions
     */
    async loadModule(moduleNumber) {
        console.log('Chargement du module:', moduleNumber);
        try {
            const response = await fetch(`data/module3/3_1.json`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP! statut: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Données chargées:', data);
            
            // Stocke toutes les questions disponibles
            this.allQuestions = data.questions;
            // Récupère le nombre requis de questions depuis les informations du module
            this.requiredQuestions = data.moduleInfo.requiredQuestions;
            
            // Sélectionne aléatoirement le bon nombre de questions
            this.questions = this.selectRandomQuestions(
                this.allQuestions, 
                this.requiredQuestions
            );
            
            // Réinitialise le quiz
            this.currentModule = moduleNumber;
            this.currentQuestionIndex = 0;
            this.score = 0;
            
            // Commence le quiz
            this.displayQuestion();
            
            console.log(`Quiz préparé avec ${this.requiredQuestions} questions sélectionnées`);
        } catch (error) {
            console.error('Erreur lors du chargement:', error);
            this.handleError(error);
        }
    }

    // [Le reste du code reste identique à la version précédente...]

    /**
     * Affiche les statistiques détaillées à la fin du quiz
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
                    <p>Questions du module: ${this.requiredQuestions}/${this.allQuestions.length} disponibles</p>
                </div>
                <div class="action-buttons">
                    <button onclick="quizManager.loadModule('${this.currentModule}')">
                        Nouveau quiz (nouvelles questions)
                    </button>
                    <button onclick="location.reload()">
                        Retour au menu principal
                    </button>
                </div>
            </div>
        `;
    }

    // [Le reste des méthodes reste identique...]
}

// Création de l'instance globale du Quiz Manager
window.quizManager = new QuizManager();
console.log('QuizManager créé et attaché à window');
