package dev.rilling.planningpoker.data;

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
	public static final Comparator<CardSet> ALPHABETIC_COMPARATOR = Comparator.comparing(CardSet::getName);

	@Column(name = "set_name", nullable = false)
	private String name;

	@OneToMany(fetch = FetchType.EAGER, cascade = CascadeType.ALL, orphanRemoval = true)
	@JoinColumn(name = "card_set_id", nullable = false)
	private Set<Card> cards = new HashSet<>(16);

	@Column(name = "relevant_decimal_places", nullable = false)
	private int relevantDecimalPlaces;

	@Column(name = "show_average_value", nullable = false)
	private boolean showAverageValue;

	@Column(name = "show_nearest_card", nullable = false)
	private boolean showNearestCard;

	protected CardSet() {
	}

	public CardSet(String name) {
		this.name = name;
		this.relevantDecimalPlaces = 1;
		this.showAverageValue = true;
		this.showNearestCard = true;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", CardSet.class.getSimpleName() + "[", "]").add("name='" + name + "'")
				.add("cards=" + cards.size())
				.add("relevantDecimalPlaces=" + relevantDecimalPlaces)
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

	public int getRelevantDecimalPlaces() {
		return relevantDecimalPlaces;
	}

	public void setRelevantDecimalPlaces(int relevantDecimalPlaces) {
		this.relevantDecimalPlaces = relevantDecimalPlaces;
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
