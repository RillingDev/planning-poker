// Pause constraints
ALTER TABLE vote
    DROP CONSTRAINT ck_vote_card_set;
ALTER TABLE card_set
    DROP CONSTRAINT ck_relevant_fraction_digits;


ALTER TABLE card_set
    ADD COLUMN show_average_value BOOLEAN NOT NULL USING TRUE;
ALTER TABLE card_set
    ADD COLUMN show_nearest_card BOOLEAN NOT NULL USING TRUE;


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
    ADD CONSTRAINT ck_relevant_fraction_digits CHECK (CARD_SET.relevant_fraction_digits >= 0);