import React, { useState, useEffect } from 'react';

interface Question {
  type: string;
  question: string;
  context?: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface QuizResults {
  score: number;
  percentage: number;
  level: string;
  message: string;
  levelClass: string;
}

const quizData: Question[] = [
  {
    type: "Reading Comprehension",
    question: "Based on the passage, what is the author's main argument about digital literacy?",
    context: "In today's interconnected world, digital literacy has become as fundamental as traditional literacy. However, many educational institutions still treat technology as an auxiliary tool rather than recognizing it as a core competency. This shortsighted approach not only disadvantages students in their future careers but also perpetuates digital inequality. We must reimagine education to place digital fluency at its center, ensuring that all students develop the critical thinking skills necessary to navigate an increasingly complex digital landscape.",
    options: [
      "Digital literacy should replace traditional literacy in schools",
      "Educational institutions must prioritize digital literacy as a core competency",
      "Technology is currently being overused in educational settings",
      "Digital inequality is primarily caused by lack of funding"
    ],
    correct: 1,
    explanation: "The author argues that digital literacy should be treated as a core competency, not an auxiliary tool, and placed at the center of education to ensure all students develop necessary skills."
  },
  {
    type: "Grammar & Usage",
    question: "Choose the correct form to complete the sentence: 'Had I known about the consequences, I _______ differently.'",
    options: [
      "would act",
      "would have acted",
      "will act",
      "had acted"
    ],
    correct: 1,
    explanation: "This is a third conditional sentence expressing a hypothetical past situation. The correct structure is 'Had I known..., I would have acted differently.'"
  },
  {
    type: "Vocabulary",
    question: "Which word best completes the sentence: 'The scientist's theory was initially met with _______, but later gained widespread acceptance.'",
    options: [
      "skepticism",
      "enthusiasm",
      "indifference",
      "admiration"
    ],
    correct: 0,
    explanation: "'Skepticism' (doubt or disbelief) creates the perfect contrast with 'later gained widespread acceptance,' showing the change in reception over time."
  },
  {
    type: "Phrasal Verbs",
    question: "What does 'bring about' mean in this context: 'The new policy will bring about significant changes in our workplace culture.'",
    options: [
      "prevent",
      "cause or create",
      "discuss",
      "postpone"
    ],
    correct: 1,
    explanation: "'Bring about' means to cause something to happen or to create a change. It's commonly used when discussing causes and effects."
  },
  {
    type: "Listening Comprehension",
    question: "Based on a typical Cambridge listening scenario, what would be the most appropriate response to: 'I'm afraid the conference has been postponed until next month.'",
    options: [
      "That's wonderful news!",
      "Oh no, I'll need to reschedule my travel arrangements.",
      "I wasn't planning to attend anyway.",
      "Can you repeat that, please?"
    ],
    correct: 1,
    explanation: "This response shows understanding of the situation and mentions the practical consequences of the postponement, which is a natural and appropriate reaction."
  },
  {
    type: "Writing Skills",
    question: "Which sentence demonstrates the most sophisticated use of English for an academic essay?",
    options: [
      "Climate change is bad and affects many people around the world.",
      "Climate change impacts lots of different areas of life.",
      "The multifaceted implications of climate change permeate virtually every aspect of contemporary society.",
      "Climate change is a problem that we need to solve quickly."
    ],
    correct: 2,
    explanation: "This sentence uses advanced vocabulary ('multifaceted,' 'implications,' 'permeate') and sophisticated structure appropriate for academic writing."
  },
  {
    type: "Idiomatic Expressions",
    question: "What does the idiom 'to break the ice' mean?",
    options: [
      "to start a conversation in a social situation",
      "to solve a difficult problem",
      "to end a relationship",
      "to make someone angry"
    ],
    correct: 0,
    explanation: "'To break the ice' means to initiate conversation or interaction, especially in potentially awkward social situations, making people feel more comfortable."
  },
  {
    type: "Critical Thinking",
    question: "Which statement best demonstrates critical analysis rather than mere opinion?",
    options: [
      "I think social media is harmful to teenagers.",
      "Social media platforms should be banned for people under 18.",
      "While social media offers connectivity benefits, studies suggest excessive use correlates with increased anxiety among adolescents.",
      "Everyone knows that social media is addictive."
    ],
    correct: 2,
    explanation: "This statement presents a balanced view supported by evidence ('studies suggest') and uses precise language ('correlates with'), demonstrating critical thinking skills."
  },
  {
    type: "Formal vs. Informal",
    question: "Which version is most appropriate for a formal business letter?",
    options: [
      "Thanks for getting back to me so quickly!",
      "I appreciate your prompt response to my inquiry.",
      "It's great that you replied so fast.",
      "Thanks for the quick reply!"
    ],
    correct: 1,
    explanation: "This option uses formal vocabulary ('appreciate,' 'prompt response,' 'inquiry') and maintains professional tone appropriate for business correspondence."
  },
  {
    type: "Error Correction",
    question: "Identify the error in this sentence: 'Despite of the heavy rain, the outdoor concert proceeded as scheduled.'",
    options: [
      "There is no error",
      "'Despite of' should be 'Despite'",
      "'proceeded' should be 'proceeded'",
      "'as scheduled' should be 'like scheduled'"
    ],
    correct: 1,
    explanation: "'Despite' is never followed by 'of.' The correct usage is simply 'Despite the heavy rain...' or alternatively 'In spite of the heavy rain...'"
  }
];

const CambridgeEnglishQuiz: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(1200); // 20 minutes in seconds
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [results, setResults] = useState<QuizResults | null>(null);

