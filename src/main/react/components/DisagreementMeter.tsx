import { FC, useEffect, useState } from "react";
import { Badge } from "react-bootstrap";
import { Color } from "react-bootstrap/types";
import { VoteSummary } from "../api";

export const DisagreementMeter: FC<{ voteSummary: VoteSummary }> = ({voteSummary}) => {
	const [offsetLabel, setOffsetLabel] = useState<string>("Low");
	const [offsetColor, setOffsetColor] = useState<Color>("success");

	useEffect(() => {
		if (voteSummary.offset > 3) {
			setOffsetLabel("High");
			setOffsetColor("danger");
		} else if (voteSummary.offset > 1) {
			setOffsetLabel("Medium");
			setOffsetColor("warning");
		}
	}, [voteSummary]);

	return (<Badge bg={offsetColor} className="text-uppercase">{offsetLabel}</Badge>);
};