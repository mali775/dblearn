type Lab4ButtonProps = {
  label: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function Lab4Button({ label, onClick, type = "button" }: Lab4ButtonProps) {
  return (
    <button type={type} onClick={onClick} className="lab4-btn">
      {label}
    </button>
  );
}
