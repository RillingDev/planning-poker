package com.cryptshare.planningpoker.entities;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.util.StringJoiner;

@Entity
@Table(name = "card_set")
public class CardSet extends BaseEntity {
	@Column(name = "set_name", nullable = false)
	private String name;

	@OneToMany(orphanRemoval = true, cascade = CascadeType.ALL, fetch = FetchType.EAGER)
	@JoinColumn(name = "card_set_id", nullable = false)
	private Set<Card> cards = new HashSet<>(16);

	protected CardSet() {
	}

	public CardSet(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", CardSet.class.getSimpleName() + "[", "]").add("name='" + name + "'").add("cards=" + cards).toString();
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Set<Card> getCards() {
		return cards;
	}

	public void setCards(Set<Card> cards) {
		this.cards = cards;
	}

}
