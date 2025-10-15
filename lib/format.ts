
export const gbp = (n:number) => new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(n);
export const prettyDate = (iso:string) => new Date(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"long",year:"numeric"});
export const shortDate = (iso:string) => new Date(iso).toLocaleDateString("en-GB",{day:"2-digit",month:"2-digit",year:"numeric"});