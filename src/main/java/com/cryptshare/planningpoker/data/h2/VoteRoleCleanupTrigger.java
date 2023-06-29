package com.cryptshare.planningpoker.data.h2;

import com.cryptshare.planningpoker.data.RoomMember.Role;
import org.h2.api.Trigger;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.UUID;

/**
 * Trigger that deletes votes when a {@link com.cryptshare.planningpoker.data.RoomMember} switches to {@link Role#OBSERVER}
 */
@Deprecated
public class VoteRoleCleanupTrigger implements Trigger {
	@Override
	public void fire(Connection conn, Object[] oldRow, Object[] newRow) throws SQLException {
		// Noop, exists for backwards compatibility
	}
}
