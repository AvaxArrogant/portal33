
export default function Badge({ children, tone='default' }:{ children:React.ReactNode; tone?:"default"|"gold"|"grey"|"green"|"amber" }){
  const map={ default:"bg-ink-800 text-white", gold:"bg-gold-500 text-ink-900", grey:"bg-ink-300 text-ink-800", green:"bg-green-500 text-white", amber:"bg-amber-500 text-ink-900" } as const;
  return <span className={`pill ${map[tone]}`}>{children}</span>;
}