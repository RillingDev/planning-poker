/*
 * Spring Security schema
 */
CREATE TABLE oauth2_authorized_client
(
	client_registration_id  VARCHAR(100)                            NOT NULL,
	principal_name          VARCHAR(200)                            NOT NULL,
	access_token_type       VARCHAR(100)                            NOT NULL,
	access_token_value      BLOB                                    NOT NULL,
	access_token_issued_at  TIMESTAMP                               NOT NULL,
	access_token_expires_at TIMESTAMP                               NOT NULL,
	access_token_scopes     VARCHAR(1000) DEFAULT NULL,
	refresh_token_value     BLOB          DEFAULT NULL,
	refresh_token_issued_at TIMESTAMP     DEFAULT NULL,
	created_at              TIMESTAMP     DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY (client_registration_id, principal_name)
);

/* Stricter than the default schema, as we require unique usernames across different providers.*/
ALTER TABLE oauth2_authorized_client
	ADD CONSTRAINT uq_principal_name UNIQUE (principal_name);

/*
 * Application schema
 */
CREATE TABLE card_set
(
	id                      UUID         NOT NULL PRIMARY KEY,
	set_name                VARCHAR(100) NOT NULL UNIQUE,
	relevant_decimal_places INTEGER      NOT NULL,
	show_average_value      BOOLEAN      NOT NULL,
	show_nearest_card       BOOLEAN      NOT NULL,
	CONSTRAINT ck_relevant_decimal_places CHECK (relevant_decimal_places >= 0)
);

CREATE TABLE card
(
	id               UUID         NOT NULL PRIMARY KEY,
	card_set_id      UUID         NOT NULL REFERENCES card_set ON DELETE CASCADE,
	card_name        VARCHAR(100) NOT NULL,
	card_value       DOUBLE PRECISION,
	card_description CLOB(2000)   NOT NULL,
	CONSTRAINT uq_card_set_card_name
		UNIQUE (card_set_id, card_name)
);

CREATE TABLE extension
(
	id                UUID         NOT NULL PRIMARY KEY,
	extension_key     VARCHAR(100) NOT NULL UNIQUE,
	extension_enabled BOOLEAN      NOT NULL
);

CREATE TABLE room
(
	id           UUID                    NOT NULL PRIMARY KEY,
	card_set_id  UUID                    NOT NULL REFERENCES card_set,
	room_name    VARCHAR(250)            NOT NULL UNIQUE,
	topic        CLOB(5000)              NOT NULL,
	voting_state ENUM ('OPEN', 'CLOSED') NOT NULL
);

CREATE TABLE room_extension_config
(
	id           UUID NOT NULL PRIMARY KEY,
	room_id      UUID NOT NULL REFERENCES room ON DELETE CASCADE,
	extension_id UUID NOT NULL REFERENCES extension ON DELETE CASCADE,
	CONSTRAINT uq_room_extension_config
		UNIQUE (room_id, extension_id)
);

CREATE TABLE room_extension_config_attribute
(
	room_extension_config_id UUID         NOT NULL REFERENCES room_extension_config ON DELETE CASCADE,
	attribute_key            VARCHAR(100) NOT NULL,
	attribute_value          VARCHAR      NOT NULL,
	PRIMARY KEY (room_extension_config_id, attribute_key)
);

CREATE TABLE room_member
(
	-- TODO: replace?
	id        UUID                       NOT NULL PRIMARY KEY,
	room_id   UUID                       NOT NULL REFERENCES room ON DELETE CASCADE,
	username  VARCHAR(250)               NOT NULL REFERENCES oauth2_authorized_client (principal_name) ON DELETE CASCADE,
	user_role ENUM ('VOTER', 'OBSERVER') NOT NULL,
	CONSTRAINT uq_room_member
		UNIQUE (room_id, username)

);

CREATE TABLE vote
(
	room_member_id UUID NOT NULL PRIMARY KEY REFERENCES room_member ON DELETE CASCADE,
	card_id        UUID NOT NULL REFERENCES card ON DELETE CASCADE,
	-- TODO: flip?
	-- Check that vote card is from the card set of the members room
	CONSTRAINT ck_vote_card_set
		CHECK (
			(
				SELECT r.card_set_id
				FROM room_member ru
						 LEFT OUTER JOIN room r ON r.id = ru.room_id
				WHERE ru.id = vote.room_member_id
				) = (
				SELECT cs.id
				FROM card c
						 LEFT OUTER JOIN card_set cs ON c.card_set_id = cs.id
				WHERE c.id = vote.card_id
				)
			),
	CONSTRAINT ck_vote_room_member_role
		CHECK (
			(
				SELECT ru.user_role
				FROM room_member ru
				WHERE ru.id = vote.room_member_id
				) <> 'OBSERVER'
			)
);

/*
 * Application data
 */
INSERT INTO card_set (id, set_name, relevant_decimal_places, show_average_value, show_nearest_card)
VALUES ('947dddcf-e093-4726-b070-fce668365edc', 'Adjusted Fibonacci Scale', 1, TRUE, TRUE),
	   ('148b39a9-2868-4ae6-ac2f-018347892f48', '1 through 10', 1, TRUE, TRUE),
	   ('149b39a9-2868-4ae6-ac2f-018347892f49', 'T-Shirt Sizes', 1, FALSE, TRUE);

