// Special tables used for spring security
CREATE TABLE users
(
	username VARCHAR_IGNORECASE(50)  NOT NULL PRIMARY KEY,
	password VARCHAR_IGNORECASE(500) NOT NULL,
	enabled  BOOLEAN                 NOT NULL
);
CREATE TABLE authorities
(
	username  VARCHAR_IGNORECASE(50) NOT NULL,
	authority VARCHAR_IGNORECASE(50) NOT NULL,
	CONSTRAINT fk_authorities_users FOREIGN KEY (username) REFERENCES users (username)
);
CREATE UNIQUE INDEX ix_auth_username ON authorities (username, authority);

// Planning-poker entities

CREATE TABLE card_set
(
	id       UUID               NOT NULL PRIMARY KEY,
	set_name VARCHAR_IGNORECASE NOT NULL UNIQUE
);

CREATE TABLE card
(
	id          UUID               NOT NULL PRIMARY KEY,
	card_set_id UUID               NOT NULL,
	card_name   VARCHAR_IGNORECASE NOT NULL,
	card_value  DOUBLE             NULL, // Optional if it does not affect score
	CONSTRAINT fk_card_card_set_id FOREIGN KEY (card_set_id) REFERENCES card_set (id)
		ON DELETE CASCADE,
	CONSTRAINT uq_card_set_card_name UNIQUE (card_set_id, card_name)
);

CREATE TABLE room
(
	id          UUID               NOT NULL PRIMARY KEY,
	card_set_id UUID               NOT NULL,
	room_name   VARCHAR_IGNORECASE NOT NULL UNIQUE,
	CONSTRAINT fk_room_card_set FOREIGN KEY (card_set_id) REFERENCES card_set (id)
);

CREATE TABLE room_member
(
	id        UUID                       NOT NULL PRIMARY KEY,
	user_role ENUM ('VOTER', 'OBSERVER') NOT NULL,
	room_id   UUID                       NOT NULL,
	username  VARCHAR_IGNORECASE         NOT NULL,
	CONSTRAINT fk_room_member_room FOREIGN KEY (room_id) REFERENCES room (id)
		ON DELETE CASCADE,
	CONSTRAINT fk_room_member_user FOREIGN KEY (username) REFERENCES users (username)
		ON DELETE CASCADE,
	CONSTRAINT uq_room_member UNIQUE (room_id, username)
);

CREATE TABLE vote
(
	id             UUID NOT NULL PRIMARY KEY,
	room_member_id UUID NOT NULL,
	card_id        UUID NOT NULL,
	CONSTRAINT fk_vote_room_member_id FOREIGN KEY (room_member_id) REFERENCES room_member (id)
		ON DELETE CASCADE,
	CONSTRAINT fk_vote_card_id FOREIGN KEY (card_id) REFERENCES card (id)
		ON DELETE CASCADE,
	CONSTRAINT ck_vote_room_member_role CHECK (
		// Enforce that observers do not have votes
			(SELECT ru.user_role
			 FROM room_member ru
			 WHERE ru.id = vote.room_member_id) != 'OBSERVER'
		),
	CONSTRAINT ck_vote_card_set CHECK (
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
);
// Delete votes when a member switches to observer.
CREATE TRIGGER update_room_member_vote_cleanup
	AFTER UPDATE
	ON room_member
	FOR EACH ROW
CALL "com.cryptshare.planningpoker.data.h2.VoteRoleCleanupTrigger";
// Delete votes when a rooms card-set changes.
CREATE TRIGGER update_room_card_set_vote_cleanup
	AFTER UPDATE
	ON room
	FOR EACH ROW
CALL "com.cryptshare.planningpoker.data.h2.VoteCardSetCleanupTrigger";


// Initial data

INSERT INTO CARD_SET (id, set_name)
VALUES ('947dddcf-e093-4726-b070-fce668365edc', 'Adjusted Fibonacci Scale');
INSERT INTO CARD (id, card_set_id, card_name, card_value)
VALUES (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '0', 0.0),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '1', 1.0),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '2', 2.0),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '3', 3.0),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '5', 5.0),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '8', 8.0),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '13', 13.0),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '20', 20.0),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '40', 40.0),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '100', 100.0),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', '?', NULL),
	   (RANDOM_UUID(), '947dddcf-e093-4726-b070-fce668365edc', 'Coffee', 0);

INSERT INTO CARD_SET (id, set_name)
VALUES ('148b39a9-2868-4ae6-ac2f-018347892f48', 'Increments of 10');
INSERT INTO CARD (id, card_set_id, card_name, card_value)
VALUES (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '0', 0.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '10', 10.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '20', 20.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '30', 30.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '40', 40.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '50', 50.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '60', 60.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '70', 70.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '80', 80.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '90', 90.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '100', 100.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '?', NULL),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', 'Coffee', 0);