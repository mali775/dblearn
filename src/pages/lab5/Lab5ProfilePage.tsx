import { Link } from "react-router-dom";
import { getCurrentUser } from "../../app/lib/auth";

export default function Lab5ProfilePage() {
  const user = getCurrentUser();

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-black text-[#0A2463]">Protected Page</h2>
      <p className="mt-3 text-slate-600">
        Бұл бетке тек авторизациядан өткен қолданушы ғана кіреді.
      </p>
      <div className="mt-5 rounded-2xl bg-slate-100 p-4">
        <p>
          <b>Аты:</b> {user?.fullName}
        </p>
        <p>
          <b>Email:</b> {user?.email}
        </p>
      </div>
      <Link to="/lab5/courses" className="mt-4 inline-flex font-semibold text-[#0A2463]">
        Курстарға өту
      </Link>
    </section>
  );
}
