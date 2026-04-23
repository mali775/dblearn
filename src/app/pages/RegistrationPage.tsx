import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Eye, EyeOff, Lock, Mail, Phone, User } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useToast } from "../components/ToastProvider";
import {
  clearRegistrationDraft,
  getPlacementResult,
  getRegistrationDraft,
  saveRegistrationDraft,
} from "../lib/storage";
import { getCurrentUser, isAdmin, registerUser } from "../lib/auth";

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

const initialForm = getRegistrationDraft() as FormState;

function validateField(name: keyof FormState, value: string) {
  const trimmedValue = value.trim();

  switch (name) {
    case "fullName":
      return trimmedValue ? "" : "Аты-жөні бос болмауы керек.";
    case "phone":
      return /^\d{11}$/.test(trimmedValue)
        ? ""
        : "Телефон тек саннан тұрып, 11 цифр болуы керек.";
    case "email":
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)
        ? ""
        : "Email форматы дұрыс емес.";
    case "password":
      return /^(?=.*\d).{6,}$/.test(value)
        ? ""
        : "Құпия сөз кемінде 6 таңба және 1 саннан тұруы керек.";
    default:
      return "";
  }
}

export default function RegistrationPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    const placementResult = getPlacementResult();

    if (currentUser) {
      navigate(isAdmin(currentUser) ? "/admin" : placementResult ? "/courses" : "/quiz", {
        replace: true,
      });
    }
  }, [navigate]);

  useEffect(() => {
    saveRegistrationDraft(formData);
  }, [formData]);

  const progress = useMemo(() => (step === 1 ? 50 : 100), [step]);

  const handleChange = (name: keyof FormState, value: string) => {
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: validateField(name, value),
    }));
  };

  const validateStep = (fields: Array<keyof FormState>) => {
    const nextErrors = fields.reduce<FormErrors>((acc, field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        acc[field] = error;
      }
      return acc;
    }, {});

    setErrors((current) => ({ ...current, ...nextErrors }));
    return Object.keys(nextErrors).length === 0;
  };

  const handleNextStep = () => {
    if (!validateStep(["fullName", "phone"])) {
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);

    if (!validateStep(["email", "password"])) {
      return;
    }

    try {
      await registerUser(formData);
      clearRegistrationDraft();
      showToast("Сәтті тіркелдіңіз.", "success");
      navigate("/quiz");
    } catch (submitError) {
      showToast(
        submitError instanceof Error ? submitError.message : "Тіркелу кезінде қате пайда болды.",
        "error",
      );
    }
  };

  const inputClass = (name: keyof FormState) =>
    `w-full rounded-2xl border px-4 py-3 pl-11 pr-12 outline-none transition-colors ${
      errors[name]
        ? "border-rose-400 bg-rose-50 text-rose-900"
        : "border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-950"
    }`;

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="flex items-center justify-center bg-[linear-gradient(145deg,#061a40_0%,#0a2463_45%,#143f91_100%)] p-8 lg:w-1/2 lg:p-16">
        <div className="max-w-lg text-white">
          <Link to="/" className="text-3xl font-black">DB.Learn</Link>
          <h1 className="mt-8 text-4xl font-black leading-tight">
            Multi-step тіркелу формасы және толық validation
          </h1>
          <p className="mt-5 text-lg text-sky-100">
            Бұл форма localStorage draft сақтайды, қате өрістерді қызылмен көрсетеді және тіркелген соң курс ұсынысына өткізеді.
          </p>
          <div className="mt-8 overflow-hidden rounded-[2rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080"
              alt="Registration visual"
              className="h-72 w-full rounded-[1.5rem] object-cover"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-slate-50 p-8 dark:bg-slate-950 lg:w-1/2 lg:p-16">
        <div className="w-full max-w-xl rounded-[2rem] bg-white p-8 shadow-xl dark:bg-slate-900">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              2 қадамды форма
            </p>
            <h2 className="mt-3 text-3xl font-black text-[#0A2463] dark:text-sky-200">Тіркелгі жасау</h2>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-sm text-slate-500 dark:text-slate-400">
                <span>Форма прогресі</span>
                <span>{progress}%</span>
              </div>
              <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-3 rounded-full bg-[#0A2463] transition-all dark:bg-sky-400" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {step === 1 ? (
              <>
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-semibold">
                    Толық аты-жөні
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(event) => handleChange("fullName", event.target.value)}
                      placeholder="Аты-жөніңізді енгізіңіз"
                      className={inputClass("fullName")}
                    />
                  </div>
                  {errors.fullName ? <p className="mt-2 text-sm text-rose-600">{errors.fullName}</p> : null}
                </div>

                <div>
                  <label htmlFor="phone" className="mb-2 block text-sm font-semibold">
                    Телефон
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(event) =>
                        handleChange("phone", event.target.value.replace(/[^\d]/g, "").slice(0, 11))
                      }
                      placeholder="87001234567"
                      className={inputClass("phone")}
                    />
                  </div>
                  {errors.phone ? <p className="mt-2 text-sm text-rose-600">{errors.phone}</p> : null}
                </div>

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0A2463] px-6 py-3 font-semibold text-white"
                >
                  Келесі қадам
                  <ArrowRight className="h-5 w-5" />
                </button>
              </>
            ) : (
              <>
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
                      onChange={(event) => handleChange("email", event.target.value)}
                      placeholder="student@example.com"
                      className={inputClass("email")}
                    />
                  </div>
                  {errors.email ? <p className="mt-2 text-sm text-rose-600">{errors.email}</p> : null}
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
                      onChange={(event) => handleChange("password", event.target.value)}
                      placeholder="Кемінде 6 таңба және 1 сан"
                      className={inputClass("password")}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password ? <p className="mt-2 text-sm text-rose-600">{errors.password}</p> : null}
                </div>

                {submitted && Object.values(errors).some(Boolean) ? (
                  <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    Форманы дұрыс толтырыңыз.
                  </p>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-300 px-6 py-3 font-semibold dark:border-slate-700"
                  >
                    <ArrowLeft className="h-5 w-5" />
                    Алдыңғы қадам
                  </button>
                  <button
                    type="submit"
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0A2463] px-6 py-3 font-semibold text-white"
                  >
                    Тіркелу
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>
              </>
            )}
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-300">
            Тіркелгіңіз бар ма?{" "}
            <Link to="/login" className="font-semibold text-[#0A2463] dark:text-sky-300">
              Кіру
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
