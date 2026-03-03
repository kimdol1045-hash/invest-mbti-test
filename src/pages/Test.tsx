import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { questions } from '../data/questions';
import { calculateResult } from '../utils/calculateResult';
import { storage } from '../utils/storage';
import '../styles/Test.css';

export default function Test() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const resultType = calculateResult(newAnswers);
      storage.setTestResult(resultType);
      navigate('/result', { state: { type: resultType } });
    }
  };

  return (
    <div className="test">
      <div className="test-counter-bar">
        <span className="test-counter">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="test-progress">
        <div className="test-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <main className="test-main">
        <p className="test-question">{question.text}</p>
        <div className="test-options">
          {question.options.map((option) => (
            <button
              key={option.value}
              className="test-option"
              onClick={() => handleAnswer(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
}
