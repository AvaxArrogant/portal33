
import { redirect } from "next/navigation";
import { session } from "./auth";
import { Role } from "./types";
export function requireAuth(roles?:Role[]){ const s=session(); if(!s) redirect('/login'); if(roles && !roles.includes(s.user.role)) redirect('/policies'); return s.user; }