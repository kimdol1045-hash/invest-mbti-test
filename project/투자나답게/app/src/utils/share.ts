import { type PersonalityType } from '../data/personalityTypes';

/**
 * 텍스트 줄바꿈 처리 (글자 단위)
 * @returns 줄바꿈된 텍스트 배열
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = Infinity,
): string[] {
  const lines: string[] = [];
  let currentLine = '';

  for (const char of text) {
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);

    if (metrics.width > maxWidth && currentLine.length > 0) {
      if (lines.length + 1 >= maxLines) {
        lines.push(currentLine.trimEnd() + '...');
        return lines;
      }
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

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
    canvas.height = 440;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 배경
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(0, 0, 600, 440, 20);
    ctx.fill();

    // 상단 그라데이션 배경
    const gradient = ctx.createLinearGradient(0, 0, 600, 0);
    gradient.addColorStop(0, '#3182F6');
    gradient.addColorStop(1, '#1B6CE5');
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, 600, 170, [20, 20, 0, 0]);
    ctx.fill();

    // 서비스명
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.font = '500 14px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('투자MBTI테스트', 300, 36);

    // MBTI 타입 코드 (이모지 대신 텍스트로 표시)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.font = '800 44px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(mbtiType, 300, 95);

    // 유형명
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 22px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText(personality.name, 300, 145);

    // 설명 (줄바꿈 처리, 최대 2줄)
    ctx.fillStyle = '#4E5968';
    ctx.font = '400 14px -apple-system, BlinkMacSystemFont, sans-serif';
    const descLines = wrapText(ctx, personality.description, 520, 2);
    descLines.forEach((line, i) => {
      ctx.fillText(line, 300, 200 + i * 22);
    });

    // 특징 영역 배경
    const traitsY = 230;
    ctx.fillStyle = '#F9FAFB';
    ctx.roundRect(24, traitsY, 552, 120, 12);
    ctx.fill();

    // 특징 (최대 3개, 줄바꿈 처리)
    ctx.textAlign = 'left';
    ctx.fillStyle = '#4E5968';
    ctx.font = '400 13px -apple-system, BlinkMacSystemFont, sans-serif';
    const traits = personality.traits.slice(0, 3);
    let traitY = traitsY + 28;
    traits.forEach((trait) => {
      const traitLines = wrapText(ctx, `• ${trait}`, 520, 2);
      traitLines.forEach((line) => {
        ctx.fillText(line, 40, traitY);
        traitY += 20;
      });
      traitY += 6;
    });

    // 구분선
    ctx.strokeStyle = '#E5E8EB';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, 395);
    ctx.lineTo(560, 395);
    ctx.stroke();

    // 하단 CTA
    ctx.fillStyle = '#8B95A1';
    ctx.font = '400 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('나도 테스트하러 가기 → 토스에서 "투자나답게" 검색', 300, 420);

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
  const APP_LINK = 'intoss://miniapp?appId=invest-like-me';
  const shareText = `나의 투자 성향은 "${personality.name}" (${mbtiType} 스타일)이래요!\n${personality.description}\n\n나도 테스트하러 가기 → ${APP_LINK}`;

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
        title: `투자MBTI테스트 - ${personality.name}`,
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
