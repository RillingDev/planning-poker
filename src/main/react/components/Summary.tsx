import { FC, useContext } from "react";
import { Room, VoteSummary } from "../api";
import { AppContext } from "../AppContext";
import { DisagreementMeter } from "./DisagreementMeter";
import { PokerCard } from "./PokerCard";
import "./Summary.css";

const formatter = new Intl.NumberFormat("en-US", {style: "decimal", maximumFractionDigits: 2});


export const Summary: FC<{
	room: Room,
	voteSummary: VoteSummary
}> = ({room, voteSummary}) => {
	const {extensions} = useContext(AppContext);

	return (
		<div className="summary">
			<div className="summary__average">
				<span>Average: <strong>{formatter.format(voteSummary.average)}</strong></span>
				<div className="summary__average__extensions">{extensions.map(extension =>
					<extension.SubmitComponent key={extension.id} room={room} voteSummary={voteSummary}/>)}</div>
			</div>
			<div className="summary__nearest">
				<span>Nearest Card:</span>
				<PokerCard card={voteSummary.nearestCard} disabled={true}/>
			</div>
			<div className="summary__highest summary__extreme">
				<div className="summary__extreme__header">
					<span>Highest Vote:</span>
					<PokerCard card={voteSummary.highestVote} disabled={true} size="sm"/>
				</div>
				<ul>
					{voteSummary.highestVoters.map(member => <li key={member.username}>{member.username}</li>)}
				</ul>
			</div>
			<div className="summary__lowest summary__extreme">
				<div className="summary__extreme__header">
					<span>Lowest Vote:</span>
					<PokerCard card={voteSummary.lowestVote} disabled={true} size="sm"/>
				</div>
				<ul>
					{voteSummary.lowestVoters.map(member => <li key={member.username}>{member.username}</li>)}
				</ul>
			</div>
			<div className="summary__offset">Disagreement: <DisagreementMeter offset={voteSummary.offset}/></div>
		</div>
	);
};
