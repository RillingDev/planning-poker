CREATE TABLE room_extension_config_attribute
(
	id                       LONG    NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	room_extension_config_id UUID    NOT NULL REFERENCES room_extension_config (id) ON DELETE CASCADE,
	attribute_key            VARCHAR NOT NULL,
	attribute_value          VARCHAR NOT NULL,
	CONSTRAINT uq_key UNIQUE (room_extension_config_id, attribute_key)
);



ALTER TABLE vote
	DROP CONSTRAINT ck_vote_card_set;
ALTER TABLE card_set
	DROP CONSTRAINT ck_relevant_fraction_digits;

// Remove defaults
ALTER TABLE card
	ALTER COLUMN card_description TEXT(500) NULL;
ALTER TABLE card_set
	ALTER COLUMN relevant_fraction_digits INTEGER NOT NULL;
ALTER TABLE room
	ALTER COLUMN voting_state ENUM ('OPEN', 'CLOSED') NOT NULL;


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
ALTER TABLE card_set
	ADD CONSTRAINT ck_relevant_fraction_digits CHECK (CARD_SET.relevant_fraction_digits >= 0);