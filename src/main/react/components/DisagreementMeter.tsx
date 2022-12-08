import { FC } from "react";
import { Badge } from "react-bootstrap";
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
	return {
		label: "Low",
		color: "success"
	};
};

export const DisagreementMeter: FC<{ offset: number }> = ({offset}) => {
	const {label, color} = getOffsetVisuals(offset);

	return (<Badge bg={color} className="text-uppercase">{label}</Badge>);
};