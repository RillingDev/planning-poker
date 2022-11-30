import { FC } from "react";
import { VoteSummary } from "../api";

export const Summary: FC<{ voteSummary: VoteSummary }> = ({voteSummary}) => {
	return (
		<div>
			<div>Average: {voteSummary.average}</div>
			<div>Variance: {voteSummary.variance}</div>
			<div><span>Nearest Card:</span>
				<div className="poker-card">{voteSummary.average}</div>
			</div>
			<div>
				<span>Highest Vote:</span>
				<div className="poker-card">{voteSummary.highestVote.name}</div>
				<ul>
					{voteSummary.highestVoters.map(member => <li key={member.username}>{member.username}</li>)}
				</ul>
			</div>
			<div>
				<span>Lowest Vote:</span>
				<div className="poker-card">{voteSummary.lowestVote.name}</div>
				<ul>
					{voteSummary.lowestVoters.map(member => <li key={member.username}>{member.username}</li>)}
				</ul>
			</div>
		</div>
	);
};
