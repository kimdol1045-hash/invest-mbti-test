/** 숫자를 "28.4만", "1.2천" 형태로 포맷 */
export function formatVolume(volume: number): string {
  if (volume >= 10000) {
    const v = volume / 10000;
    return v % 1 === 0 ? `${v}만` : `${v.toFixed(1)}만`;
  }
  if (volume >= 1000) {
    const v = volume / 1000;
    return v % 1 === 0 ? `${v}천` : `${v.toFixed(1)}천`;
  }
  return `${volume}`;
}

/** 시간을 "HH:MM 기준" 형태로 포맷 */
export function formatUpdateTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes} 기준`;
}
