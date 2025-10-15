
export default function Section({ title, children }:{ title:string; children:React.ReactNode }){
  return (
    <div className="card p-5 mb-5">
      <h3 className="section-title">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-ink-700">{children}</div>
    </div>
  );
}