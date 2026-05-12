// @ts-ignore
import { useFuriPairs } from 'react-furi';

interface FuriganaTextProps {
  word: string;
  reading: string;
  showFuri?: boolean;
  spacing?: 'normal' | 'loose';
  rtMargin?: string;
}

export function FuriganaText({
  word,
  reading,
  showFuri = true,
  spacing = 'normal',
  rtMargin = 'mb-1'
}: FuriganaTextProps) {
  const pairs = useFuriPairs(word, reading);
  return (
    <span className='font-light' style={{ fontFamily: "'Kiwi Maru', sans-serif", lineHeight: spacing === 'loose' ? '2' : '1.2' }}>
      {pairs.map(([furiText, text]: [string, string], idx: number) => (
        <ruby key={idx}>
          {text}
          {showFuri && <rt className={`text-sm ${rtMargin} text-muted`}>{furiText}</rt>}
        </ruby>
      ))}
    </span>
  );
}
