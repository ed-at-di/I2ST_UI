import { Info } from "lucide-react";

export function InfoNote({ children }) {
  if (!children) return null;
  return (
    <span className="infoTooltip">
      <span className="infoTooltipTrigger" role="button" tabIndex="0" aria-label="More information">
        <Info size={17} />
      </span>
      <span className="infoTooltipContent" role="tooltip">
        <span className="infoTooltipContentIcon" aria-hidden="true"><Info size={17} /></span>
        <span className="infoTooltipText">{children}</span>
      </span>
    </span>
  );
}
