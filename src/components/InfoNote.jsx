import { Info } from "lucide-react";

export function InfoNote({ children }) {
  if (!children) return null;
  return (
    <p className="infoNote">
      <Info size={13} />
      <span>{children}</span>
    </p>
  );
}
