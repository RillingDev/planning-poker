CREATE TABLE card_set
(
	id       BIGINT  NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	set_name VARCHAR NOT NULL UNIQUE
);

CREATE TABLE card
(
	id          BIGINT  NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	card_set_id BIGINT  NOT NULL,
	card_name   VARCHAR NOT NULL,
	card_value  DOUBLE  NULL, // Optional if it does not affect score
	CONSTRAINT fk_card_card_set_id FOREIGN KEY (card_set_id) REFERENCES card_set (id)
		ON DELETE CASCADE,
	CONSTRAINT uq_card_set_card_name UNIQUE (card_set_id, card_name)
);

CREATE TABLE room
(
	id          BIGINT  NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	card_set_id BIGINT  NOT NULL,
	room_name   VARCHAR NOT NULL UNIQUE,
	CONSTRAINT fk_room_card_set FOREIGN KEY (card_set_id) REFERENCES card_set (id)
);

CREATE TABLE app_user
(
	id       BIGINT  NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	username VARCHAR NOT NULL UNIQUE
);

CREATE TABLE room_user
(
	id        BIGINT  NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	user_role TINYINT NOT NULL,
	room_id   BIGINT  NOT NULL,
	user_id   BIGINT  NOT NULL,
	CONSTRAINT fk_room_user_room FOREIGN KEY (room_id) REFERENCES room (id)
		ON DELETE CASCADE,
	CONSTRAINT fk_room_user_user FOREIGN KEY (user_id) REFERENCES app_user (id)
		ON DELETE CASCADE,
	CONSTRAINT uq_room_user UNIQUE (room_id, user_id)
);



CREATE TABLE vote
(
	id           BIGINT NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	room_user_id BIGINT NOT NULL,
	card_id      BIGINT NOT NULL,
	CONSTRAINT fk_vote_room_user_id FOREIGN KEY (room_user_id) REFERENCES room_user (id)
		ON DELETE CASCADE,
	CONSTRAINT fk_vote_card_id FOREIGN KEY (card_id) REFERENCES card (id)
		ON DELETE CASCADE,
	CONSTRAINT fk_vote_card_set CHECK (
		// Enforce that card is from the set that is the configured card set for this room
			(SELECT r.card_set_id
			 FROM room_user ru
					  LEFT JOIN room r ON r.id = ru.room_id
			 WHERE ru.id = vote.room_user_id) = (
				SELECT cs.id
				FROM card c
						 LEFT JOIN card_set cs ON c.card_set_id = cs.id
				WHERE c.id = vote.card_id
				)
		)
);