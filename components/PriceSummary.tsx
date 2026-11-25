export default function PriceSummary({ lines, range, fixedPrice }: { lines: { label: string; amount: number }[]; range?: string; fixedPrice?: number }) {
  const fmt = (n: number) => "Rs " + n.toLocaleString("en-IN");
  if (fixedPrice != null) return <div><p>Fixed Price: {fmt(fixedPrice)}</p><p>Fixed price for this standard cake.</p></div>;
  return <div><ul>{lines.map((l) => <li key={l.label}>{l.label}: {fmt(l.amount)}</li>)}</ul>{range && <p>Estimated: {range}</p>}<p>Estimate only. Final price confirmed by owner.</p></div>;
}
