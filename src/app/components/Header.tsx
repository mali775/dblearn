import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, SunMedium } from "lucide-react";
import {
  getCurrentUser,
  isAdmin,
  logoutUser,
  subscribeToAuthChanges,
  type SessionUser,
} from "../lib/auth";
import {
  applyTheme,
  getPlacementResult,
  getStoredTheme,
  setStoredTheme,
  subscribeToStorageChanges,
} from "../lib/storage";

export function Header() {
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(getCurrentUser());
  const [theme, setTheme] = useState(getStoredTheme());
  const [placementResult, setPlacementResult] = useState(getPlacementResult());

  useEffect(() => {
    return subscribeToAuthChanges(() => {
      setCurrentUser(getCurrentUser());
    });
  }, []);

  useEffect(() => {
    return subscribeToStorageChanges(() => {
      setTheme(getStoredTheme());
      setPlacementResult(getPlacementResult());
    });
  }, []);

  const isActive = (path: string) => location.pathname === path;

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    setStoredTheme(nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-2xl font-black tracking-tight text-[#0A2463] dark:text-sky-200">
            DB.Learn
          </Link>
          {placementResult ? (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
              Деңгей: {placementResult.level}
            </span>
          ) : (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              Алдымен тест өтіңіз
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-5 text-sm font-medium">
          <Link
            to="/"
            className={isActive("/") ? "text-[#0A2463] dark:text-sky-300" : "text-slate-600 hover:text-[#0A2463] dark:text-slate-300"}
          >
            Басты бет
          </Link>
          <Link
            to="/quiz"
            className={isActive("/quiz") ? "text-[#0A2463] dark:text-sky-300" : "text-slate-600 hover:text-[#0A2463] dark:text-slate-300"}
          >
            Деңгей тесті
          </Link>
          <Link
            to="/courses"
            className={isActive("/courses") ? "text-[#0A2463] dark:text-sky-300" : "text-slate-600 hover:text-[#0A2463] dark:text-slate-300"}
          >
            Курстар
          </Link>
          <Link
            to="/progress"
            className={isActive("/progress") ? "text-[#0A2463] dark:text-sky-300" : "text-slate-600 hover:text-[#0A2463] dark:text-slate-300"}
          >
            Прогресс
          </Link>
          <Link
            to="/lab6"
            className={isActive("/lab6") ? "text-[#0A2463] dark:text-sky-300" : "text-slate-600 hover:text-[#0A2463] dark:text-slate-300"}
          >
            Lab 6
          </Link>
          {isAdmin(currentUser) ? (
            <Link
              to="/admin"
              className={isActive("/admin") ? "text-[#0A2463] dark:text-sky-300" : "text-slate-600 hover:text-[#0A2463] dark:text-slate-300"}
            >
              Админ
            </Link>
          ) : null}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 text-slate-700 transition-colors hover:border-[#0A2463] hover:text-[#0A2463] dark:border-slate-700 dark:text-slate-200"
            aria-label="Тақырыпты ауыстыру"
          >
            {theme === "light" ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
          </button>
          {currentUser ? (
            <>
              <span className="rounded-full bg-slate-100 px-3 py-2 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                {currentUser.fullName}
              </span>
              <button
                type="button"
                onClick={logoutUser}
                className="text-slate-600 hover:text-[#0A2463] dark:text-slate-300"
              >
                Шығу
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={isActive("/login") ? "text-[#0A2463] dark:text-sky-300" : "text-slate-600 hover:text-[#0A2463] dark:text-slate-300"}
              >
                Кіру
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-[#0A2463] px-4 py-2 text-white transition-colors hover:bg-[#091d4d]"
              >
                Тіркелу
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
