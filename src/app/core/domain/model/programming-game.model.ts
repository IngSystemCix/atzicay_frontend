export interface ProgrammingGame {
  Name: string;
  Activated: boolean;
  StartTime: string; // 'YYYY-MM-DD HH:mm:ss'
  EndTime: string;   // 'YYYY-MM-DD HH:mm:ss'
  Attempts: number;
  MaximumTime: number;
}
