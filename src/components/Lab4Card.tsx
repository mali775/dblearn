type CourseCardProps = {
  title: string;
  price: number;
  level: string;
};

export function Lab4Card({ title, price, level }: CourseCardProps) {
  return (
    <article className="lab4-card">
      <span className="lab4-tag">{level}</span>
      <h3>{title}</h3>
      <p>{price.toLocaleString("kk-KZ")} ₸</p>
    </article>
  );
}
