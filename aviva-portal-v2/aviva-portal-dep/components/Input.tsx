
import { InputHTMLAttributes } from "react";
export default function Input({ label, icon, ...props }:{ label:string; icon?:React.ReactNode } & InputHTMLAttributes<HTMLInputElement>){
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-ink-700">{label}</span>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 opacity-70">{icon}</span>}
        <input {...props} className={`field ${icon ? 'pl-10' : ''}`} />
      </div>
    </label>
  );
}