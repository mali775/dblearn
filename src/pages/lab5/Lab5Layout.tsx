import { NavLink, Outlet, useLocation } from "react-router-dom";

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = [{ label: "Home", to: "/lab5" }];
  if (segments.length <= 1) {
    return crumbs;
  }

  let pathAcc = "";
  segments.slice(1).forEach((segment) => {
    pathAcc += `/${segment}`;
    crumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      to: `/lab5${pathAcc}`,
    });
  });
  return crumbs;
}

export default function Lab5Layout() {
  const location = useLocation();
  const breadcrumbs = buildBreadcrumbs(location.pathname);

  const navClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
      isActive ? "bg-[#0A2463] text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
    }`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <h1 className="text-2xl font-black text-[#0A2463]">Lab 5 • React Router</h1>
          <nav className="flex flex-wrap gap-2">
            <NavLink to="/lab5" end className={navClass}>
              Home
            </NavLink>
            <NavLink to="/lab5/courses" className={navClass}>
              Courses
            </NavLink>
            <NavLink to="/lab5/login" className={navClass}>
              Login
            </NavLink>
            <NavLink to="/lab5/register" className={navClass}>
              Register
            </NavLink>
            <NavLink to="/lab5/profile" className={navClass}>
              Protected
            </NavLink>
          </nav>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.to} className="inline-flex items-center gap-2">
              <NavLink to={crumb.to} className="hover:text-[#0A2463]">
                {crumb.label}
              </NavLink>
              {index < breadcrumbs.length - 1 ? <span>/</span> : null}
            </span>
          ))}
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-10 sm:px-6">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-sm text-slate-500 sm:px-6">
          DB.Learn • Лабораториялық жұмыс №5
        </div>
      </footer>
    </div>
  );
}
