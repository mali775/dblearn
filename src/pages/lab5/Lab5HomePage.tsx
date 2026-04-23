export default function Lab5HomePage() {
  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-3xl font-black text-[#0A2463]">SPA қолданбасы</h2>
      <p className="mt-4 text-slate-600">
        Бұл бөлім React Router талаптарын көрсету үшін жасалған: маршруттар, layout, active
        navigation, динамикалық бет, protected route, breadcrumbs және 404.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-sm text-slate-500">Міндетті маршруттар</p>
          <p className="mt-1 font-bold">/ , /courses , /login , /register</p>
        </div>
        <div className="rounded-2xl bg-slate-100 p-4">
          <p className="text-sm text-slate-500">Қосымша</p>
          <p className="mt-1 font-bold">Params, Protected, 404, Loader</p>
        </div>
      </div>
    </section>
  );
}
