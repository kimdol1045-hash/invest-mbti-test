import { type PersonalityType } from '../data/personalityTypes';

/**
 * 공유 카드 이미지 생성 (Canvas API)
 */
async function generateShareImage(
  mbtiType: string,
  personality: PersonalityType,
): Promise<Blob | null> {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 배경
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(0, 0, 600, 400, 20);
    ctx.fill();

    // 상단 파란 배경
    ctx.fillStyle = '#3182F6';
    ctx.roundRect(0, 0, 600, 160, [20, 20, 0, 0]);
    ctx.fill();

    // 서비스명
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '500 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('MBTI 투자 성향 테스트', 300, 36);

    // 이모지
    ctx.font = '40px serif';
    ctx.fillText(personality.emoji, 300, 90);

    // 유형명
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 24px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(personality.name, 300, 140);

    // MBTI 스타일
    ctx.fillStyle = '#333D4B';
    ctx.font = '600 16px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(`${mbtiType} 스타일`, 300, 195);

    // 설명
    ctx.fillStyle = '#6B7684';
    ctx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(personality.description, 300, 225);

    // 특징 (최대 3개)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4E5968';
    ctx.font = '400 13px -apple-system, BlinkMacSystemFont, sans-serif';
    const traits = personality.traits.slice(0, 3);
    traits.forEach((trait, i) => {
      const text = trait.length > 35 ? trait.substring(0, 35) + '...' : trait;
      ctx.fillText(`• ${text}`, 40, 265 + i * 24);
    });

    // 하단 CTA
    ctx.fillStyle = '#8B95A1';
    ctx.font = '400 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('나도 테스트하러 가기 → 토스에서 "MBTI 투자 성향 테스트"', 300, 380);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), 'image/png');
    });
  } catch (error) {
    console.error('[Share] 이미지 생성 실패:', error);
    return null;
  }
}

/**
 * 결과 공유
 * 1순위: 토스 네이티브 공유 API (OAuth 연동 후)
 * 2순위: Web Share API
 * 3순위: 클립보드 복사
 */
export async function shareResult(
  mbtiType: string,
  personality: PersonalityType,
): Promise<{ success: boolean; method: string }> {
  // TODO: 콘솔 등록 후 실제 intoss:// 스킴으로 교체
  const APP_LINK = 'intoss://miniapp?appId=mbti-invest-test';
  const shareText = `나의 투자 성향은 "${personality.name}" (${mbtiType} 스타일)이래요! ${personality.emoji}\n${personality.description}\n\n나도 테스트하러 가기 → ${APP_LINK}`;

  // 1순위: 토스 네이티브 공유 API
  // TODO: OAuth 연동 후 활성화
  // if (window.TossApp?.share) {
  //   await window.TossApp.share({ text: shareText });
  //   return { success: true, method: 'toss' };
  // }

  // 2순위: Web Share API (모바일 브라우저 지원)
  if (navigator.share) {
    try {
      const imageBlob = await generateShareImage(mbtiType, personality);
      const shareData: ShareData = {
        title: `MBTI 투자 성향 테스트 - ${personality.name}`,
        text: shareText,
      };

      // 이미지 파일 첨부 가능한 경우
      if (imageBlob && navigator.canShare) {
        const file = new File([imageBlob], 'my-invest-type.png', { type: 'image/png' });
        const dataWithFile = { ...shareData, files: [file] };
        if (navigator.canShare(dataWithFile)) {
          await navigator.share(dataWithFile);
          return { success: true, method: 'webshare-image' };
        }
      }

      await navigator.share(shareData);
      return { success: true, method: 'webshare' };
    } catch (error) {
      // 사용자가 공유 취소한 경우
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
    }
  }

  // 3순위: 클립보드 복사
  try {
    await navigator.clipboard.writeText(shareText);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'none' };
  }
}
