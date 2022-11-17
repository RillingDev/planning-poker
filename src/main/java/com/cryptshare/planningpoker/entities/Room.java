package com.cryptshare.planningpoker.entities;

import javax.persistence.*;
import java.util.StringJoiner;

@Entity
@Table(name = "room")
public class Room extends BaseEntity {
	@Column(name = "room_name", nullable = false)
	private String name;

	@ManyToOne(fetch = FetchType.EAGER, optional = false)
	@JoinColumn(name = "card_set_id", nullable = false)
	private CardSet cardSet;

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

	@Override
	public String toString() {
		return new StringJoiner(", ", Room.class.getSimpleName() + "[", "]").add("name='" + name + "'").add("cardSet=" + cardSet).toString();
	}
}
