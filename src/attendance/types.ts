export type PunchType = 'Entrada' | 'Início do intervalo' | 'Retorno do intervalo' | 'Saída';

export type Punch = {
  id: string;
  type: PunchType;
  at: number;
};

export type AttendanceState = 'NOT_STARTED' | 'WORKING' | 'BREAK' | 'FINISHED';

export type AttendanceDay = {
  punches: Punch[];
  workedMinutes: number;
  state: AttendanceState;
};
