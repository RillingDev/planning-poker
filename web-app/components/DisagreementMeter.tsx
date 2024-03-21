import { FC } from "react";
import { Color } from "react-bootstrap/types";

function getOffsetVisuals(offset: number): { label: string; color: Color } {
  if (offset > 2) {
    return {
      label: "High",
      color: "danger",
    };
  }
  if (offset > 1) {
    return {
      label: "Medium",
      color: "warning",
    };
  }
  if (offset > 0) {
    return {
      label: "Low",
      color: "success",
    };
  }
  return {
    label: "None! 🎉",
    color: "info",
  };
}

export const DisagreementMeter: FC<{ offset: number }> = ({ offset }) => {
  const { label, color } = getOffsetVisuals(offset);

  return <span className={`badge rounded-pill text-bg-${color}`}>{label}</span>;
};
