import { Icon } from '@iconify/react';

interface Question {
  prompt: string;
  romaji: string;
  answer: string;
  answerRomaji: string;
  difficulty?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  hint?: string;
}

interface ResultEntry {
  question: Question;
  userAnswer: string;
  correct: boolean;
}

interface QuestionHistoryProps {
  results: ResultEntry[];
}

export function QuestionHistory({ results }: QuestionHistoryProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Review</h3>
      <div className="space-y-2 max-h-96 overflow-y-auto p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/30 dark:bg-slate-900/20">
        {results.map((r, i) => (
          <div key={i} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {r.question.difficulty && (
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap border-2 ${
                    r.question.difficulty === 'N5' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' :
                    r.question.difficulty === 'N4' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700' :
                    r.question.difficulty === 'N3' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700' :
                    r.question.difficulty === 'N2' ? 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700' :
                    'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                  }`}>
                    {r.question.difficulty}
                  </span>
                )}
                <span className="text-slate-900 dark:text-white wrap-break-word">{r.question.prompt}</span>
              </div>
              <Icon
                icon={r.correct ? 'mdi:check-circle' : 'mdi:close-circle'}
                className={`w-6 h-6 shrink-0 ${r.correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
              />
            </div>
            {!r.correct && r.question.hint && (
              <p className="text-xs text-slate-500 dark:text-slate-400 italic pl-4 border-l-2 border-slate-300 dark:border-slate-600">
                Hint: {r.question.hint}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
