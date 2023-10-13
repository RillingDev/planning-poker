// Pause constraints
ALTER TABLE vote
	DROP CONSTRAINT ck_vote_card_set;
ALTER TABLE vote
	DROP CONSTRAINT ck_vote_room_member_role;
ALTER TABLE card_set
	DROP CONSTRAINT ck_relevant_decimal_places;


UPDATE card c
SET c.card_description = ''
WHERE c.card_description IS NULL;
ALTER TABLE card
	ALTER COLUMN card_description CLOB(2048) NOT NULL;

UPDATE room r
SET r.topic = ''
WHERE r.topic IS NULL;
ALTER TABLE room
	ALTER COLUMN topic CLOB(4096) NOT NULL;


// Resume constraints
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
		);
ALTER TABLE vote
	ADD CONSTRAINT ck_vote_room_member_role CHECK (
		// Enforce that observers do not have votes
			(SELECT ru.user_role
			 FROM room_member ru
			 WHERE ru.id = vote.room_member_id) != 'OBSERVER'
		);
ALTER TABLE card_set
	ADD CONSTRAINT ck_relevant_decimal_places CHECK (card_set.relevant_decimal_places >= 0);