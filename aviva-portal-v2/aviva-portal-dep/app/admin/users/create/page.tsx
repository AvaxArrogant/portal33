import Container from "@/components/Container";
import { getProfile } from "@/lib/profile";
import { redirect } from "next/navigation";

export default async function CreateUserPage() {
  const me = await getProfile();
  if (!me) redirect("/login");
  if (!["admin","subadmin"].includes(me.role)) redirect("/policies");

  return (
    <Container>
      <h1 className="text-2xl font-extrabold mt-6 mb-4">Create User</h1>
      <form action="/api/admin/create-user" method="post" className="card p-6 space-y-4 max-w-xl">
        <label className="block">
          <div className="hint mb-1">Email</div>
          <input name="email" type="email" required className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">Password</div>
          <input name="password" type="password" required className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">Role</div>
          <select name="role" className="field" defaultValue="customer">
            <option value="customer">Customer</option>
            <option value="subadmin">Sub Admin</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className="block">
          <div className="hint mb-1">Name</div>
          <input name="name" type="text" className="field" required />
        </label>
        <label className="block">
          <div className="hint mb-1">Address</div>
          <input name="address" type="text" className="field" />
        </label>
        <label className="block">
          <div className="hint mb-1">Date of Birth</div>
          <input name="dob" type="date" className="field" />
        </label>
        <button className="btn btn-gold">Create</button>
      </form>
    </Container>
  );
}
