package com.cryptshare.planningpoker.data;

import jakarta.persistence.*;
import org.springframework.lang.Nullable;

import java.util.StringJoiner;

@Entity
@Table(name = "room_member")
public class RoomMember extends BaseEntity implements Comparable<RoomMember> {
	public enum Role {
		VOTER,
		OBSERVER
	}

	@Column(name = "username", nullable = false)
	private String username;

	@Enumerated(EnumType.STRING)
	@Column(name = "user_role", nullable = false)
	private Role role = Role.VOTER;

	@OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true, mappedBy = "roomMember")
	@Nullable
	private Vote vote;

	protected RoomMember() {
	}

	/**
	 * @param username Must be derived from a valid {@link org.springframework.security.core.userdetails.UserDetails}.
	 */
	public RoomMember(String username) {
		this.username = username;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public Role getRole() {
		return role;
	}

	public void setRole(Role role) {
		this.role = role;
	}

	@Nullable
	public Vote getVote() {
		return vote;
	}

	public boolean hasVote() {
		return vote != null;
	}

	public void setVote(@Nullable Vote vote) {
		this.vote = vote;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", RoomMember.class.getSimpleName() + "[", "]").add("username='" + username + "'")
				.add("role=" + role)
				.add("vote=" + vote)
				.toString();
	}

	@Override
	public int compareTo(RoomMember o) {
		return this.username.compareToIgnoreCase(o.username);
	}
}
