import React, { useState, useRef, useEffect } from 'react';
import { toHiragana, bind, unbind } from 'wanakana';
import confetti from 'canvas-confetti';
import { Icon } from '@iconify/react';
import { LoaderSVG } from './LoaderSVG';
import { FuriganaText } from './FuriganaText';
import { ScoreCard } from './ScoreCard';
import { StatsRow } from './StatsRow';
import { QuestionHistory } from './QuestionHistory';

interface Question {
  prompt: string;
  reading?: string;
  romaji: string;
  answer: string;
  answerRomaji: string;
  difficulty?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  hint?: string;
}

interface Props {
  questions: Question[];
  cheatsheetUrl?: string;
  drillType?: string;
}

type Phase = 'answering' | 'feedback' | 'complete';

export default function DrillSession({ questions, cheatsheetUrl, drillType }: Props) {
  const [shuffled] = useState(() => questions);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('answering');
  const [isCorrect, setIsCorrect] = useState(false);
  const [reversed, setReversed] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<Array<{ question: Question; userAnswer: string; correct: boolean }>>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (phase === 'complete' && score === shuffled.length) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  }, [phase]);

  const currentQuestion = shuffled[currentIdx];
  const displayPrompt = reversed ? currentQuestion.answer : currentQuestion.prompt;
  const displayRomaji = reversed ? currentQuestion.answerRomaji : currentQuestion.romaji;
  const furigana = toHiragana(displayRomaji);
  const correctRomaji = reversed ? currentQuestion.romaji : currentQuestion.answerRomaji;
  const percentage = Math.round((score / shuffled.length) * 100);

  useEffect(() => {
    if (mounted && phase === 'answering' && inputRef.current && !reversed) {
      const timer = setTimeout(() => {
        if (inputRef.current) {
          bind(inputRef.current);
          inputRef.current.focus();
        }
      }, 0);
      return () => {
        clearTimeout(timer);
        if (inputRef.current) unbind(inputRef.current);
      };
    }
  }, [mounted, currentIdx, reversed, phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches('input')) return;
      if (e.key === 'r') setReversed(v => !v);
      if (e.key === 'f') setShowFurigana(v => !v);
      if (e.key === 'o') setShowRomaji(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSubmit = () => {
    if (phase === 'answering') {
      // Read from input element directly to get WanaKana's converted value
      const userAnswer = (inputRef.current?.value || '').trim();
      setInput(userAnswer); // Sync state for feedback display

      // Use hiragana version of answer romaji as correct answer for comparison
      const correctAnswerInHiragana = toHiragana(correctRomaji);
      const correct = userAnswer === correctAnswerInHiragana;
      setIsCorrect(correct);
      setResults(prev => [...prev, { question: currentQuestion, userAnswer, correct }]);

      if (correct) {
        setScore(score + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);
        // Toast on milestones
        const milestones: Record<number, string> = { 3: '🔥 3 in a row!', 5: '⚡ 5 streak!', 10: '🏆 10 streak!' };
        if (milestones[newStreak]) {
          setToast(milestones[newStreak]);
          setTimeout(() => setToast(null), 2000);
        }
      } else {
        setWrongCount(wrongCount + 1);
        setStreak(0);
      }
      setPhase('feedback');
    } else if (phase === 'feedback') {
      if (currentIdx + 1 < shuffled.length) {
        setCurrentIdx(currentIdx + 1);
        setInput('');
        if (inputRef.current) inputRef.current.value = '';
        setPhase('answering');
      } else {
        setPhase('complete');
      }
    }
  };


  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setWrongCount(0);
    setInput('');
    if (inputRef.current) inputRef.current.value = '';
    setPhase('answering');
    setReversed(false);
    setShowFurigana(true);
    setShowRomaji(true);
    setStreak(0);
    setToast(null);
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!mounted) {
    return <LoaderSVG />;
  }

  if (phase === 'complete') {
    return (
      <div className="space-y-8 py-12 animate-in fade-in duration-500">
        <ScoreCard score={score} total={shuffled.length} percentage={percentage} />
        <StatsRow correct={score} incorrect={shuffled.length - score} bestStreak={bestStreak} />
        <QuestionHistory results={results} />

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <button
            onClick={handleRestart}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all"
          >
            <Icon icon="mdi:refresh" className="w-5 h-5" />
            Restart Drill
          </button>
          <a
            href="/drills"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all text-center"
          >
            <Icon icon="mdi:arrow-left" className="w-5 h-5" />
            Back to Drills
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Settings Bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex gap-2 flex-wrap">
          {drillType !== 'particles' && (
            <button
              onClick={() => { setReversed(v => !v); setInput(''); if (inputRef.current) inputRef.current.value = ''; }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                reversed
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
            >
              <Icon icon="mdi:swap-horizontal" className="w-4 h-4" />
              Reverse <span className="opacity-50 text-xs">(r)</span>
            </button>
          )}
          {drillType !== 'particles' && (
            <button
              onClick={() => setShowFurigana(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                showFurigana
                  ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500'
                  : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
              }`}
            >
              <Icon icon="mdi:ideogram-cjk" className="w-4 h-4" />
              Furigana <span className="opacity-50 text-xs">(f)</span>
            </button>
          )}
          <button
            onClick={() => setShowRomaji(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              showRomaji
                ? 'bg-indigo-600 dark:bg-indigo-500 text-white border-indigo-600 dark:border-indigo-500'
                : 'bg-transparent text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'
            }`}
          >
            <Icon icon="mdi:alphabetical" className="w-4 h-4" />
            Romaji <span className="opacity-50 text-xs">(o)</span>
          </button>
        </div>

        {cheatsheetUrl && (
          <a
            href={cheatsheetUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all"
          >
            <Icon icon="mdi:book-open-variant" className="w-4 h-4" />
            Cheatsheet
          </a>
        )}
      </div>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Question {currentIdx + 1} of {questions.length}
        </span>
        <div className="w-48 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {phase === 'answering' && (
        <div className="space-y-8 py-12">
          {/* Question */}
          <div className="text-center space-y-3">
            {currentQuestion.difficulty && (
              <div className="flex justify-center mb-6">
                <span className={`text-sm px-3 py-1.5 rounded-full font-semibold inline-block border-2 ${
                  currentQuestion.difficulty === 'N5' ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700' :
                  currentQuestion.difficulty === 'N4' ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700' :
                  currentQuestion.difficulty === 'N3' ? 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700' :
                  currentQuestion.difficulty === 'N2' ? 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-700' :
                  'bg-red-100 text-red-700 border-red-300 dark:bg-red-900/30 dark:text-red-400 dark:border-red-700'
                }`}>
                  {currentQuestion.difficulty}
                </span>
              </div>
            )}
            <div className="text-6xl sm:text-7xl font-bold text-slate-900 dark:text-white">
              {currentQuestion.reading
                ? (() => {
                    const promptParts = displayPrompt.split('___');
                    const readingParts = currentQuestion.reading.split('___');
                    return (
                      <span>
                        {promptParts.map((part, i) => (
                          <span key={i}>
                            <FuriganaText word={part} reading={readingParts[i] ?? ''} showFuri={showFurigana} spacing="loose" rtMargin="mb-4" />
                            {i < promptParts.length - 1 && (
                              <span className="text-slate-300 dark:text-slate-600">＿</span>
                            )}
                          </span>
                        ))}
                      </span>
                    );
                  })()
                : <FuriganaText word={displayPrompt} reading={furigana} showFuri={showFurigana} spacing="loose" rtMargin="mb-4" />
              }
            </div>
            {showRomaji && (
              <p className="text-xl text-slate-600 dark:text-slate-400 font-light">
                {displayRomaji}
              </p>
            )}
            {currentQuestion.hint && displayPrompt.includes('___') && (
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">
                {currentQuestion.hint}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="space-y-4">
            <input
              ref={inputRef}
              type="text"
              defaultValue={input}
              onKeyDown={handleKeyDown}
              placeholder="Enter your answer..."
              className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSubmit}
              className="w-full px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all"
            >
              Check Answer
            </button>
          </div>
        </div>
      )}

      {phase === 'feedback' && (
        <div className="space-y-8 py-12">
          {/* Result Banner */}
          <div
            className={`p-6 rounded-lg border-2 flex items-center gap-3 ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700'
            }`}
          >
            <Icon
              icon={isCorrect ? 'mdi:check-circle' : 'mdi:close-circle'}
              className={`w-7 h-7 shrink-0 ${isCorrect ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
            />
            <p className={`text-lg font-semibold ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </p>
          </div>

          {/* Answer Details */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Your answer:</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">{input}</p>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">Correct answer:</p>
              <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
                <FuriganaText word={reversed ? currentQuestion.prompt : currentQuestion.answer} reading={toHiragana(correctRomaji)} showFuri={showFurigana} />
              </div>
            </div>

            {!isCorrect && currentQuestion.hint && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Hint:</strong> {currentQuestion.hint}
                </p>
              </div>
            )}
          </div>

          {/* Next Button */}
          <button
            autoFocus
            onClick={handleSubmit}
            className="w-full px-6 py-3 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all"
          >
            {currentIdx + 1 === shuffled.length ? 'See Results →' : 'Next Question →'}
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-2 rounded-lg font-semibold transition-opacity duration-300 opacity-100">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}
