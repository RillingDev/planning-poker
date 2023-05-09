import { FC, useContext } from "react";
import { AppContext } from "../AppContext";
import { Card, Room, RoomMember, VoteSummary } from "../model";
import { DisagreementMeter } from "./DisagreementMeter";
import { PokerCard } from "./PokerCard";
import "./Summary.css";

const ExtremeSummaryDetails: FC<{
  className: string;
  label: string;
  vote: Card;
  members: ReadonlyArray<RoomMember>;
  showDetails: boolean;
}> = ({ className, label, vote, members, showDetails }) => {
  return (
    <div className={`summary__extreme ${className}`}>
      <div className="summary__extreme__header">
        <span>{label}:</span>
        {showDetails ? (
          <PokerCard card={vote} disabled={true} size="sm" />
        ) : (
          <span>-/-</span>
        )}
      </div>
      <ul>
        {showDetails &&
          members.map((member) => (
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
    voteSummary.highestVote.name !== voteSummary.lowestVote.name;

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
        vote={voteSummary.highestVote}
        members={voteSummary.highestVoters}
      />
      <ExtremeSummaryDetails
        className="summary__lowest"
        label="Lowest Vote"
        showDetails={showExtremesDetails}
        vote={voteSummary.lowestVote}
        members={voteSummary.lowestVoters}
      />
      <div className="summary__offset">
        Disagreement: <DisagreementMeter offset={voteSummary.offset} />
      </div>
    </div>
  );
};
