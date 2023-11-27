import { FC, useContext } from "react";
import { AppContext } from "../AppContext";
import { Room, VoteExtreme, VoteSummary } from "../model";
import { DisagreementMeter } from "./DisagreementMeter";
import { PokerCard } from "./PokerCard";
import "./VoteSummaryDetails.css";
import { getActiveExtensionsByRoom } from "../extension/extensions.ts";

const VoteExtremeDetails: FC<{
  label: string;
  voteExtreme: VoteExtreme | null;
}> = ({ label, voteExtreme }) => {
  return (
    <div className="summary__extreme">
      <div className="d-flex align-items-center gap-2">
        <span>{label}:</span>
        {voteExtreme != null ? (
          <PokerCard card={voteExtreme.card} disabled={true} size="sm" />
        ) : (
          <span>-/-</span>
        )}
      </div>
      <ul className="small ps-4 mb-0">
        {voteExtreme?.members.map((member) => (
          <li key={member.username}>{member.username}</li>
        ))}
      </ul>
    </div>
  );
};

export const VoteSummaryDetails: FC<{
  room: Room;
  voteSummary: VoteSummary | null;
}> = ({ room, voteSummary }) => {
  const { enabledExtensions } = useContext(AppContext);

  if (voteSummary == null) {
    return (
      <div className="summary summary--empty">
        <span>No result</span>
      </div>
    );
  }

  return (
    <div className="summary">
      {voteSummary.average != null && (
        <div className="summary__average d-flex flex-column align-items-center justify-content-center gap-1">
          <span>
            Average: <strong>{voteSummary.average}</strong>
          </span>
          <div>
            {getActiveExtensionsByRoom(enabledExtensions, room).map(
              (extension) => (
                <extension.SubmitComponent
                  key={extension.key}
                  room={room}
                  voteSummary={voteSummary}
                />
              ),
            )}
          </div>
        </div>
      )}
      {voteSummary.nearestCard != null && (
        <div className="summary__nearest d-flex justify-content-center flex-column align-items-center gap-1">
          <span>Nearest Card:</span>
          <PokerCard card={voteSummary.nearestCard} disabled={true} />
        </div>
      )}
      <div className="summary__highest" data-testid="summary-highest">
        <VoteExtremeDetails
          label="Highest Vote"
          voteExtreme={voteSummary.highest}
        />
      </div>
      <div className="summary__lowest" data-testid="summary-lowest">
        <VoteExtremeDetails
          label="Lowest Vote"
          voteExtreme={voteSummary.lowest}
        />
      </div>
      <div className="summary__offset">
        Disagreement: <DisagreementMeter offset={voteSummary.offset} />
      </div>
    </div>
  );
};
