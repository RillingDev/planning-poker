import { FC } from "react";
import { Color } from "react-bootstrap/types";

const getOffsetVisuals = (offset: number): { label: string, color: Color } => {
	if (offset > 3) {
		return {
			label: "High",
			color: "danger"
		};
	}
	if (offset > 1) {
		return {
			label: "Medium",
			color: "warning"
		};
	}
	if (offset > 0) {
		return {
			label: "Low",
			color: "success"
		};
	}
	return {
		label: "None! 🎉",
		color: "info"
	};
};

export const DisagreementMeter: FC<{ offset: number }> = ({offset}) => {
	const {label, color} = getOffsetVisuals(offset);

	return (<span className={`text-uppercase badge bg-${color}`}>{label}</span>);
};