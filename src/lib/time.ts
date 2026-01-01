export function formatTime(virtualTime: number): string {
  const hours = String(Math.floor(virtualTime / 60)).padStart(2, '0');
  const minutes = String(virtualTime % 60).padStart(2, '0');

  return `${hours}:${minutes}`;
}

export function isTimeBetween(time: number, start: string, end: string): boolean {
  const [startHours, startMinutes] = start.split(':').map(Number);
  const startTotal = startHours * 60 + startMinutes;

  const [endHours, endMinutes] = end.split(':').map(Number);
  const endTotal = endHours * 60 + endMinutes;

  return time >= startTotal && time <= endTotal;
}

export function isTime(time: number, target: string): boolean {
  const [targetHours, targetMinutes] = target.split(':').map(Number);
  const targetTotal = targetHours * 60 + targetMinutes;

  return time === targetTotal;
}
