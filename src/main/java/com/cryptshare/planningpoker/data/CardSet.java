package com.cryptshare.planningpoker.data;

import jakarta.persistence.*;

import java.util.Comparator;
import java.util.HashSet;
import java.util.Set;
import java.util.StringJoiner;

/**
 * Collection of {@link Card}s.
 */
@Entity
@Table(name = "card_set")
public class CardSet extends BaseEntity {
	public static final Comparator<CardSet> ALPHABETIC_COMPARATOR = Comparator.comparing(CardSet::getName, String::compareToIgnoreCase);

	@Column(name = "set_name", nullable = false)
	private String name;

	@OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "card_set_id", nullable = false)
	private Set<Card> cards = new HashSet<>(16);
	// TODO: move summary data to own table
	@Column(name = "relevant_fraction_digits", nullable = false)
	private int relevantFractionDigits;

	@Column(name = "show_average_value", nullable = false)
	private boolean showAverageValue;

	@Column(name = "show_nearest_card", nullable = false)
	private boolean showNearestCard;

	protected CardSet() {
	}

	public CardSet(String name) {
		this.name = name;
		this.relevantFractionDigits = 1;
		this.showAverageValue = true;
		this.showNearestCard = true;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", CardSet.class.getSimpleName() + "[", "]").add("name='" + name + "'")
				.add("cards=" + cards.size())
				.add("relevantFractionDigits=" + relevantFractionDigits)
				.add("showAverageValue=" + showAverageValue)
				.add("showNearestCard=" + showNearestCard)
				.toString();
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

	public int getRelevantFractionDigits() {
		return relevantFractionDigits;
	}

	public void setRelevantFractionDigits(int relevantFractionDigits) {
		this.relevantFractionDigits = relevantFractionDigits;
	}

	public boolean isShowAverageValue() {
		return showAverageValue;
	}

	public void setShowAverageValue(boolean showAverageValue) {
		this.showAverageValue = showAverageValue;
	}

	public boolean isShowNearestCard() {
		return showNearestCard;
	}

	public void setShowNearestCard(boolean showNearestCard) {
		this.showNearestCard = showNearestCard;
	}
}
