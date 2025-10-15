
import fs from "fs"; import path from "path"; import { Policy, User } from "./types";
const file = path.join(process.cwd(), "data", "db.json");
type DB={ users:User[]; policies:Policy[] };
export function readDB():DB{ return JSON.parse(fs.readFileSync(file,"utf-8")); }
export function writeDB(db:DB){ fs.writeFileSync(file, JSON.stringify(db,null,2)); }
export function findUserByEmail(email:string){ return readDB().users.find(u=>u.email.toLowerCase()===email.toLowerCase()); }
export function listPolicies(){ return readDB().policies; }
export function getPolicy(id:string){ return readDB().policies.find(p=>p.id===id)||null; }
export function getUserPolicies(uid:string){ return readDB().policies.filter(p=>p.customerId===uid); }