import { FC, useContext } from "react";
import { AppContext } from "../AppContext";
import { Room, VoteExtreme, VoteSummary } from "../model";
import { DisagreementMeter } from "./DisagreementMeter";
import { PokerCard } from "./PokerCard";
import "./Summary.css";

const VoteExtremeSummary: FC<{
  className: string;
  label: string;
  voteExtreme: VoteExtreme | null;
}> = ({ className, label, voteExtreme }) => {
  return (
    <div className={`summary__extreme ${className}`}>
      <div className="summary__extreme__header">
        <span>{label}:</span>
        {voteExtreme != null ? (
          <PokerCard card={voteExtreme.card} disabled={true} size="sm" />
        ) : (
          <span>-/-</span>
        )}
      </div>
      <ul>
        {voteExtreme != null &&
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
      <VoteExtremeSummary
        className="summary__highest"
        label="Highest Vote"
        voteExtreme={voteSummary.highest}
      />
      <VoteExtremeSummary
        className="summary__lowest"
        label="Lowest Vote"
        voteExtreme={voteSummary.lowest}
      />
      <div className="summary__offset">
        Disagreement: <DisagreementMeter offset={voteSummary.offset} />
      </div>
    </div>
  );
};
