// Pause constraints
ALTER TABLE vote
    DROP CONSTRAINT ck_vote_card_set;
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
ALTER TABLE card_set
    ADD CONSTRAINT ck_relevant_decimal_places CHECK (CARD_SET.relevant_decimal_places >= 0);