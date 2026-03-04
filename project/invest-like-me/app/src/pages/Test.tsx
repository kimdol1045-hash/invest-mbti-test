import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressBar, ConfirmDialog } from '@toss/tds-mobile';
import { questions } from '../data/questions';
import { calculateResult } from '../utils/calculateResult';
import { storage } from '../utils/storage';
import '../styles/Test.css';

export default function Test() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const question = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;

  // 뒤로가기 인터셉트
  useEffect(() => {
    let backEventUnsubscribe: (() => void) | null = null;

    // 1) 공식 API: graniteEvent.addEventListener('backEvent')
    //    등록 시 네이티브 기본 history.back() 호출을 완전히 막음
    import('@apps-in-toss/web-framework')
      .then(({ graniteEvent }) => {
        backEventUnsubscribe = graniteEvent.addEventListener('backEvent', {
          onEvent: () => {
            setShowConfirm(true);
          },
          onError: () => {},
        });
      })
      .catch(() => {
        // 토스 환경이 아닌 경우 (브라우저 개발 등) popstate fallback
        window.history.pushState({ testGuard: true }, '');
      });

    // 2) Fallback: popstate (브라우저 환경 + history.back() 호출 시)
    //    history.go(1)로 즉시 되돌려서 React Router 네비게이션 방지
    const handlePopState = () => {
      window.history.go(1);
      setShowConfirm(true);
    };
    window.addEventListener('popstate', handlePopState);

    return () => {
      backEventUnsubscribe?.();
      window.removeEventListener('popstate', handlePopState);
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
        open={showConfirm}
        title="테스트를 그만할까요?"
        description="진행 내용이 저장되지 않아요."
        onClose={() => setShowConfirm(false)}
        cancelButton={
          <ConfirmDialog.CancelButton color="primary" variant="weak" onClick={() => setShowConfirm(false)}>
            계속하기
          </ConfirmDialog.CancelButton>
        }
        confirmButton={
          <ConfirmDialog.ConfirmButton
            onClick={() => {
              setShowConfirm(false);
              navigate('/', { replace: true });
            }}
          >
            나가기
          </ConfirmDialog.ConfirmButton>
        }
      />
    </div>
  );
}
