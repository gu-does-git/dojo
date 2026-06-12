import React, { useState, useRef, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Icon } from '@iconify/react';
import { LoaderSVG } from './LoaderSVG';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import { KANA, type Kana, type KanaScript, type KanaGroup } from '../data/kana';

const KANA_CHARTS = {
  hiragana: { src: '/kana-hiragana-chart.png', author: 'Tofugu', sourceUrl: 'https://www.tofugu.com/japanese/hiragana-mnemonics-chart/', alt: 'Hiragana mnemonic chart' },
  katakana: { src: '/kana-katakana-chart.png', author: 'Tofugu', sourceUrl: 'https://www.tofugu.com/japanese/katakana-chart/', alt: 'Katakana mnemonic chart' },
} as const;
type Chart = { src: string; author: string; sourceUrl: string; alt: string };

const ALTERNATES: Record<string, string[]> = {
  'ん': ['n', 'nn'], 'ン': ['n', 'nn'],
  'ぢゃ': ['ja', 'zya'], 'ぢゅ': ['ju', 'zyu'], 'ぢょ': ['jo', 'zyo'],
  'ヂャ': ['ja', 'zya'], 'ヂュ': ['ju', 'zyu'], 'ヂョ': ['jo', 'zyo'],
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function speak(char: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(char);
  u.lang = 'ja-JP';
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

type Phase = 'setup' | 'quiz' | 'complete';

export default function KanaSession() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [queue, setQueue] = useState<Kana[]>([]);
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [chartOpen, setChartOpen] = useState<'hiragana' | 'katakana' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setMounted(true); }, []);

  const current = queue[index];

  // ─── Derived data for setup ───
  const groupedKana = useMemo(() => {
    const scripts: KanaScript[] = ['hiragana', 'katakana'];
    const groupNames: KanaGroup[] = ['main', 'dakuten', 'combination'];
    const result: Array<{ script: KanaScript; group: KanaGroup; rows: Array<{ rowChar: string; items: Kana[] }> }> = [];
    for (const s of scripts) {
      for (const g of groupNames) {
        const items = KANA.filter(k => k.script === s && k.group === g);
        const rowMap: Record<string, Kana[]> = {};
        for (const item of items) (rowMap[item.rowChar] ??= []).push(item);
        result.push({ script: s, group: g, rows: Object.entries(rowMap).map(([rowChar, rowItems]) => ({ rowChar, items: rowItems })) });
      }
    }
    return result;
  }, []);

  const allSelected = KANA.every(k => selected.has(k.char));

  // ─── Toggle handlers ───
  const toggleRow = (script: KanaScript, group: KanaGroup, rowChar: string) => {
    const rowItems = KANA.filter(k => k.script === script && k.group === group && k.rowChar === rowChar);
    const allSelected = rowItems.every(k => selected.has(k.char));
    setSelected(prev => {
      const next = new Set(prev);
      for (const k of rowItems) {
        if (allSelected) next.delete(k.char); else next.add(k.char);
      }
      return next;
    });
  };

  const toggleGroup = (script: KanaScript, group: KanaGroup) => {
    const items = KANA.filter(k => k.script === script && k.group === group);
    const allSelected = items.every(k => selected.has(k.char));
    setSelected(prev => {
      const next = new Set(prev);
      for (const k of items) {
        if (allSelected) next.delete(k.char); else next.add(k.char);
      }
      return next;
    });
  };

  const toggleAllKana = () => {
    setSelected(prev => {
      if (allSelected) return new Set();
      return new Set(KANA.map(k => k.char));
    });
  };

  // ─── Quiz handlers ───
  const handleStart = () => {
    const filtered = KANA.filter(k => selected.has(k.char));
    if (filtered.length === 0) return;
    setQueue(shuffle(filtered));
    setIndex(0);
    setInput('');
    setResults({});
    setStreak(0);
    setBestStreak(0);
    setShowHint(false);
    setPhase('quiz');
  };

  const handleSubmit = () => {
    const userAnswer = (inputRef.current?.value || '').trim().toLowerCase();
    if (!userAnswer || !current) return;

    const isCorrect = userAnswer === current.romaji
      || (ALTERNATES[current.char]?.includes(userAnswer) ?? false);

    if (isCorrect) {
      const prevWrong = results[current.char] || 0;
      setResults(prev => ({ ...prev, [current.char]: prev[current.char] || 0 }));
      if (prevWrong === 0) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        if (newStreak > bestStreak) setBestStreak(newStreak);
        const milestones: Record<number, string> = { 3: '🔥 3 in a row!', 5: '⚡ 5 streak!', 10: '🏆 10 streak!' };
        if (milestones[newStreak]) { setToast(milestones[newStreak]); setTimeout(() => setToast(null), 2000); }
      }
      setInput('');
      setShowHint(false);
      if (index + 1 < queue.length) {
        setIndex(i => i + 1);
      } else {
        setPhase('complete');
      }
    } else {
      setStreak(0);
      setResults(prev => ({ ...prev, [current.char]: (prev[current.char] || 0) + 1 }));
      setShaking(true);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
  };

  const handleGoToSetup = () => { setPhase('setup'); };

  const handleRestart = () => {
    const filtered = KANA.filter(k => selected.has(k.char));
    setQueue(shuffle(filtered));
    setIndex(0);
    setInput('');
    setResults({});
    setStreak(0);
    setBestStreak(0);
    setShowHint(false);
    setPhase('quiz');
  };

  const handleChangeKana = () => {
    setPhase('setup');
  };

  const handleEndEarly = () => {
    setPhase('complete');
  };

  // ─── Effects ───
  useEffect(() => {
    if (phase === 'quiz' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, index, shaking]);

  useEffect(() => {
    if (phase === 'complete') {
      const hasResults = Object.keys(results).length > 0;
      const allPerfect = Object.values(results).every(v => v === 0);
      if (hasResults && allPerfect) {
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      }
    }
  }, [phase, results]);

  // Chart modal keyboard/scroll
  useEffect(() => {
    if (!chartOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setChartOpen(null); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [chartOpen]);

  if (!mounted) return <LoaderSVG />;

  // ─── Chart Modal ───
  const renderChartModal = () => {
    if (!chartOpen) return null;
    const chart: Chart = chartOpen === 'hiragana' ? KANA_CHARTS.hiragana : KANA_CHARTS.katakana;
    const title = chartOpen === 'hiragana' ? 'Hiragana chart' : 'Katakana chart';
    return (
      <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 animate-fade-in"
        onClick={e => { if (e.target === e.currentTarget) setChartOpen(null); }}
      >
        <div role="dialog" aria-modal="true" aria-label={title}
          className="bg-surface border border-border rounded-lg max-w-4xl w-full flex flex-col p-4 sm:p-6 max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-lg font-semibold">{title}</h3>
            <button onClick={() => setChartOpen(null)} aria-label="Close"
              className="text-muted hover:text-fg transition-colors cursor-pointer">
              <Icon icon="mdi:close" className="w-5 h-5" />
            </button>
          </div>
          <Zoom wrapElement="div">
            <img src={chart.src} alt={chart.alt} className="w-full max-h-[70vh] object-contain rounded-md cursor-zoom-in" />
          </Zoom>
          <p className="text-xs text-muted text-center mt-3 flex items-center justify-center gap-1.5">
            <Icon icon="mdi:link-variant" className="w-3.5 h-3.5 shrink-0" />
            {chart.sourceUrl ? (
              <a href={chart.sourceUrl} target="_blank" rel="noopener noreferrer"
                className="text-muted hover:text-accent transition-colors">Image: {chart.author} ↗</a>
            ) : (
              <span>Image: {chart.author}</span>
            )}
          </p>
        </div>
      </div>
    );
  };

  // ─── Setup Phase ───
  if (phase === 'setup') {
    const groupAccentClass = (group: KanaGroup) => {
      switch (group) {
        case 'main': return 'text-accent';
        case 'dakuten': return 'text-success';
        case 'combination': return 'text-gold';
      }
    };

    const KanaRowTile = ({ row, allSelected, onToggle }: { row: { rowChar: string; items: Kana[] }; allSelected: boolean; onToggle: () => void }) => (
      <button onClick={onToggle} type="button" aria-pressed={allSelected}
        className={`relative flex flex-col items-center justify-center py-2.5 px-2 rounded-lg border transition-all cursor-pointer ${allSelected ? 'bg-accent-soft border-accent' : 'bg-surface-2 border-border hover:border-border-strong hover:bg-surface-3'}`}>
        <span style={{ fontFamily: 'var(--font-jp)' }} className="text-2xl leading-none mb-0.5">
          {row.rowChar}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted/70">
          {row.items[0].romaji}
        </span>
        {allSelected && (
          <Icon icon="mdi:check" className="w-3 h-3 text-accent absolute -top-1 -right-1" />
        )}
      </button>
    );

    const scripts: KanaScript[] = ['hiragana', 'katakana'];

    return (
      <div className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold tracking-tight">Practice Hiragana &amp; Katakana</h1>
        </div>

        {/* Quick reference charts */}
        <div className="flex gap-3 mb-6">
          <button onClick={() => setChartOpen('hiragana')}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors cursor-pointer">
            <Icon icon="mdi:image-outline" className="w-4 h-4" />
            Hiragana chart
          </button>
          <button onClick={() => setChartOpen('katakana')}
            className="flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors cursor-pointer">
            <Icon icon="mdi:image-outline" className="w-4 h-4" />
            Katakana chart
          </button>
        </div>

        {/* Two-column script cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {scripts.map(script => {
            const sections = groupedKana.filter(s => s.script === script);
            const selectedCount = KANA.filter(k => k.script === script && selected.has(k.char)).length;
            const scriptLabel = script === 'hiragana' ? 'Hiragana' : 'Katakana';

            return (
              <article key={script} className="bg-surface border border-border rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-display text-xl font-semibold">{scriptLabel}</h2>
                  <span className="text-xs text-muted">{selectedCount} selected</span>
                </div>

                {sections.map(section => {
                  const items = KANA.filter(k => k.script === section.script && k.group === section.group);
                  const sectionAllSelected = items.every(k => selected.has(k.char));
                  const groupLabel = section.group === 'main' ? 'Main' : section.group === 'dakuten' ? 'Dakuten' : 'Combination';

                  return (
                    <div key={section.group} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between mb-2 mt-3 first:mt-0">
                        <span className={`text-xs font-semibold uppercase tracking-wider ${groupAccentClass(section.group)}`}>
                          {groupLabel}
                        </span>
                        <label className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border cursor-pointer transition-all ${sectionAllSelected ? 'text-accent bg-accent-soft border-transparent' : 'text-muted border-border-strong/40 hover:text-fg-secondary'}`}>
                          <input type="checkbox" className="hidden" checked={sectionAllSelected} onChange={() => toggleGroup(section.script, section.group)} />
                          <Icon icon={sectionAllSelected ? 'mdi:checkbox-marked' : 'mdi:checkbox-blank-outline'} className="w-3 h-3" />
                          All
                        </label>
                      </div>

                      <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                        {section.rows.map(row => (
                          <KanaRowTile
                            key={row.rowChar}
                            row={row}
                            allSelected={row.items.every(k => selected.has(k.char))}
                            onToggle={() => toggleRow(section.script, section.group, row.rowChar)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </article>
            );
          })}
        </div>

        {/* All Kana + Start */}
        <div className="flex items-center gap-3 mt-6">
          <label className={`inline-flex items-center gap-2 px-4 py-3.5 rounded-lg text-sm font-semibold border cursor-pointer transition-all flex-1 justify-center ${allSelected ? 'text-accent bg-accent-soft border-transparent' : 'text-fg-secondary bg-surface-2 border-border-strong/40 hover:border-muted'}`}>
            <input type="checkbox" className="hidden" checked={allSelected} onChange={toggleAllKana} />
            <Icon icon={allSelected ? 'mdi:checkbox-marked' : 'mdi:checkbox-blank-outline'} className="w-4 h-4" />
            All Kana
          </label>
          <button onClick={handleStart} disabled={selected.size === 0}
            className={`flex-[2] py-3.5 rounded-lg text-base font-semibold transition-all cursor-pointer ${selected.size === 0 ? 'bg-surface-3 text-muted opacity-50 cursor-not-allowed' : 'bg-accent text-white hover:brightness-112'}`}>
            Start Quiz!{selected.size > 0 && ` (${selected.size} kana)`}
          </button>
        </div>

        {renderChartModal()}
      </div>
    );
  }

  // ─── Quiz Phase ───
  if (phase === 'quiz' && current) {
    const progressWidth = (index / queue.length) * 100;

    return (
      <div className="animate-fade-in">
        {/* Progress bar */}
        <div className="flex items-center gap-3.5 pt-4 pb-3 sm:pt-7 sm:pb-5">
          <button onClick={handleGoToSetup}
            className="text-sm text-muted font-medium hover:text-fg transition-colors no-underline shrink-0 cursor-pointer">
            ← Back
          </button>
          <button onClick={() => setChartOpen('hiragana')}
            className="text-xs text-muted hover:text-accent transition-colors cursor-pointer" title="Hiragana chart">
            <Icon icon="mdi:image-outline" className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setChartOpen('katakana')}
            className="text-xs text-muted hover:text-accent transition-colors cursor-pointer" title="Katakana chart">
            <Icon icon="mdi:image-outline" className="w-3.5 h-3.5" />
          </button>
          <div className="flex-1 h-[5px] bg-surface-3 rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all duration-500 ease-out" style={{ width: `${progressWidth}%` }} />
          </div>
          <span className="text-sm font-semibold text-accent tabular-nums whitespace-nowrap">
            {index + 1} / {queue.length}
          </span>
          <button onClick={handleEndEarly}
            className="text-xs text-muted font-medium hover:text-error transition-colors cursor-pointer shrink-0">
            End session
          </button>
        </div>

        {/* Kana card */}
        <div className="bg-surface border border-border rounded-lg p-8 sm:p-12 mb-5 text-center">
          <button onClick={() => speak(current.char)}
            className="float-right text-muted hover:text-accent transition-colors cursor-pointer" title="Listen to pronunciation">
            <Icon icon="mdi:volume-high" className="w-5 h-5" />
          </button>
          <div
            style={{ fontFamily: 'var(--font-jp)', cursor: 'pointer' }}
            className="text-7xl sm:text-8xl leading-none mb-2 inline-block"
            onClick={() => speak(current.char)}
          >
            {current.char}
          </div>
        </div>

        {/* Hint */}
        <div className="mb-4">
          {!showHint ? (
            <button onClick={() => setShowHint(true)}
              className="text-xs text-muted hover:text-gold transition-colors cursor-pointer">
              Show hint
            </button>
          ) : (
            <div className="bg-gold-soft text-gold text-sm p-3 rounded-lg animate-fade-in">
              <span className="font-semibold">Hint:</span> {current.mnemonic}
            </div>
          )}
        </div>

        {/* Input */}
        <div className={`mb-4 transition-all ${shaking ? 'animate-shake' : ''}`}
          onAnimationEnd={() => setShaking(false)}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type the romaji…"
            autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false}
            className="w-full px-4 py-3.5 text-lg sm:text-xl bg-surface-2 border-2 border-border-strong rounded-lg text-fg placeholder:text-muted outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Submit */}
        <button onClick={handleSubmit}
          className="w-full py-3.5 bg-accent text-white rounded-lg text-base font-semibold hover:brightness-112 transition-all cursor-pointer">
          Check Answer
        </button>

        {renderChartModal()}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-40">
            <div className="bg-fg text-bg px-4 py-2 rounded-lg font-semibold">{toast}</div>
          </div>
        )}
      </div>
    );
  }

  // ─── Complete Phase ───
  const answeredCount = Object.keys(results).length;
  const numFirstTry = Object.values(results).filter(v => v === 0).length;
  const numFailed = Object.values(results).filter(v => v > 0).length;
  const displayPercentage = answeredCount > 0 ? Math.round((numFirstTry / answeredCount) * 100) : 0;

  // Problem kana sorted by attempts desc
  const problemKana = Object.entries(results)
    .filter(([, v]) => v > 0)
    .sort(([aChar, a], [bChar, b]) => b - a || aChar.localeCompare(bChar));

  return (
    <div className="text-center py-8 sm:py-16 animate-slide-up">
      <div className="text-6xl mb-4">{Object.keys(results).length === queue.length && numFailed === 0 ? '🏆' : '✅'}</div>
      <h2 className="font-display text-3xl font-bold tracking-tight mb-2">
        {numFailed === 0 ? 'Perfect!' : 'Session Complete'}
      </h2>
      <p className="text-base text-fg-secondary mb-8">
        {answeredCount === queue.length
          ? 'Here\'s how you did.'
          : `${answeredCount} of ${queue.length} kana attempted.`}
      </p>

      {/* Stats */}
      <div className="flex justify-center gap-4 sm:gap-8 mb-6 sm:mb-8">
        <div className="text-center">
          <div className="text-3xl font-bold text-success tabular-nums">{numFirstTry}</div>
          <div className="text-sm text-muted">First-try</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-error tabular-nums">{numFailed}</div>
          <div className="text-sm text-muted">Needed work</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-accent tabular-nums">{displayPercentage}%</div>
          <div className="text-sm text-muted">Accuracy</div>
        </div>
      </div>

      {/* Problem kana */}
      {problemKana.length > 0 && (
        <div className="space-y-3 max-w-lg mx-auto mb-8 text-left">
          <h3 className="text-base font-semibold text-fg">Review — kana that need practice</h3>
          <div className="space-y-1.5 max-h-60 sm:max-h-80 overflow-y-auto p-3 rounded-lg border border-border bg-surface/30">
            {problemKana.map(([char, wrongCount]) => {
              const kana = KANA.find(k => k.char === char);
              if (!kana) return null;
              return (
                <div key={char} className="p-3 rounded-lg bg-surface/50 border border-border flex items-center gap-3">
                  <span style={{ fontFamily: 'var(--font-jp)' }} className="text-2xl font-bold">{char}</span>
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-surface-2">{kana.romaji}</span>
                  <span className="text-sm text-muted ml-auto">{wrongCount} attempt{wrongCount === 1 ? '' : 's'}</span>
                  <p className="text-xs text-muted mt-0.5 line-clamp-1">{kana.mnemonic}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2 sm:justify-center">
        <button onClick={handleRestart}
          className="px-7 py-3 bg-accent text-white rounded-lg text-base font-semibold hover:brightness-112 transition-all cursor-pointer">
          Practice Again
        </button>
        <button onClick={handleChangeKana}
          className="px-7 py-3 bg-surface-2 text-fg border border-border-strong rounded-lg text-base font-semibold hover:bg-surface-3 hover:border-muted transition-all cursor-pointer">
          Change Kana
        </button>
      </div>

      {renderChartModal()}
    </div>
  );
}
