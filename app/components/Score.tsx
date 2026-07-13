export default function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="scorebox">
      <div className="slabel">{label}</div>
      <div className="svalue">{value}</div>
    </div>
  );
}
