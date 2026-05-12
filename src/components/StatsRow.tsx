import { Icon } from '@iconify/react';

interface StatsRowProps {
  correct: number;
  incorrect: number;
  bestStreak: number;
}

export function StatsRow({ correct, incorrect, bestStreak }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-center">
        <Icon icon="mdi:check-circle" className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto" />
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{correct} Correct</p>
      </div>
      <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-center">
        <Icon icon="mdi:close-circle" className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto" />
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{incorrect} Incorrect</p>
      </div>
      <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-center">
        <Icon icon="mdi:fire" className="w-8 h-8 text-orange-600 dark:text-orange-400 mx-auto" />
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{bestStreak} Best Streak</p>
      </div>
    </div>
  );
}
