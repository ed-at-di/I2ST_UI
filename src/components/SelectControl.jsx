import { ChevronDown } from "lucide-react";

export function SelectControl({ children, ...selectProps }) {
  return (
    <span className="selectControl">
      <select {...selectProps}>{children}</select>
      <ChevronDown className="selectControlIcon" size={18} aria-hidden="true" />
    </span>
  );
}
