export function formatTime(virtualTime: number): string {
  const hours = String(Math.floor(virtualTime / 60)).padStart(2, '0');
  const minutes = String(virtualTime % 60).padStart(2, '0');

  return `${hours}:${minutes}`;
}
