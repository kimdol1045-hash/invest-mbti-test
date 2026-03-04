import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar, ConfirmDialog } from '@toss/tds-mobile';
import { graniteEvent } from '@apps-in-toss/web-framework';
import { questions } from '../data/questions';
import { calculateResult } from '../utils/calculateResult';
import { storage } from '../utils/storage';
import '../styles/Test.css';

export default function Test() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showBackDialog, setShowBackDialog] = useState(false);

  const question = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;

  useEffect(() => {
    const unsubscription = graniteEvent.addEventListener('backEvent', {
      onEvent: () => {
        setShowBackDialog(true);
      },
      onError: (error) => {
        console.error(`뒤로가기 이벤트 오류: ${error}`);
      },
    });

    return () => {
      unsubscription();
    };
  }, []);

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const resultType = calculateResult(newAnswers);
      storage.setTestResult(resultType);
      navigate('/result', { state: { type: resultType }, replace: true });
    }
  };

  return (
    <div className="test">
      <div className="test-header">
        <span className="test-counter">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <ProgressBar progress={progress} size="light" animate />

      <main className="test-main">
        <p className="test-question">{question.text}</p>
        <div className="test-options" key={currentIndex}>
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

      <ConfirmDialog
        open={showBackDialog}
        title="테스트를 그만할까요?"
        description="진행 내용이 저장되지 않아요."
        cancelButton={
          <ConfirmDialog.CancelButton onClick={() => setShowBackDialog(false)}>
            계속하기
          </ConfirmDialog.CancelButton>
        }
        confirmButton={
          <ConfirmDialog.ConfirmButton onClick={() => navigate('/', { replace: true })}>
            나가기
          </ConfirmDialog.ConfirmButton>
        }
        onClose={() => setShowBackDialog(false)}
      />
    </div>
  );
}
