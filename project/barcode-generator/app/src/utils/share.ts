/**
 * 코드 값 공유
 * 1순위: 앱인토스 네이티브 공유
 * 2순위: Web Share API
 * 3순위: 클립보드 복사
 */
export async function shareCode(
  label: string,
  value: string,
): Promise<{ success: boolean; method: string }> {
  const shareText = `[바로코드] ${label}\n${value}`;

  // 1순위: 앱인토스 네이티브 공유
  try {
    const { share } = await import('@apps-in-toss/web-framework');
    await share({ message: shareText });
    return { success: true, method: 'toss' };
  } catch {
    // 폴백
  }

  // 2순위: Web Share API
  if (navigator.share) {
    try {
      await navigator.share({
        title: `바로코드 - ${label}`,
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
      await navigator.clipboard.writeText(value);
      return { success: true, method: 'clipboard' };
    }
    const textarea = document.createElement('textarea');
    textarea.value = value;
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
