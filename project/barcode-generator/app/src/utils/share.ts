import { toPng } from 'html-to-image';

/**
 * 코드 이미지를 공유
 * 1순위: Web Share API (이미지 파일)
 * 2순위: 클립보드에 이미지 복사
 * 3순위: 클립보드에 텍스트 복사
 */
export async function shareCode(
  label: string,
  value: string,
  codeElement?: HTMLElement | null,
): Promise<{ success: boolean; method: string }> {
  // 이미지 생성 시도
  let imageFile: File | null = null;
  if (codeElement) {
    try {
      const dataUrl = await toPng(codeElement, {
        backgroundColor: '#FFFFFF',
        pixelRatio: 2,
      });
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      imageFile = new File([blob], `barocode-${Date.now()}.png`, { type: 'image/png' });
    } catch {
      // 이미지 생성 실패 시 텍스트 폴백
    }
  }

  // 1순위: Web Share API (이미지 포함)
  if (navigator.share && imageFile && navigator.canShare?.({ files: [imageFile] })) {
    try {
      await navigator.share({
        title: `바로코드 - ${label}`,
        files: [imageFile],
      });
      return { success: true, method: 'webshare' };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, method: 'cancelled' };
      }
    }
  }

  // 2순위: 클립보드에 이미지 복사
  if (imageFile && navigator.clipboard?.write) {
    try {
      const blob = imageFile.slice(0, imageFile.size, 'image/png');
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ]);
      return { success: true, method: 'clipboard-image' };
    } catch {
      // 폴백
    }
  }

  // 3순위: 클립보드에 텍스트 복사
  try {
    const text = `[바로코드] ${label}\n${value}`;
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return { success: true, method: 'clipboard' };
    }
  } catch {
    // 무시
  }

  return { success: false, method: 'none' };
}
