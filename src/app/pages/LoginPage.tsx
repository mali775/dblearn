import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useToast } from "../components/ToastProvider";
import { getCurrentUser, isAdmin, loginUser } from "../lib/auth";
import { getPlacementResult } from "../lib/storage";

export default function LoginPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const currentUser = getCurrentUser();
    const placementResult = getPlacementResult();

    if (currentUser) {
      navigate(isAdmin(currentUser) ? "/admin" : placementResult ? "/courses" : "/quiz", {
        replace: true,
      });
    }
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      const user = await loginUser(formData.email, formData.password);
      showToast(`${user.fullName}, жүйеге сәтті кірдіңіз.`, "success");
      navigate(isAdmin(user) ? "/admin" : getPlacementResult() ? "/courses" : "/quiz");
    } catch (submitError) {
      showToast(
        submitError instanceof Error ? submitError.message : "Кіру кезінде қате пайда болды.",
        "error",
      );
    }
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex items-center justify-center bg-[linear-gradient(145deg,#061a40_0%,#0a2463_45%,#143f91_100%)] p-8 lg:w-1/2 lg:p-16">
        <div className="max-w-lg text-white">
          <Link to="/" className="text-3xl font-black">DB.Learn</Link>
          <h1 className="mt-8 text-4xl font-black">Жүйеге кіру</h1>
          <p className="mt-5 text-lg text-sky-100">
            Кіруден кейін курстардағы прогресс, favorite және тест нәтижесі сол күйі көрінеді.
          </p>
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Login visual"
              className="h-72 w-full rounded-[1.5rem] object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-slate-50 p-8 dark:bg-slate-950 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-xl dark:bg-slate-900">
          <h2 className="text-3xl font-black text-[#0A2463] dark:text-sky-200">Аккаунтқа кіру</h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            Admin кіруі үшін: `admin@dblearn.kz` / `Admin123!`
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pl-11 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="student@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-semibold">
                Құпия сөз
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 pl-11 pr-12 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Құпия сөзіңіз"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0A2463] px-6 py-3 font-semibold text-white"
            >
              Кіру
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Тіркелгіңіз жоқ па?{" "}
            <Link to="/register" className="font-semibold text-[#0A2463] dark:text-sky-300">
              Тіркелу
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
