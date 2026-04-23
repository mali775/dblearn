import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../app/lib/auth";

export default function Lab5RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await registerUser({ fullName, phone, email, password });
      navigate("/lab5/profile", { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Қате");
    }
  };

  return (
    <section className="rounded-3xl bg-white p-8 shadow-sm">
      <h2 className="text-2xl font-black text-[#0A2463]">Register Page</h2>
      <form onSubmit={handleSubmit} className="mt-5 max-w-md space-y-3">
        <input
          type="text"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Аты-жөні"
          required
        />
        <input
          type="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value.replace(/[^\d]/g, "").slice(0, 11))}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="87001234567"
          required
        />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="student@example.com"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full rounded-xl border border-slate-300 px-4 py-3"
          placeholder="Құпия сөз"
          required
        />
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <button type="submit" className="rounded-full bg-[#0A2463] px-5 py-3 font-semibold text-white">
          Тіркелу
        </button>
      </form>
    </section>
  );
}
