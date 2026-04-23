import { useMemo, useState } from "react";
import { Lab4Header } from "../components/Lab4Header";
import { Lab4Footer } from "../components/Lab4Footer";
import { Lab4Card } from "../components/Lab4Card";
import { Lab4Form } from "../components/Lab4Form";
import { Lab4Button } from "../components/Lab4Button";
import "../styles/lab4.css";

const courseData = [
  { id: 1, title: "React Basics", price: 16000, level: "Бастауыш" },
  { id: 2, title: "React Props & State", price: 19000, level: "Орташа" },
  { id: 3, title: "React Forms", price: 21000, level: "Орташа" },
  { id: 4, title: "React Architecture", price: 26000, level: "Күрделі" },
];

export default function Lab4Page() {
  const [counter, setCounter] = useState(0);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");

  const filteredCourses = useMemo(
    () => courseData.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())),
    [query],
  );

  return (
    <div className="lab4-layout">
      <Lab4Header />
      <main className="lab4-main">
        <section className="lab4-section">
          <h2>Компоненттер және useState</h2>
          <p>Батырма басылған сайын сан өзгереді: {counter}</p>
          <Lab4Button label="Санды көбейту" onClick={() => setCounter((prev) => prev + 1)} />
        </section>

        <section className="lab4-section">
          <h2>Search (алдыңғы JS жобадан)</h2>
          <input
            type="text"
            placeholder="Курс атауын іздеу..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <div className="lab4-grid">
            {filteredCourses.map((course) => (
              <Lab4Card key={course.id} title={course.title} price={course.price} level={course.level} />
            ))}
          </div>
        </section>

        <section className="lab4-section">
          <h2>Form Validation (алдыңғы JS жобадан)</h2>
          <Lab4Form onSuccess={(email) => setMessage(`Сәтті: ${email}`)} />
          {message ? <p className="lab4-success">{message}</p> : null}
        </section>
      </main>
      <Lab4Footer />
    </div>
  );
}
