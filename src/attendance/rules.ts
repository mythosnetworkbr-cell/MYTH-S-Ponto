import type { AttendanceState, Punch, PunchType } from './types';

export const nextActionFor = (punches: Punch[]): PunchType | null => {
  const last = punches[punches.length - 1]?.type;
  if (!last) return 'Entrada';
  if (last === 'Entrada' || last === 'Retorno do intervalo') return 'Início do intervalo';
  if (last === 'Início do intervalo') return 'Retorno do intervalo';
  return null;
};

export const stateFor = (punches: Punch[]): AttendanceState => {
  const last = punches[punches.length - 1]?.type;
  if (!last) return 'NOT_STARTED';
  if (last === 'Entrada' || last === 'Retorno do intervalo') return 'WORKING';
  if (last === 'Início do intervalo') return 'BREAK';
  return 'FINISHED';
};

export const workedMinutes = (punches: Punch[], now = Date.now()) => {
  let total = 0;
  let start: number | null = null;
  for (const punch of punches) {
    if (punch.type === 'Entrada' || punch.type === 'Retorno do intervalo') start = punch.at;
    if ((punch.type === 'Início do intervalo' || punch.type === 'Saída') && start !== null) {
      total += Math.max(0, Math.round((punch.at - start) / 60000));
      start = null;
    }
  }
  if (start !== null) total += Math.max(0, Math.round((now - start) / 60000));
  return total;
};