  // Timer effect
  useEffect(() => {
    if (timeLeft > 0 && !quizCompleted) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      finishQuiz();
    }
  }, [timeLeft, quizCompleted]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const selectAnswer = (index: number): void => {
    setSelectedAnswer(index);
  };

  const submitAnswer = (): void => {
    if (selectedAnswer === null) return;
    
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newAnswers);
    setShowFeedback(true);
  };

  const nextQuestion = (): void => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = (): void => {
    let correctAnswers = 0;
    for (let i = 0; i < quizData.length; i++) {
      if (userAnswers[i] === quizData[i].correct) {
        correctAnswers++;
      }
    }

    const percentage = Math.round((correctAnswers / quizData.length) * 100);
    
    let level: string, message: string, levelClass: string;
    
    if (percentage >= 90) {
      level = 'Cambridge C2 Level';
      message = 'Outstanding! You demonstrate mastery-level English proficiency.';
      levelClass = 'mastery';
    } else if (percentage >= 80) {
      level = 'Cambridge C1 Level';
      message = 'Excellent work! You have advanced English proficiency.';
      levelClass = 'advanced';
    } else if (percentage >= 70) {
      level = 'Cambridge B2 Level';
      message = 'Good job! You have upper-intermediate English skills.';
      levelClass = 'upper-intermediate';
    } else if (percentage >= 60) {
      level = 'Cambridge B1 Level';
      message = 'Well done! You have intermediate English proficiency.';
      levelClass = 'intermediate';
    } else {
      level = 'Below B1 Level';
      message = 'Keep practicing! Focus on grammar and vocabulary building.';
      levelClass = 'developing';
    }

    setResults({
      score: correctAnswers,
      percentage,
      level,
      message,
      levelClass
    });
    setQuizCompleted(true);
  };

  const restartQuiz = (): void => {
    setCurrentQuestion(0);
    setUserAnswers([]);
    setTimeLeft(1200);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setQuizCompleted(false);
    setResults(null);
  };

  const getOptionClass = (index: number): string => {
    if (!showFeedback) {
      return selectedAnswer === index ? 'selected' : '';
    }
    
    if (index === quizData[currentQuestion].correct) {
      return 'correct';
    } else if (index === selectedAnswer && index !== quizData[currentQuestion].correct) {
      return 'incorrect';
    }
    return '';
  };

  const getLevelColor = (levelClass: string): string => {
    const colors = {
      'mastery': 'bg-green-500 text-white',
      'advanced': 'bg-blue-500 text-white',
      'upper-intermediate': 'bg-orange-500 text-white',
      'intermediate': 'bg-yellow-500 text-black',
      'developing': 'bg-red-500 text-white'
    };
    return colors[levelClass as keyof typeof colors] || 'bg-gray-500 text-white';
  };

  if (quizCompleted && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-700 flex items-center justify-center p-5 ">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-2xl w-full border border-white/20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">🎓 Quiz Complete!</h1>
            
            <div className="w-36 h-36 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="text-white text-3xl font-bold">{results.percentage}%</span>
            </div>
            
            <div className="text-xl text-gray-700 mb-4">{results.message}</div>
            
            <div className={`inline-block px-6 py-3 rounded-full font-bold text-lg mb-6 ${getLevelColor(results.levelClass)}`}>
              {results.level}
            </div>
            
            <div className="text-gray-600 mb-6">
              You scored {results.score} out of {quizData.length} questions correctly.
            </div>
            
            <button
              onClick={restartQuiz}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-700 flex items-center justify-center p-5">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 max-w-4xl w-full border border-white/20">
        {/* Header */}
        <div className="text-center mb-8 border-b-4 border-blue-500 pb-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🎓 Cambridge English Quiz</h1>
          <p className="text-lg text-gray-600 font-medium">Advanced Level | 10 Questions | 20 Minutes</p>
        </div>

        {/* Timer */}
        <div className={`text-center text-lg mb-6 ${timeLeft <= 300 ? 'text-red-500 font-bold' : 'text-gray-600'}`}>
          Time remaining: {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${((currentQuestion + 1) / quizData.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-blue-500">
          <div className="flex justify-between items-center mb-6">
            <span className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold">
              Question {currentQuestion + 1}/10
            </span>
            <span className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
              {quizData[currentQuestion].type}
            </span>
          </div>

          {quizData[currentQuestion].context && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6 italic text-gray-700 leading-relaxed">
              {quizData[currentQuestion].context}
            </div>
          )}

          <div className="text-xl text-gray-800 mb-6 leading-relaxed">
            {quizData[currentQuestion].question}
          </div>

          <div className="space-y-4">
            {quizData[currentQuestion].options.map((option, index) => (
              <div
                key={index}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-300
                  ${getOptionClass(index) === 'selected' ? 'bg-blue-500 border-blue-500 text-white transform scale-105' : ''}
                  ${getOptionClass(index) === 'correct' ? 'bg-green-500 border-green-500 text-white' : ''}
                  ${getOptionClass(index) === 'incorrect' ? 'bg-red-500 border-red-500 text-white' : ''}
                  ${!showFeedback && getOptionClass(index) === '' ? 'bg-gray-50 border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:transform hover:scale-105' : ''}
                `}
                onClick={() => !showFeedback && selectAnswer(index)}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                  ${getOptionClass(index) === 'selected' ? 'bg-white text-blue-500' : ''}
                  ${getOptionClass(index) === 'correct' ? 'bg-white text-green-500' : ''}
                  ${getOptionClass(index) === 'incorrect' ? 'bg-white text-red-500' : ''}
                  ${!showFeedback && getOptionClass(index) === '' ? 'bg-blue-500 text-white' : ''}
                `}>
                  {String.fromCharCode(65 + index)}
                </div>
                <div className="flex-1">{option}</div>
              </div>
            ))}
          </div>

          {showFeedback && (
            <div className="mt-6 p-5 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">Explanation:</h4>
              <p className="text-gray-700 leading-relaxed">{quizData[currentQuestion].explanation}</p>
            </div>
          )}

          <div className="flex gap-4 mt-8">
            {!showFeedback ? (
              <button
                onClick={submitAnswer}
                disabled={selectedAnswer === null}
                className={`
                  px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 transform
                  ${selectedAnswer !== null 
                    ? 'bg-blue-500 hover:bg-blue-600 hover:scale-105 hover:shadow-lg' 
                    : 'bg-gray-300 cursor-not-allowed opacity-60'
                  }
                `}
              >
                SUBMIT ANSWER
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
              >
                {currentQuestion < quizData.length - 1 ? 'NEXT QUESTION' : 'FINISH QUIZ'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CambridgeEnglishQuiz;