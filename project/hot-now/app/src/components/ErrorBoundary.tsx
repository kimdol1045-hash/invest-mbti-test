import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, textAlign: 'center', marginTop: 60 }}>
          <p style={{ fontSize: 16, color: '#333D4B', fontWeight: 600 }}>
            문제가 발생했어요
          </p>
          <p style={{ fontSize: 14, color: '#8B95A1', marginTop: 8 }}>
            앱을 다시 열어주세요
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
