ALTER TABLE vote
	DROP CONSTRAINT ck_vote_card_set;

ALTER TABLE room
	ADD COLUMN voting_state ENUM ('OPEN', 'CLOSED') NOT NULL DEFAULT 'OPEN';

ALTER TABLE vote
	ADD CONSTRAINT ck_vote_card_set CHECK (
		// Enforce that card is from the set that is the configured card set for this room
		(SELECT r.card_set_id
		 FROM room_member ru
				  LEFT JOIN room r ON r.id = ru.room_id
		 WHERE ru.id = vote.room_member_id) = (
			SELECT cs.id
			FROM card c
					 LEFT JOIN card_set cs ON c.card_set_id = cs.id
			WHERE c.id = vote.card_id
			)
		)