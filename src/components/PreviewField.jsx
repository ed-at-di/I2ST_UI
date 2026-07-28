import { clean } from "../lib/scenarioHelpers.js";

const NBSP = " ";

export function PreviewField({ label, value, multiline = false, boxed = false }) {
  return (
    <div className={`previewField ${multiline ? "multiline" : ""} ${boxed ? "boxed" : ""} ${clean(value) ? "" : "empty"}`}>
      <span>{label}</span>
      <p>{clean(value) ? value : NBSP}</p>
    </div>
  );
}