INSERT INTO card (id, card_set_id, card_name, card_value, card_description)
VALUES ('c89c4e63-483d-44b3-9b26-4af9a4a1d34c', '947dddcf-e093-4726-b070-fce668365edc', '0', 0.0, ''),
	   ('a6c45498-7276-4f3d-977f-c2afcbfd840c', '947dddcf-e093-4726-b070-fce668365edc', '1', 1.0, ''),
	   ('a98e2bb9-c608-46cb-b3c1-9494ce6e3758', '947dddcf-e093-4726-b070-fce668365edc', '2', 2.0, ''),
	   ('d3f9b7bb-8b8d-4241-b4c5-afcb97d2cc11', '947dddcf-e093-4726-b070-fce668365edc', '3', 3.0, ''),
	   ('3320c618-dd20-4665-a966-7fd3f48930fe', '947dddcf-e093-4726-b070-fce668365edc', '5', 5.0, ''),
	   ('c836e19e-5c83-4814-b99f-a83cae797a01', '947dddcf-e093-4726-b070-fce668365edc', '8', 8.0, ''),
	   ('9f084a67-ebfc-4304-8460-78c6f67ef7b4', '947dddcf-e093-4726-b070-fce668365edc', '13', 13.0, ''),
	   ('7746a8bc-4c2e-464f-9182-872a5517dfd8', '947dddcf-e093-4726-b070-fce668365edc', '20', 20.0, ''),
	   ('c0c4ae53-8e03-401d-bccb-8789cc19d653', '947dddcf-e093-4726-b070-fce668365edc', '40', 40.0, ''),
	   ('35d3a5db-0dd3-41f4-8a31-0980fb3d7a6b', '947dddcf-e093-4726-b070-fce668365edc', '100', 100.0, ''),
	   ('9e61197a-f81a-4c14-b8df-fb1c39f5f091', '947dddcf-e093-4726-b070-fce668365edc', '?', NULL, 'Unsure.'),
	   ('336b63f3-9361-4098-98e0-c7b0f272ae31', '947dddcf-e093-4726-b070-fce668365edc', 'Coffee', 0.0, 'Vote for a break.');

INSERT INTO card (id, card_set_id, card_name, card_value, card_description)
VALUES ('12f1725a-e2b2-4465-98ee-6310f10a4063', '148b39a9-2868-4ae6-ac2f-018347892f48', '1', 1.0, ''),
	   ('d37a352c-538c-4acd-ba65-cb702fc9d6a8', '148b39a9-2868-4ae6-ac2f-018347892f48', '2', 2.0, ''),
	   ('1bb0acb4-914a-48be-9b62-8862734749b9', '148b39a9-2868-4ae6-ac2f-018347892f48', '3', 3.0, ''),
	   ('58491121-d2f4-4754-bb0e-2d86449de253', '148b39a9-2868-4ae6-ac2f-018347892f48', '4', 4.0, ''),
	   ('909d26fb-5bb2-44a3-b7b6-1fd02262a9d9', '148b39a9-2868-4ae6-ac2f-018347892f48', '5', 5.0, ''),
	   ('5f9872cb-a7d8-416b-a6cb-d48062623ca3', '148b39a9-2868-4ae6-ac2f-018347892f48', '6', 6.0, ''),
	   ('44d9cf18-c12c-4684-adb3-22409c028d80', '148b39a9-2868-4ae6-ac2f-018347892f48', '7', 7.0, ''),
	   ('b86dd80c-c046-447e-823b-17b04bc639f8', '148b39a9-2868-4ae6-ac2f-018347892f48', '8', 8.0, ''),
	   ('252e069a-208f-4425-a27a-1a39daab483f', '148b39a9-2868-4ae6-ac2f-018347892f48', '9', 9.0, ''),
	   ('d1b58eff-f72c-4c9e-80af-cbe2c6a8a5f6', '148b39a9-2868-4ae6-ac2f-018347892f48', '10', 10.0, ''),
	   ('5a756787-8959-42fd-91b6-ee052eede2ef', '148b39a9-2868-4ae6-ac2f-018347892f48', '?', NULL, 'Unsure.');

INSERT INTO card (id, card_set_id, card_name, card_value, card_description)
VALUES ('c43faa82-b75c-4553-9c1b-5715ad9fc5f7', '149b39a9-2868-4ae6-ac2f-018347892f49', 'XS', 0.0, 'Extremely small effort.'),
	   ('b414ea06-ce87-4344-b922-71cfd6094339', '149b39a9-2868-4ae6-ac2f-018347892f49', 'S', 1.0, 'Small effort.'),
	   ('1c9f6e91-7215-4e62-908a-a9dd66561297', '149b39a9-2868-4ae6-ac2f-018347892f49', 'M', 2.0, 'Medium effort.'),
	   ('f47aec4b-3e0c-4ca9-983c-7ce72a5e84fa', '149b39a9-2868-4ae6-ac2f-018347892f49', 'L', 3.0, 'Large effort.'),
	   ('6f235d45-b5e7-48ba-90b7-c34a4e82f946', '149b39a9-2868-4ae6-ac2f-018347892f49', 'XL', 4.0, 'Extremely large effort.'),
	   ('18abf347-9c86-481c-8edb-0356729c6353', '149b39a9-2868-4ae6-ac2f-018347892f49', 'XXL', 5.0, 'Extremely, extremely large effort.'),
	   ('7de0e627-db00-453f-a6b1-f3ae633e46d0', '149b39a9-2868-4ae6-ac2f-018347892f49', '?', NULL, 'Unsure.');

INSERT INTO extension (id, extension_key, extension_enabled)
VALUES ('a6f76df2-cc9c-4087-a8e2-a74aecf0e628', 'aha', TRUE);