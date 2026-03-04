import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Paragraph } from '@toss/tds-mobile';
import { quizzes } from '../data/quizzes';
import { storage } from '../utils/storage';
import PageHeader from '../components/PageHeader';
import '../styles/Quiz.css';

export default function Quiz() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  useEffect(() => {
    setSelectedIndex(null);
    setIsAnswered(false);
  }, [id]);

  const quiz = quizzes.find((q) => q.indicatorId === id);

  if (!quiz) {
    return (
      <div className="quiz">
        <PageHeader />
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
          <Paragraph typography="st6" color="#6B7684">
            이 항목에는 아직 퀴즈가 없어요.
          </Paragraph>
          <div style={{ marginTop: 24 }}>
            <Button
              color="primary"
              size="xlarge"
              display="block"
              onClick={() => navigate(-1)}
            >
              돌아가기
            </Button>
          </div>
        </div>
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
      <PageHeader title="퀴즈" />

      <main className="quiz-main">
        <Paragraph typography="t5" fontWeight="semibold" color="#191F28">
          {quiz.question}
        </Paragraph>

        <div className="quiz-options" style={{ marginTop: 24 }}>
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
            <Paragraph
              typography="t5"
              fontWeight="bold"
              color={isCorrect ? '#1B873F' : '#C62828'}
            >
              {isCorrect ? '정답이에요!' : '아쉬워요!'}
            </Paragraph>
            <div style={{ marginTop: 8 }}>
              <Paragraph typography="st8" color="#191F28">
                {quiz.explanation}
              </Paragraph>
            </div>
            {!isCorrect && (
              <div style={{ marginTop: 12 }}>
                <Button
                  color="danger"
                  variant="weak"
                  size="small"
                  onClick={() => {
                    setSelectedIndex(null);
                    setIsAnswered(false);
                  }}
                >
                  다시 풀기
                </Button>
              </div>
            )}
          </div>
        )}

        {isAnswered && (
          <div style={{ marginTop: 24 }}>
            <Button
              color="dark"
              variant="weak"
              size="xlarge"
              display="block"
              onClick={() => navigate('/encyclopedia', { replace: true })}
            >
              도감으로 돌아가기
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
