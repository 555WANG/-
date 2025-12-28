
export interface Chapter {
  id: string;
  title: string;
  targetWords: number;
  currentWords: number;
  targetFigures: number;
  currentFigures: number;
  formattingProgress: number; // 0-100
  startDate: string;
  endDate: string;
}

export interface DailyLog {
  id: string;
  date: string;
  deltaWords: number;
  note: string;
}

export interface ThesisSettings {
  totalGoal: number;
  themeColor: string;
  deadline: string; // Added deadline field
}
