package com.cryptshare.planningpoker.data;

import jakarta.persistence.*;

import java.util.StringJoiner;

@Entity
@Table(name = "vote")
public class Vote extends BaseEntity {
	// TODO: resolve this two-way-relationship
	@OneToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "room_member_id", nullable = false)
	private RoomMember roomMember;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "card_id", nullable = false)
	private Card card;

	protected Vote() {
	}

	public Vote(RoomMember roomMember, Card card) {
		this.roomMember = roomMember;
		this.card = card;
	}

	public RoomMember getRoomMember() {
		return roomMember;
	}

	public void setRoomMember(RoomMember roomMember) {
		this.roomMember = roomMember;
	}

	public Card getCard() {
		return card;
	}

	public void setCard(Card card) {
		this.card = card;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", Vote.class.getSimpleName() + "[", "]").add("roomMember=" + roomMember).add("card=" + card).toString();
	}
}
