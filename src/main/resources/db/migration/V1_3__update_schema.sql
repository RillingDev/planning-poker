ALTER TABLE vote
	DROP CONSTRAINT ck_vote_card_set;


ALTER TABLE card_set
	ADD COLUMN relevant_fraction_digits INTEGER NOT NULL DEFAULT 1;
ALTER TABLE card_set
	ADD CONSTRAINT ck_relevant_fraction_digits CHECK (CARD_SET.relevant_fraction_digits >= 0);


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


CREATE TABLE extension
(
	id                UUID                      NOT NULL PRIMARY KEY,
	extension_key     VARCHAR_IGNORECASE UNIQUE NOT NULL,
	extension_enabled BOOLEAN                   NOT NULL
);

CREATE TABLE room_extension_config
(
	id           UUID NOT NULL PRIMARY KEY,
	room_id      UUID NOT NULL REFERENCES room (id) ON DELETE CASCADE,
	extension_id UUID NOT NULL REFERENCES extension (id) ON DELETE CASCADE,
	CONSTRAINT uq_room_extension_config UNIQUE (room_id, extension_id)
);

INSERT INTO extension
VALUES (RANDOM_UUID(), 'aha', TRUE);