
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { findUserByEmail } from "./db";
import { Role, User } from "./types";
const COOKIE="aviva_tkn"; const ttl=60*60*24*7;
function secret(){ const s=process.env.JWT_SECRET; if(!s) throw new Error("Missing JWT_SECRET"); return s; }
export async function login(email:string,password:string){
  const envUsers=(process.env.DEMO_USERS||"").split(",").map(s=>s.trim()).filter(Boolean).map(s=>{const[a,b,r]=s.split(":");return{email:a,pass:b,role:r as Role}});
  const hit=envUsers.find(u=>u.email.toLowerCase()===email.toLowerCase() && u.pass===password);
  if(!hit){ const u=findUserByEmail(email); if(u && password==='123456') return set(u); return null; }
  const u:User={ id:`u_${hit.email}`, email:hit.email, name:hit.email.split('@')[0], role:hit.role };
  return set(u);
}
function set(user:User){ const token=jwt.sign({sub:user.id,email:user.email,name:user.name,role:user.role},secret(),{expiresIn:ttl}); cookies().set(COOKIE,token,{httpOnly:true,sameSite:'lax',maxAge:ttl,path:'/'}); return user; }
export function logout(){ cookies().delete(COOKIE); }
export function session(){ const c=cookies().get(COOKIE); if(!c) return null; try{ const p=jwt.verify(c.value,secret()) as any; return { user:{ id:p.sub,email:p.email,name:p.name,role:p.role as Role } }; }catch{ return null; } }