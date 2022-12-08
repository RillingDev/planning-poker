package com.cryptshare.planningpoker.data;

import jakarta.persistence.*;
import org.springframework.lang.Nullable;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.StringJoiner;

@Entity
@Table(name = "room")
public class Room extends BaseEntity {
	@Column(name = "room_name", nullable = false)
	private String name;

	@Column(name = "topic")
	@Nullable
	private String topic;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "card_set_id", nullable = false)
	private CardSet cardSet;

	@OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "room_id", nullable = false)
	private Set<RoomMember> members = new HashSet<>(16);

	protected Room() {
	}

	public Room(String name, CardSet cardSet) {
		this.name = name;
		this.cardSet = cardSet;
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

	@Nullable
	public String getTopic() {
		return topic;
	}

	public void setTopic(@Nullable String topic) {
		if (topic != null && topic.isEmpty()) {
			this.topic = null;
		} else {
			this.topic = topic;
		}
	}

	public Optional<RoomMember> findMemberByUser(String username) {
		return members.stream().filter(roomMember -> roomMember.getUsername().equalsIgnoreCase(username)).findFirst();
	}

	public boolean isVotingComplete() {
		return members.stream().filter(roomMember -> roomMember.getRole() != RoomMember.Role.OBSERVER).allMatch(RoomMember::hasVote);
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", Room.class.getSimpleName() + "[", "]").add("name='" + name + "'")
				.add("topic='" + topic + "'")
				.add("cardSet='" + cardSet.getName() + "'")
				.toString();
	}
}
