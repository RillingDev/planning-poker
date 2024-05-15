package com.cryptshare.planningpoker.data;

import jakarta.persistence.*;

import java.util.*;

/**
 * A room of {@link RoomMember} with a specific {@link CardSet}.
 * <p>
 * Modification should be done via {@link com.cryptshare.planningpoker.api.RoomService}.
 */
@Entity
@Table(name = "room")
public class Room extends BaseEntity {
	public static final Comparator<Room> ALPHABETIC_COMPARATOR = Comparator.comparing(Room::getName);

	@Column(name = "room_name", nullable = false)
	private String name;

	@Column(name = "topic")
	private String topic;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "card_set_id", nullable = false)
	private CardSet cardSet;

	@OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "room_id", nullable = false)
	private Set<RoomMember> members = new HashSet<>(16);

	@Enumerated(EnumType.STRING)
	@Column(name = "voting_state", nullable = false)
	private VotingState votingState;

	@OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "room_id", nullable = false)
	private Set<RoomExtensionConfig> extensionConfigs = new HashSet<>(4);

	public enum VotingState {
		OPEN, CLOSED
	}

	protected Room() {
	}

	public Room(String name, CardSet cardSet) {
		this.name = name;
		this.cardSet = cardSet;
		votingState = VotingState.OPEN;
		topic = "";
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public CardSet getCardSet() {
		return cardSet;
	}

	public void setCardSet(CardSet cardSet) {
		this.cardSet = cardSet;
	}

	public Set<RoomMember> getMembers() {
		return members;
	}

	protected void setMembers(Set<RoomMember> members) {
		this.members = members;
	}

	public String getTopic() {
		return topic;
	}

	public void setTopic(String topic) {
		this.topic = topic;
	}

	public VotingState getVotingState() {
		return votingState;
	}

	public void setVotingState(VotingState votingState) {
		this.votingState = votingState;
	}

	public Optional<RoomMember> findMemberByUser(String username) {
		return members.stream().filter(roomMember -> roomMember.getUsername().equals(username)).findFirst();
	}

	public Set<RoomExtensionConfig> getExtensionConfigs() {
		return extensionConfigs;
	}

	protected void setExtensionConfigs(Set<RoomExtensionConfig> extensions) {
		this.extensionConfigs = extensions;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", Room.class.getSimpleName() + "[", "]").add("name='" + name + "'")
				.add("topic='" + topic + "'")
				.add("cardSet='" + cardSet.getName() + "'")
				.add("members=" + members.size())
				.add("votingState='" + votingState + "'")
				.add("extensionConfigs=" + extensionConfigs.size())
				.toString();
	}
}
