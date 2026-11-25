export const STEPS = ["Occasion", "Size + Kg", "Flavour", "Look", "Date & Delivery"];
export default function DesignerSteps({ step }: { step: number }) {
  return <div aria-label="Progress"><div>{STEPS.map((s, i) => <span key={s}>{i + 1}. {s} </span>)}</div><div><div style={{ width: `${step * 20}%` }} /></div></div>;
}
