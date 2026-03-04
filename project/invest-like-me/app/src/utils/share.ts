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
    canvas.height = 460;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // 배경
    ctx.fillStyle = '#FFFFFF';
    ctx.roundRect(0, 0, 600, 440, 20);
    ctx.fill();

    // 상단 그라데이션 배경
    const gradient = ctx.createLinearGradient(0, 0, 600, 0);
    gradient.addColorStop(0, '#3182F6');
    gradient.addColorStop(1, '#1b64da');
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

    // 면책 문구
    ctx.fillStyle = '#b0b8c1';
    ctx.font = '400 10px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('교육 목적의 정보이며, 투자 판단의 근거로 사용할 수 없어요.', 300, 410);

    // 하단 CTA
    ctx.fillStyle = '#8B95A1';
    ctx.font = '400 12px -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('나도 테스트하러 가기 → 토스에서 "투자MBTI테스트" 검색', 300, 430);

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
 * 1순위: 앱인토스 네이티브 공유 API (share + getTossShareLink)
 * 2순위: Web Share API
 * 3순위: 클립보드 복사
 */
export async function shareResult(
  mbtiType: string,
  personality: PersonalityType,
): Promise<{ success: boolean; method: string }> {
  const shareText = `나의 투자 성향은 "${personality.name}" (${mbtiType} 스타일)이래요!\n${personality.description}`;

  // 1순위: 앱인토스 네이티브 공유 API
  try {
    const { share, getTossShareLink } = await import('@apps-in-toss/web-framework');
    const tossLink = await getTossShareLink('intoss://invest-like-me');
    await share({ message: `${shareText}\n\n나도 테스트하러 가기 → ${tossLink}` });
    return { success: true, method: 'toss' };
  } catch {
    // 토스 환경이 아니거나 API 실패 시 폴백
  }

  // 2순위: Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: `투자MBTI테스트 - ${personality.name}`,
        text: shareText,
      });
      return { success: true, method: 'webshare' };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
    }
  }

  // 3순위: 클립보드 복사
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
      return { success: true, method: 'clipboard' };
    }
    const textarea = document.createElement('textarea');
    textarea.value = shareText;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'none' };
  }
}
