ALTER TABLE vote
	DROP CONSTRAINT ck_vote_card_set;
ALTER TABLE vote
	DROP CONSTRAINT ck_vote_room_member_role;


ALTER TABLE card
	ADD COLUMN card_description TEXT(500) NULL DEFAULT NULL;


// Used as a join-table
ALTER TABLE vote
	DROP COLUMN id;
ALTER TABLE vote
	ADD PRIMARY KEY (room_member_id);


ALTER TABLE vote
	ADD CONSTRAINT ck_vote_room_member_role CHECK (
		// Enforce that observers do not have votes
			(SELECT ru.user_role
			 FROM room_member ru
			 WHERE ru.id = vote.room_member_id) != 'OBSERVER'
		);
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
		)
