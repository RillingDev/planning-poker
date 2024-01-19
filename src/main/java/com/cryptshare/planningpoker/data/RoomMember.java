package com.cryptshare.planningpoker.data;

import jakarta.persistence.*;
import org.springframework.lang.Nullable;

import java.util.Comparator;
import java.util.StringJoiner;

/**
 * User in a {@link Room}.
 * <p>
 * Modification should be done via {@link com.cryptshare.planningpoker.api.RoomService}.
 */
@Entity
@Table(name = "room_member")
public class RoomMember extends BaseEntity {
	public static final Comparator<RoomMember> ALPHABETIC_COMPARATOR = Comparator.comparing(RoomMember::getUsername);

	public enum Role {
		VOTER,
		OBSERVER
	}

	// Must be the principal name of a persisted OAuth2AuthorizedClient.
	// See org.springframework.security.oauth2.client.JdbcOAuth2AuthorizedClientService
	@Column(name = "username", nullable = false)
	private String username;

	@Enumerated(EnumType.STRING)
	@Column(name = "user_role", nullable = false)
	private Role role;

	// FIXME: in rare cases (data race?) adding a vote violates the pkey of the vote entry (probably because an identical was created before)
	@ManyToOne(fetch = FetchType.EAGER)
	@JoinTable(name = "vote", joinColumns = {@JoinColumn(name = "room_member_id", referencedColumnName = "id", nullable = false)}, inverseJoinColumns = {
			@JoinColumn(name = "card_id", referencedColumnName = "id", nullable = false)})
	@Nullable
	private Card vote;

	protected RoomMember() {
	}

	/**
	 * @param username Must be derived from a valid {@link org.springframework.security.oauth2.core.oidc.user.OidcUser}.
	 */
	public RoomMember(String username) {
		this.username = username;
		role = Role.VOTER;
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
	public Card getVote() {
		return vote;
	}

	public void setVote(@Nullable Card vote) {
		this.vote = vote;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", RoomMember.class.getSimpleName() + "[", "]").add("username='" + username + "'").add("role=" + role).toString();
	}
}
