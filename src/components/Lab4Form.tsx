import { useState } from "react";
import { Lab4Button } from "./Lab4Button";

type Lab4FormProps = {
  onSuccess: (email: string) => void;
};

export function Lab4Form({ onSuccess }: Lab4FormProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!isValidEmail) {
      setError("Email форматы дұрыс емес");
      return;
    }

    setError("");
    onSuccess(trimmedEmail);
  };

  return (
    <form onSubmit={handleSubmit} className="lab4-form">
      <label htmlFor="lab4-email">Email</label>
      <input
        id="lab4-email"
        type="email"
        className={error ? "lab4-invalid" : ""}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="student@example.com"
      />
      {error ? <small>{error}</small> : null}
      <Lab4Button type="submit" label="Тексеру" />
    </form>
  );
}
