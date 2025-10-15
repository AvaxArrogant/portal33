export type Role = "admin"|"subadmin"|"customer";
export type User = { id:string; email:string; name:string; role:Role };
export type Policy = {
  id:string; number:string; status:"active"|"expired";
  vehicle:{ makeModel:string; year:number; color:string };
  premiumGBP:number; startDate:string; endDate:string;
  specs:{ topSpeedMph:number; powerBhp:number; gearbox:string };
  engine:{ capacityCc:number; cylinders:number; fuelType:string; consumption:string };
  mot:{ expiry:string; taxValidUntil:string };
  covers:string[]; addons:string[]; customerId:string;
};