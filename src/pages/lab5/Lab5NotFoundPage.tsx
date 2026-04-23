import { Link } from "react-router-dom";

export default function Lab5NotFoundPage() {
  return (
    <section className="rounded-3xl bg-white p-8 text-center shadow-sm">
      <p className="text-sm font-semibold text-slate-500">404</p>
      <h2 className="mt-2 text-3xl font-black text-[#0A2463]">Бет табылмады</h2>
      <p className="mt-3 text-slate-600">URL қате немесе бет жойылған.</p>
      <Link to="/lab5" className="mt-5 inline-flex rounded-full bg-[#0A2463] px-5 py-3 font-semibold text-white">
        Home-қа қайту
      </Link>
    </section>
  );
}
