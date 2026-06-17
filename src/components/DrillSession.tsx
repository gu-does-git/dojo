import React, { useState, useRef, useEffect } from 'react';
import { toHiragana, bind, unbind } from 'wanakana';
import confetti from 'canvas-confetti';
import { Icon } from '@iconify/react';
import { LoaderSVG } from './LoaderSVG';
import { FuriganaText } from './FuriganaText';

interface Question {
  prompt: string;
  reading?: string;
  romaji: string;
  answer: string;
  answerRomaji: string;
  politeAnswer?: string;
  politeAnswerRomaji?: string;
  difficulty?: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  tense?: string;
  hint?: string;
}

interface Props {
  questions: Question[];
  cheatsheetUrl?: string;
  drillType?: string;
}

type Phase = 'answering' | 'feedback' | 'complete';

export default function DrillSession({ questions, cheatsheetUrl, drillType }: Props) {
  const [shuffled] = useState(() => { const a = [...questions]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('answering');
  const [isCorrect, setIsCorrect] = useState(false);
  const [reversed, setReversed] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [polite, setPolite] = useState(false);
  const [showRomaji, setShowRomaji] = useState(true);
  const [showTense, setShowTense] = useState(true);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [toast, setToast] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [results, setResults] = useState<Array<{ question: Question; userAnswer: string; correct: boolean }>>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (phase === 'complete' && score === shuffled.length) {
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    }
  }, [phase]);

  const currentQuestion = shuffled[currentIdx];
  const activeAnswer = polite ? (currentQuestion.politeAnswer ?? currentQuestion.answer) : currentQuestion.answer;
  const activeAnswerRomaji = polite ? (currentQuestion.politeAnswerRomaji ?? currentQuestion.answerRomaji) : currentQuestion.answerRomaji;
  const displayPrompt = reversed ? activeAnswer : currentQuestion.prompt;
  const displayRomaji = reversed ? activeAnswerRomaji : currentQuestion.romaji;
  const furigana = toHiragana(displayRomaji);
  const correctRomaji = reversed ? currentQuestion.romaji : activeAnswerRomaji;
  const percentage = Math.round((score / shuffled.length) * 100);

  const toggles = [
    { key: 'furigana', label: '\u3042 Furigana', value: showFurigana, onChange: setShowFurigana, show: true },
    { key: 'reverse', label: '\u21c4 Reverse', value: reversed, onChange: setReversed, show: drillType !== 'particles' },
    { key: 'polite', label: '\u656c Polite', value: polite, onChange: setPolite, show: !!currentQuestion?.politeAnswer },
    { key: 'romaji', label: 'EN Romaji', value: showRomaji, onChange: setShowRomaji, show: true },
    { key: 'tense', label: '\u6642 Tense', value: showTense, onChange: setShowTense, show: !!currentQuestion?.tense },
  ];
  const visibleToggles = toggles.filter(t => t.show);
  const desktopCols = Math.min(visibleToggles.length, 4) as 1 | 2 | 3 | 4;
  const desktopGridClass = { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4' }[desktopCols];

  useEffect(() => {
    if (mounted && phase === 'answering' && inputRef.current) {
      const timer = setTimeout(() => {
        if (inputRef.current) { bind(inputRef.current); inputRef.current.focus(); }
      }, 0);
      return () => { clearTimeout(timer); if (inputRef.current) unbind(inputRef.current); };
    }
  }, [mounted, currentIdx, reversed, phase]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches('input')) return;
      if (e.key === 'r') setReversed(v => !v);
      if (e.key === 'f') setShowFurigana(v => !v);
      if (e.key === 'o') setShowRomaji(v => !v);
      if (e.key === 'p') setPolite(v => !v);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSubmit = () => {
    if (phase === 'answering') {
      const userAnswer = (inputRef.current?.value || '').trim();
      setInput(userAnswer);
      const correctAnswerInHiragana = toHiragana(correctRomaji);
      const correct = userAnswer === correctAnswerInHiragana;
      setIsCorrect(correct);
      setResults(prev => [...prev, { question: currentQuestion, userAnswer, correct }]);
      if (correct) {
        setScore(score + 1);
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);
        const milestones: Record<number, string> = { 3: '🔥 3 in a row!', 5: '⚡ 5 streak!', 10: '🏆 10 streak!' };
        if (milestones[newStreak]) { setToast(milestones[newStreak]); setTimeout(() => setToast(null), 2000); }
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
      } else { setPhase('complete'); }
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0); setScore(0); setWrongCount(0); setInput('');
    if (inputRef.current) inputRef.current.value = '';
    setPhase('answering'); setReversed(false); setPolite(false); setShowFurigana(true); setShowRomaji(true);
    setShowTense(true);
    setStreak(0); setToast(null); setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
  };

  const progressWidth = phase === 'answering'
    ? ((currentIdx) / shuffled.length) * 100
    : ((currentIdx + 1) / shuffled.length) * 100;

  if (!mounted) return <LoaderSVG />;

  // ─── Complete screen ───
  if (phase === 'complete') {
    return (
      <div className="text-center py-8 sm:py-16 animate-slide-up">
        <div className="text-6xl mb-4">🏯</div>
        <h2 className="font-display text-3xl font-bold tracking-tight mb-2">Drill Complete</h2>
        <p className="text-base text-fg-secondary mb-8">Here's how you did.</p>
        <div className="flex justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-success tabular-nums">{score}</div>
            <div className="text-sm text-muted">Correct</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-error tabular-nums">{wrongCount}</div>
            <div className="text-sm text-muted">Incorrect</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-accent tabular-nums">{percentage}%</div>
            <div className="text-sm text-muted">Accuracy</div>
          </div>
        </div>

        {/* Question History */}
        <div className="space-y-3 max-w-lg mx-auto mb-8 text-left">
          <h3 className="text-base font-semibold text-fg">Review</h3>
          <div className="space-y-1.5 max-h-60 sm:max-h-80 overflow-y-auto p-3 rounded-lg border border-border bg-surface/30">
            {results.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-surface/50 border border-border space-y-1.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {r.question.difficulty && (
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wide ${r.question.difficulty === 'N5' ? 'bg-success/15 text-success' :
                        r.question.difficulty === 'N4' ? 'bg-accent-soft text-accent' :
                          'bg-gold-soft text-gold'
                        }`}>{r.question.difficulty}</span>
                    )}
                    <span className="text-fg text-sm truncate">{r.question.prompt}</span>
                  </div>
                  <Icon icon={r.correct ? 'mdi:check-circle' : 'mdi:close-circle'}
                    className={`w-5 h-5 shrink-0 ${r.correct ? 'text-success' : 'text-error'}`} />
                </div>
                {!r.correct && r.question.hint && (
                  <p className="text-xs text-muted italic pl-4 border-l-2 border-border">{r.question.hint}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:justify-center">
          <button onClick={handleRestart}
            className="px-7 py-3 bg-accent text-white rounded-lg text-base font-semibold hover:brightness-112 transition-all">
            Redo Drill
          </button>
          <a href="/drills"
            className="inline-flex items-center px-7 py-3 bg-surface-2 text-fg border border-border-strong rounded-lg text-base font-semibold hover:bg-surface-3 hover:border-muted transition-all">
            Back to Drills
          </a>
        </div>
      </div>
    );
  }

  // ─── Main drill UI ───
  return (
    <div className="animate-fade-in">
      {/* Progress Bar */}
      <div className="flex items-center gap-3.5 pt-4 pb-3 sm:pt-7 sm:pb-5">
        <a href="/drills" className="text-sm text-muted font-medium hover:text-fg transition-colors no-underline shrink-0">
          ← Back
        </a>
        <div className="flex-1 h-[5px] bg-surface-3 rounded-full overflow-hidden">
          <div className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressWidth}%` }} />
        </div>
        <span className="text-sm font-semibold text-accent tabular-nums whitespace-nowrap">
          {currentIdx + 1} / {shuffled.length}
        </span>
      </div>

      {/* Desktop toggle bar (sm+) */}
      <div className={`hidden sm:grid ${desktopGridClass} gap-3 mb-5 p-3 bg-surface border border-border rounded-lg`}>
        {visibleToggles.map(t => (
          <div key={t.key} className="flex items-center justify-center">
            <button onClick={() => t.onChange((v: boolean) => !v)}
              className={`flex items-center justify-center gap-3 px-2 py-1.5 rounded-full text-sm font-medium border w-full active:scale-95 transition-all duration-150 cursor-pointer ${t.value ? 'text-accent bg-accent-soft border-transparent' : 'text-muted border-border-strong/40 hover:text-fg-secondary hover:bg-surface-2'}`}>
              <span className={`relative w-8 h-4 rounded-full scale-75 transition-colors duration-200 ${t.value ? 'bg-accent' : 'bg-surface-3'}`}>
                <span className={`absolute top-0.5 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${t.value ? 'translate-x-full' : '-translate-x-0.5'}`} />
              </span>
              {t.label}
            </button>
          </div>
        ))}
      </div>

      {/* Mobile FAB (sm-) */}
      {visibleToggles.length > 0 && (
        <button onClick={() => setMenuOpen(true)} aria-label="Open settings" aria-expanded={menuOpen}
          className={`sm:hidden fixed bottom-4 left-4 z-40 w-11 h-11 rounded-full bg-surface-2 border border-border-strong text-fg flex items-center justify-center shadow-lg active:scale-90 transition-all duration-150 ${menuOpen ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          <Icon icon="mdi:tune-vertical" className="w-5 h-5" />
        </button>
      )}

      {/* Mobile popover (sm-) */}
      {menuOpen && visibleToggles.length > 0 && (
        <>
          <div onClick={() => setMenuOpen(false)} className="sm:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm animate-fade-in" />
          <div className="sm:hidden fixed inset-x-4 top-20 z-50 bg-surface border border-border rounded-lg p-3 space-y-2 shadow-2xl animate-fade-in">
            {visibleToggles.map((t, i) => (
              <button key={t.key} onClick={() => { t.onChange((v: boolean) => !v); setMenuOpen(false); }}
                style={{ animationDelay: `${i * 35}ms` }}
                className={`animate-slide-up flex items-center justify-between w-full py-3 px-3 min-h-[44px] rounded-md text-sm font-medium border active:scale-[0.98] transition-colors duration-150 cursor-pointer ${t.value ? 'text-accent bg-accent-soft border-transparent' : 'text-fg-secondary bg-surface-2 border-border-strong/40'}`}>
                <span>{t.label}</span>
                <span className={`relative w-8 h-4 rounded-full transition-colors duration-200 shrink-0 ${t.value ? 'bg-accent' : 'bg-surface-3'}`}>
                  <span className={`absolute top-0.5 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-200 ${t.value ? 'translate-x-full' : '-translate-x-0.5'}`} />
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {phase === 'answering' && (
        <>
          {/* Question Card */}
          <div className="bg-surface border border-border rounded-lg p-5 sm:p-9 mb-5">
            <div className="flex items-center gap-2 mb-5">
              {currentQuestion.difficulty && (
                <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${currentQuestion.difficulty === 'N5' ? 'bg-success/15 text-success' :
                  currentQuestion.difficulty === 'N4' ? 'bg-accent-soft text-accent' :
                    'bg-gold-soft text-gold'
                  }`}>{currentQuestion.difficulty}</span>
              )}
              {showTense && currentQuestion.tense && (
                <span className={`text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${{
                  'Non-past': 'bg-accent-soft text-accent border-accent/20',
                  'Non-past Neg': 'bg-error-bg text-error border-error/20',
                  'Past': 'bg-success-bg text-success border-success/20',
                  'Past Neg': 'bg-gold-soft text-gold border-gold/20',
                }[currentQuestion.tense] || 'bg-accent-soft text-accent border-accent/20'}`}>
                  {currentQuestion.tense}
                </span>
              )}
              <span className="text-xs text-muted tabular-nums ml-auto">Q{currentIdx + 1}</span>
            </div>
            <div className="font-display text-2xl sm:text-4xl leading-tight mb-3">
              {currentQuestion.reading
                ? (() => {
                  const promptParts = displayPrompt.split('___');
                  const readingParts = currentQuestion.reading.split('___');
                  return (
                    <span>
                      {promptParts.map((part, i) => (
                        <span key={i}>
                          <FuriganaText word={part} reading={readingParts[i] ?? ''} showFuri={showFurigana} spacing="loose" rtMargin="mb-2" />
                          {i < promptParts.length - 1 && (
                            <span className="inline-block min-w-20 border-b-2 border-dotted border-border text-muted font-bold text-center text-2xl leading-relaxed">?</span>
                          )}
                        </span>
                      ))}
                    </span>
                  );
                })()
                : <FuriganaText word={displayPrompt} reading={furigana} showFuri={showFurigana} spacing="loose" rtMargin="mb-2" />
              }
            </div>
            {!reversed && (
              <p className={`text-sm text-muted/70 tracking-wide font-mono tabular-nums transition-opacity duration-300 ${showRomaji ? 'opacity-100' : 'opacity-0'}`}>
                {displayRomaji}
              </p>
            )}
          </div>

          {/* Input */}
          <div className="mb-5">
            <input ref={inputRef} type="text"
              placeholder="Type answer (in hiragana)…"
              autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
              className="w-full px-4 py-3.5 text-lg sm:text-xl bg-surface-2 border-2 border-border-strong rounded-lg text-fg placeholder:text-muted outline-none focus:border-accent transition-colors"
              onKeyDown={handleKeyDown}
            />
          </div>

          {/* Action */}
          <div className="flex gap-2">
            <button onClick={handleSubmit}
              className="flex-1 py-3.5 bg-accent text-white rounded-lg text-base font-semibold hover:brightness-112 transition-all">
              Check Answer
            </button>
          </div>
        </>
      )}

      {phase === 'feedback' && (
        <>
          {/* Feedback */}
          <div className={`p-5 rounded-lg mb-4 animate-slide-up ${isCorrect ? 'bg-success-bg border border-success/20' : 'bg-error-bg border border-error/20'
            }`}>
            <div className={`font-bold text-base mb-1.5 flex items-center gap-2 ${isCorrect ? 'text-success' : 'text-error'
              }`}>
              <Icon icon={isCorrect ? 'mdi:check-circle' : 'mdi:close-circle'} className="w-5 h-5" />
              {isCorrect ? 'Correct!' : 'Not quite'}
            </div>
            <div className="text-sm text-fg-secondary leading-relaxed">
              {!isCorrect && (
                <>
                  <p className="mb-2">You typed: <code className="font-mono text-sm bg-white/5 px-1.5 py-0.5 rounded">{input}</code></p>
                  <p className="mb-2">The correct answer is <strong className="text-success font-bold"><FuriganaText word={reversed ? currentQuestion.prompt : activeAnswer} reading={toHiragana(reversed ? currentQuestion.romaji : activeAnswerRomaji)} showFuri={showFurigana} /></strong></p>
                </>
              )}
              {currentQuestion.hint && (
                <p className="text-muted">{currentQuestion.hint}</p>
              )}
            </div>
          </div>

          <button autoFocus onClick={handleSubmit}
            className="w-full py-3.5 bg-surface-2 text-fg border border-border-strong rounded-lg text-base font-semibold hover:bg-surface-3 hover:border-muted transition-all">
            {currentIdx + 1 === shuffled.length ? 'See Results →' : 'Continue →'}
          </button>
        </>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="bg-fg text-bg px-4 py-2 rounded-lg font-semibold">{toast}</div>
        </div>
      )}
      {cheatsheetUrl && (
        <a href={cheatsheetUrl} target="_blank" rel="noopener noreferrer"
          className="fixed bottom-4 right-4 z-30 w-11 h-11 active:scale-90 transition-all duration-150 rounded-full bg-accent text-white flex items-center justify-center shadow-lg hover:brightness-112 no-underline">
          <Icon icon="mdi:help" className="w-5 h-5" />
        </a>
      )}
    </div>
  );
}
