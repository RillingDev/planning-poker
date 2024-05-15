// Schema

// Not mapped to JPA
CREATE TABLE app_user
(
	username VARCHAR_IGNORECASE(50) NOT NULL PRIMARY KEY
);

CREATE TABLE card_set
(
	id       UUID                   NOT NULL PRIMARY KEY,
	set_name VARCHAR_IGNORECASE(50) NOT NULL UNIQUE
);

CREATE TABLE card
(
	id          UUID                   NOT NULL PRIMARY KEY,
	card_set_id UUID                   NOT NULL,
	card_name   VARCHAR_IGNORECASE(50) NOT NULL,
	card_value  DOUBLE                 NULL, // Optional if it does not affect score
	CONSTRAINT fk_card_card_set_id FOREIGN KEY (card_set_id) REFERENCES card_set (id)
		ON DELETE CASCADE,
	CONSTRAINT uq_card_set_card_name UNIQUE (card_set_id, card_name)
);

CREATE TABLE room
(
	id          UUID                   NOT NULL PRIMARY KEY,
	card_set_id UUID                   NOT NULL,
	room_name   VARCHAR_IGNORECASE(50) NOT NULL UNIQUE,
	topic       TEXT                   NULL,
	CONSTRAINT fk_room_card_set FOREIGN KEY (card_set_id) REFERENCES card_set (id)
);

CREATE TABLE room_member
(
	id        UUID                       NOT NULL PRIMARY KEY,
	user_role ENUM ('VOTER', 'OBSERVER') NOT NULL,
	room_id   UUID                       NOT NULL,
	username  VARCHAR_IGNORECASE(50)     NOT NULL,
	CONSTRAINT fk_room_member_room FOREIGN KEY (room_id) REFERENCES room (id)
		ON DELETE CASCADE,
	CONSTRAINT fk_room_member_user FOREIGN KEY (username) REFERENCES app_user (username)
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


/////////////////////////////////////////////////////////////////////


// Data

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
VALUES ('148b39a9-2868-4ae6-ac2f-018347892f48', '1 through 10');
INSERT INTO CARD (id, card_set_id, card_name, card_value)
VALUES (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '1', 1.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '2', 2.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '3', 3.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '4', 4.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '5', 5.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '6', 6.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '7', 7.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '8', 8.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '9', 9.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '10', 10.0),
	   (RANDOM_UUID(), '148b39a9-2868-4ae6-ac2f-018347892f48', '?', NULL);

INSERT INTO CARD_SET (id, set_name)
VALUES ('149b39a9-2868-4ae6-ac2f-018347892f49', 'T-Shirt Sizes');
INSERT INTO CARD (id, card_set_id, card_name, card_value)
VALUES (RANDOM_UUID(), '149b39a9-2868-4ae6-ac2f-018347892f49', 'XS', 0.0),
	   (RANDOM_UUID(), '149b39a9-2868-4ae6-ac2f-018347892f49', 'S', 1.0),
	   (RANDOM_UUID(), '149b39a9-2868-4ae6-ac2f-018347892f49', 'M', 2.0),
	   (RANDOM_UUID(), '149b39a9-2868-4ae6-ac2f-018347892f49', 'L', 3.0),
	   (RANDOM_UUID(), '149b39a9-2868-4ae6-ac2f-018347892f49', 'XL', 4.0),
	   (RANDOM_UUID(), '149b39a9-2868-4ae6-ac2f-018347892f49', 'XXL', 5.0),
	   (RANDOM_UUID(), '149b39a9-2868-4ae6-ac2f-018347892f49', '?', NULL);
