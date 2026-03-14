import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@toss/tds-mobile';

interface Props { children: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 40, gap: 16 }}>
          <div style={{ width: 80, height: 80, borderRadius: 40, background: '#F2F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>!</div>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#191F28' }}>문제가 생겼어요</p>
          <p style={{ fontSize: 14, color: '#8B95A1' }}>잠시 후 다시 시도해 주세요</p>
          <Button color="primary" variant="fill" size="large" onClick={() => this.setState({ hasError: false })}>
            다시 시도하기
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
