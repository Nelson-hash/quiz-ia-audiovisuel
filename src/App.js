import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, XCircle, ArrowRight, RotateCcw, User, Play, Database } from 'lucide-react';
import './App.css';

const QuizIAAudiovisuel = () => {
  const [gameState, setGameState] = useState('welcome');
  const [playerName, setPlayerName] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

  const questions = [
    {
      id: 1,
      question: "Quel est le principal défi juridique concernant les œuvres créées par l'IA dans l'audiovisuel ?",
      options: [
        "L'IA ne peut pas créer d'œuvres protégées par le droit d'auteur",
        "Les œuvres d'IA appartiennent automatiquement à l'entreprise qui développe l'outil", 
        "Le statut juridique des œuvres générées par IA reste flou dans de nombreuses juridictions",
        "Seules les œuvres hybrides (humain + IA) peuvent être protégées"
      ],
      correct: 2,
      category: "Propriété intellectuelle",
      explanation: "La plupart des pays n'ont pas encore de législation claire sur le statut des œuvres créées par IA. Questions non résolues : qui détient les droits ? L'IA peut-elle être considérée comme auteur ? Cette incertitude juridique pose des défis majeurs pour l'industrie audiovisuelle."
    },
    {
      id: 2,
      question: "Quelle précaution est essentielle lors de l'utilisation d'IA pour traiter des contenus audiovisuels sensibles ?",
      options: [
        "Utiliser uniquement des IA open source",
        "S'assurer que les données ne sont pas utilisées pour entraîner les modèles d'IA",
        "Compresser tous les fichiers avant traitement",
        "Limiter l'utilisation aux heures ouvrables uniquement"
      ],
      correct: 1,
      category: "Confidentialité des données",
      explanation: "Les données sensibles ne doivent jamais servir à améliorer les modèles d'IA. Il faut vérifier que les fournisseurs garantissent que vos contenus ne seront pas utilisés pour l'entraînement, sinon risque de fuite ou de reproduction non autorisée."
    },
    {
      id: 3,
      question: "Quelle activité liée à l'IA audiovisuelle consomme le plus d'énergie ?",
      options: [
        "L'utilisation quotidienne des outils d'IA générative",
        "Le stockage des modèles d'IA sur les serveurs",
        "L'entraînement initial des modèles d'IA sur de vastes datasets",
        "La compression des vidéos par IA"
      ],
      correct: 2,
      category: "Impact écologique",
      explanation: "L'entraînement des modèles d'IA nécessite des milliers d'heures de calcul sur des GPU puissants, consommant l'équivalent énergétique de centaines de foyers pendant des mois. L'utilisation quotidienne est bien moins gourmande que cette phase d'apprentissage initial."
    },
    {
      id: 4,
      question: "Quel risque éthique majeur peut survenir avec l'IA de génération de visages dans l'audiovisuel ?",
      options: [
        "La qualité des images générées est trop faible",
        "Les deepfakes peuvent être utilisés pour la désinformation", 
        "Le processus de génération est trop lent",
        "Les coûts de production augmentent significativement"
      ],
      correct: 1,
      category: "Biais et éthique",
      explanation: "Les deepfakes permettent de créer des vidéos ultra-réalistes de personnes disant ou faisant des choses qu'elles n'ont jamais faites. Risque majeur pour la désinformation, la manipulation politique, le chantage et l'atteinte à la réputation."
    },
    {
      id: 5,
      question: "Selon l'AI Act européen, comment sont classifiés les systèmes d'IA de manipulation de contenus audiovisuels ?",
      options: [
        "IA à risque minimal",
        "IA à risque limité nécessitant des obligations de transparence",
        "IA à haut risque nécessitant une évaluation stricte", 
        "IA interdite dans tous les cas"
      ],
      correct: 1,
      category: "Réglementation",
      explanation: "L'AI Act classe les deepfakes et systèmes de manipulation audiovisuelle comme 'risque limité'. Obligation principale : informer clairement que le contenu est généré par IA. Cela permet d'équilibrer innovation et protection contre les usages malveillants."
    }
  ];

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
  const hoverColors = ['hover:bg-red-600', 'hover:bg-blue-600', 'hover:bg-yellow-600', 'hover:bg-green-600'];

  const saveResult = async (name, finalScore) => {
    setSaving(true);
    try {
      const response = await fetch(`${SUPABASE_URL}/rest/v1/quiz_results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          player_name: name,
          score: finalScore,
          total_questions: questions.length,
          percentage: Math.round((finalScore / questions.length) * 100),
          quiz_type: 'IA Audiovisuel',
          completed_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        setSaveStatus('success');
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const startQuiz = () => {
    if (playerName.trim()) {
      setGameState('quiz');
    }
  };

  const handleAnswerSelect = (answerIndex) => {
    if (answered) return;
    
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: answerIndex
    });
    setAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setAnswered(false);
    } else {
      setGameState('results');
    }
  };

  useEffect(() => {
    if (gameState === 'results') {
      let correctAnswers = 0;
      questions.forEach((question, index) => {
        const userAnswer = selectedAnswers[index];
        if (userAnswer !== undefined && userAnswer === question.correct) {
          correctAnswers++;
        }
      });
      setScore(correctAnswers);
      saveResult(playerName, correctAnswers);
    }
  }, [gameState, selectedAnswers, playerName]);

  const resetQuiz = () => {
    setGameState('welcome');
    setPlayerName('');
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setScore(0);
    setAnswered(false);
    setSaving(false);
    setSaveStatus('');
  };

  const getScoreMessage = () => {
    const percentage = (score / questions.length) * 100;
    if (percentage === 100) return "🎉 Parfait ! Expert IA audiovisuel !";
    if (percentage >= 80) return "🌟 Excellent ! Très bonne maîtrise !";
    if (percentage >= 60) return "👍 Bien joué ! Bonnes connaissances !";
    if (percentage >= 40) return "🤔 Pas mal ! À approfondir !";
    return "📚 À revoir ! Continuez à apprendre !";
  };

  if (gameState === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz IA Audiovisuel</h1>
            <p className="text-gray-600">Testez vos connaissances sur l'Intelligence Artificielle dans le secteur audiovisuel</p>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <User className="w-5 h-5 text-purple-600" />
              <label className="text-left font-semibold text-gray-700">Votre nom :</label>
            </div>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Entrez votre nom"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none text-lg"
              onKeyPress={(e) => e.key === 'Enter' && startQuiz()}
            />
          </div>

          <button
            onClick={startQuiz}
            disabled={!playerName.trim()}
            className={`w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              playerName.trim() 
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:from-purple-600 hover:to-indigo-700 shadow-lg transform hover:scale-105' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Play className="w-5 h-5" />
            Commencer le Quiz
          </button>

          <div className="mt-6 text-sm text-gray-500">
            🎯 5 questions • ⏱️ 2-3 minutes • 📊 Résultats sauvegardés
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="mb-6">
            <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Félicitations {playerName} !</h1>
            <p className="text-xl text-gray-600">{getScoreMessage()}</p>
          </div>

          <div className={`mb-6 p-3 rounded-lg flex items-center justify-center gap-2 ${
            saving ? 'bg-blue-100 text-blue-800' :
            saveStatus === 'success' ? 'bg-green-100 text-green-800' :
            saveStatus === 'error' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <Database className="w-4 h-4" />
            {saving && 'Sauvegarde en cours...'}
            {saveStatus === 'success' && 'Résultat sauvegardé avec succès !'}
            {saveStatus === 'error' && 'Erreur lors de la sauvegarde'}
            {!saving && !saveStatus && 'Préparation de la sauvegarde...'}
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-6 mb-6">
            <div className="text-6xl font-bold mb-2">{score}/{questions.length}</div>
            <div className="text-xl">Score final</div>
            <div className="text-lg opacity-90">{Math.round((score/questions.length)*100)}% de réussite</div>
          </div>

          <div className="space-y-3 mb-6">
            {questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const correctAnswer = question.correct;
              const isCorrect = userAnswer !== undefined && userAnswer === correctAnswer;
              const wasAnswered = userAnswer !== undefined;
              
              return (
                <div key={index} className={`flex items-center justify-between rounded-lg p-3 ${isCorrect ? 'bg-green-100' : wasAnswered ? 'bg-red-100' : 'bg-gray-100'}`}>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                    <span className="text-xs text-gray-500">
                      Réponse: {userAnswer !== undefined ? String.fromCharCode(97 + userAnswer) : 'Non répondue'} 
                      {wasAnswered && ` | Correct: ${String.fromCharCode(97 + correctAnswer)}`}
                    </span>
                  </div>
                  {wasAnswered ? (
                    isCorrect ? (
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-500" />
                    )
                  ) : (
                    <div className="w-6 h-6 bg-gray-300 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={resetQuiz}
            className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:from-green-600 hover:to-blue-700 transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto"
          >
            <RotateCcw className="w-5 h-5" />
            Recommencer le quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-indigo-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-semibold">
              {currentQ.category}
            </div>
            <div className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-semibold">
              {currentQuestion + 1} / {questions.length}
            </div>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
            {currentQ.question}
          </h2>
        </div>

        <div className="grid gap-4 md:gap-6">
          {currentQ.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestion] === index;
            const isCorrect = index === currentQ.correct;
            const showResult = answered;
            
            let buttonClass = `${colors[index]} ${hoverColors[index]} text-white p-6 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg transform hover:scale-105 cursor-pointer`;
            
            if (showResult) {
              if (isSelected && isCorrect) {
                buttonClass = 'bg-green-500 text-white p-6 rounded-2xl font-bold text-lg shadow-lg transform scale-105 border-4 border-green-300';
              } else if (isSelected && !isCorrect) {
                buttonClass = 'bg-red-500 text-white p-6 rounded-2xl font-bold text-lg shadow-lg transform scale-95 border-4 border-red-300';
              } else if (isCorrect) {
                buttonClass = 'bg-green-500 text-white p-6 rounded-2xl font-bold text-lg shadow-lg border-4 border-green-300';
              } else {
                buttonClass = 'bg-gray-400 text-white p-6 rounded-2xl font-bold text-lg shadow-lg opacity-60';
              }
            }

            return (
              <div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {showResult && isSelected && (
                    isCorrect ? 
                      <CheckCircle className="w-6 h-6 ml-2" /> : 
                      <XCircle className="w-6 h-6 ml-2" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {answered && (
          <div className="mt-6 mb-4">
            <div className={`p-6 rounded-2xl border-l-4 ${
              selectedAnswers[currentQuestion] === currentQ.correct 
                ? 'bg-green-50 border-green-500' 
                : 'bg-blue-50 border-blue-500'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-full ${
                  selectedAnswers[currentQuestion] === currentQ.correct 
                    ? 'bg-green-100' 
                    : 'bg-blue-100'
                }`}>
                  {selectedAnswers[currentQuestion] === currentQ.correct ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg mb-2 ${
                    selectedAnswers[currentQuestion] === currentQ.correct 
                      ? 'text-green-800' 
                      : 'text-blue-800'
                  }`}>
                    {selectedAnswers[currentQuestion] === currentQ.correct ? 'Bonne réponse !' : 'Explication'}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {currentQ.explanation}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {answered && (
          <div className="text-center mt-8">
            <button
              onClick={nextQuestion}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 shadow-lg flex items-center gap-2 mx-auto"
            >
              {currentQuestion < questions.length - 1 ? 'Question suivante' : 'Voir les résultats'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  return <QuizIAAudiovisuel />;
}

export default App;
