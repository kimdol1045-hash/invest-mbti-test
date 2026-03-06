import { toPng } from 'html-to-image';

export async function saveCodeImage(
  element: HTMLElement,
  filename: string,
): Promise<boolean> {
  try {
    const dataUrl = await toPng(element, {
      backgroundColor: '#FFFFFF',
      pixelRatio: 2,
    });

    const link = document.createElement('a');
    link.download = `${filename}.png`;
    link.href = dataUrl;
    link.click();
    return true;
  } catch (error) {
    console.error('[imageSave] 이미지 저장 실패:', error);
    return false;
  }
}
