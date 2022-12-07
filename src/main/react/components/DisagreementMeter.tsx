import { FC } from "react";
import { Badge } from "react-bootstrap";
import { Color } from "react-bootstrap/types";
import { VoteSummary } from "../api";

const getOffsetVisuals = (voteSummary: VoteSummary): { label: string, color: Color } => {
	if (voteSummary.offset > 3) {
		return {
			label: "High",
			color: "danger"
		};
	}
	if (voteSummary.offset > 1) {
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

export const DisagreementMeter: FC<{ voteSummary: VoteSummary }> = ({voteSummary}) => {
	const {label, color} = getOffsetVisuals(voteSummary);

	return (<Badge bg={color} className="text-uppercase">{label}</Badge>);
};