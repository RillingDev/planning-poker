import { FC, useContext } from "react";
import { AppContext } from "../AppContext";
import { Room, VoteExtreme, VoteSummary } from "../model";
import { DisagreementMeter } from "./DisagreementMeter";
import { PokerCard } from "./PokerCard";
import "./Summary.css";

const ExtremeSummaryDetails: FC<{
  className: string;
  label: string;
  voteExtreme: VoteExtreme;
  showDetails: boolean;
}> = ({ className, label, voteExtreme, showDetails }) => {
  return (
    <div className={`summary__extreme ${className}`}>
      <div className="summary__extreme__header">
        <span>{label}:</span>
        {showDetails ? (
          <PokerCard card={voteExtreme.card} disabled={true} size="sm" />
        ) : (
          <span>-/-</span>
        )}
      </div>
      <ul>
        {showDetails &&
            voteExtreme.members.map((member) => (
            <li key={member.username}>{member.username}</li>
          ))}
      </ul>
    </div>
  );
};

export const Summary: FC<{
  room: Room;
  voteSummary: VoteSummary | null;
}> = ({ room, voteSummary }) => {
  const { extensionManager } = useContext(AppContext);

  if (voteSummary == null) {
    return (
      <div className="summary summary--empty">
        <span>No result</span>
      </div>
    );
  }

  const showExtremesDetails =
    voteSummary.highest.card.name !== voteSummary.lowest.card.name;

  return (
    <div className="summary">
      {voteSummary.average != null && (
        <div className="summary__average">
          <span>
            Average: <strong>{voteSummary.average}</strong>
          </span>
          <div className="summary__average__extensions">
            {extensionManager.getByRoom(room).map((extension) => (
              <extension.SubmitComponent
                key={extension.key}
                room={room}
                voteSummary={voteSummary}
              />
            ))}
          </div>
        </div>
      )}
      {voteSummary.nearestCard != null && (
        <div className="summary__nearest">
          <span>Nearest Card:</span>
          <PokerCard card={voteSummary.nearestCard} disabled={true} />
        </div>
      )}
      <ExtremeSummaryDetails
        className="summary__highest"
        label="Highest Vote"
        showDetails={showExtremesDetails}
        voteExtreme={voteSummary.highest}
      />
      <ExtremeSummaryDetails
        className="summary__lowest"
        label="Lowest Vote"
        showDetails={showExtremesDetails}
        voteExtreme={voteSummary.lowest}
      />
      <div className="summary__offset">
        Disagreement: <DisagreementMeter offset={voteSummary.offset} />
      </div>
    </div>
  );
};
