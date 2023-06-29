package com.cryptshare.planningpoker.data.h2;

import org.h2.api.Trigger;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;

/**
 * Trigger that deletes votes when a {@link com.cryptshare.planningpoker.data.Room} {@link com.cryptshare.planningpoker.data.CardSet} changes.
 */
@Deprecated
public class VoteCardSetCleanupTrigger implements Trigger {
	@Override
	public void fire(Connection conn, Object[] oldRow, Object[] newRow) throws SQLException {
		// Noop, exists for backwards compatibility
	}
}
