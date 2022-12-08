package com.cryptshare.planningpoker.data.h2;

import org.h2.api.Trigger;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;

/**
 * Trigger that deletes votes when a {@link com.cryptshare.planningpoker.data.Room} {@link com.cryptshare.planningpoker.data.CardSet} changes.
 */
public class VoteCardSetCleanupTrigger implements Trigger {
	@Override
	public void fire(Connection conn, Object[] oldRow, Object[] newRow) throws SQLException {
		final UUID id = (UUID) newRow[0];
		final UUID cardSetId = (UUID) newRow[1];

		final UUID oldCardSetId = (UUID) oldRow[1];

		if (!cardSetId.equals(oldCardSetId)) {
			try (PreparedStatement stmt = conn.prepareStatement(
					"DELETE FROM vote v WHERE v.room_member_id IN (SELECT rm.id FROM room_member rm WHERE rm.room_id = ?)")) {
				stmt.setObject(1, id);
				stmt.execute();
			}
		}
	}
}
