import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizzes } from '../data/quizzes';
import { storage } from '../utils/storage';
import Disclaimer from '../components/Disclaimer';
import '../styles/Quiz.css';

export default function Quiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const quiz = quizzes.find((q) => q.indicatorId === id);

  if (!quiz) {
    return (
      <div className="quiz">
        <p>다른 도감 항목의 퀴즈를 풀어보세요.</p>
        <button onClick={() => navigate(-1)}>돌아가기</button>
      </div>
    );
  }

  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedIndex(index);
    setIsAnswered(true);

    const isCorrect = index === quiz.correctIndex;
    storage.saveQuizResult(quiz.indicatorId, isCorrect);
  };

  const isCorrect = selectedIndex === quiz.correctIndex;

  return (
    <div className="quiz">

      <main className="quiz-main">
        <p className="quiz-question">{quiz.question}</p>

        <div className="quiz-options">
          {quiz.options.map((option, index) => {
            let className = 'quiz-option';
            if (isAnswered) {
              if (index === quiz.correctIndex) className += ' correct';
              else if (index === selectedIndex) className += ' wrong';
            }

            return (
              <button
                key={index}
                className={className}
                onClick={() => handleSelect(index)}
                disabled={isAnswered}
              >
                {option}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className={`quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
            <p className="quiz-feedback-title">
              {isCorrect ? '정답이에요!' : '아쉬워요!'}
            </p>
            <p className="quiz-feedback-explanation">{quiz.explanation}</p>
            {!isCorrect && (
              <button
                className="quiz-review-button"
                onClick={() => navigate(`/indicator/${id}`)}
              >
                다시 학습하기
              </button>
            )}
          </div>
        )}

        {isAnswered && (
          <button
            className="quiz-next-button"
            onClick={() => navigate('/encyclopedia')}
          >
            도감으로 돌아가기
          </button>
        )}

        <Disclaimer />
      </main>
    </div>
  );
}
