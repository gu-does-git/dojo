import { Icon } from '@iconify/react';

interface ScoreCardProps {
  score: number;
  total: number;
  percentage: number;
}

export function ScoreCard({ score, total, percentage }: ScoreCardProps) {
  const isPerfect = score === total;
  const isGreat = score >= total * 0.8 && score < total;

  return (
    <div className="text-center space-y-2 p-8 bg-linear-to-br from-indigo-50 to-slate-50 dark:from-indigo-900/20 dark:to-slate-900/20 rounded-2xl">
      <div className="flex justify-center mb-2">
        {isPerfect
          ? <Icon icon="mdi:trophy" className="w-12 h-12 text-yellow-500" />
          : isGreat
          ? <Icon icon="mdi:emoticon-happy-outline" className="w-12 h-12 text-indigo-500 dark:text-indigo-400" />
          : <Icon icon="mdi:book-open-variant" className="w-12 h-12 text-slate-500 dark:text-slate-400" />
        }
      </div>
      <div className="text-8xl font-bold text-indigo-600 dark:text-indigo-400">
        {score}/{total}
      </div>
      <p className="text-3xl font-semibold text-slate-900 dark:text-white">
        {percentage}%
      </p>
      <p className="text-lg text-slate-600 dark:text-slate-300">
        {isPerfect ? 'Perfect score!' : isGreat ? 'Great job!' : 'Keep practicing!'}
      </p>
    </div>
  );
}
