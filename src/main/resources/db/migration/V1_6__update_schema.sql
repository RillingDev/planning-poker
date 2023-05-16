// Pause constraints
ALTER TABLE vote
    DROP CONSTRAINT ck_vote_card_set;
ALTER TABLE vote
    DROP CONSTRAINT ck_vote_room_member_role;
ALTER TABLE card_set
    DROP CONSTRAINT ck_relevant_fraction_digits;


ALTER TABLE card_set
    ALTER COLUMN relevant_fraction_digits RENAME TO relevant_decimal_places;

ALTER TABLE card_set
    ADD COLUMN show_average_value BOOLEAN NOT NULL USING TRUE;
ALTER TABLE card_set
    ADD COLUMN show_nearest_card BOOLEAN NOT NULL USING TRUE;


UPDATE card_set cs
SET cs.show_average_value = false
WHERE cs.ID = '149b39a9-2868-4ae6-ac2f-018347892f49';


ALTER TABLE app_user
    ALTER COLUMN username VARCHAR(128) NOT NULL;
ALTER TABLE room_member
    ALTER COLUMN username VARCHAR(128) NOT NULL;

ALTER TABLE card
    ALTER COLUMN card_name VARCHAR(64) NOT NULL;
ALTER TABLE card
    ALTER COLUMN card_description CLOB(2048) NULL;

ALTER TABLE card_set
    ALTER COLUMN set_name VARCHAR(128) NOT NULL;

ALTER TABLE room
    ALTER COLUMN room_name VARCHAR(128) NOT NULL;
ALTER TABLE room
    ALTER COLUMN topic CLOB(4096) NULL;


ALTER TABLE extension
    ALTER COLUMN extension_key VARCHAR(32) NOT NULL;


ALTER TABLE room_extension_config_attribute
    ALTER COLUMN attribute_key VARCHAR(64) NOT NULL;

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
    ADD CONSTRAINT ck_relevant_decimal_places CHECK (CARD_SET.relevant_decimal_places >= 0);