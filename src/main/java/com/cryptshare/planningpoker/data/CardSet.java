package com.cryptshare.planningpoker.data;

import jakarta.persistence.*;

import java.util.Comparator;
import java.util.HashSet;
import java.util.Set;
import java.util.StringJoiner;

@Entity
@Table(name = "card_set")
public class CardSet extends BaseEntity {
	public static final Comparator<CardSet> ALPHABETIC_COMPARATOR = Comparator.comparing(CardSet::getName, String::compareToIgnoreCase);

	@Column(name = "set_name", nullable = false)
	private String name;

	@OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "card_set_id", nullable = false)
	private Set<Card> cards = new HashSet<>(16);

	protected CardSet() {
	}

	public CardSet(String name) {
		this.name = name;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", CardSet.class.getSimpleName() + "[", "]")
				.add("name='" + name + "'")
				.add("cards=" + cards.size()).toString();
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

	protected void setCards(Set<Card> cards) {
		this.cards = cards;
	}

}
