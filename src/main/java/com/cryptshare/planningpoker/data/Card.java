package com.cryptshare.planningpoker.data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.springframework.lang.Nullable;

import java.util.Comparator;
import java.util.StringJoiner;

/**
 * Card in a {@link CardSet}.
 */
@Entity
@Table(name = "card")
public class Card extends BaseEntity {
	public static final Comparator<Card> NATURAL_COMPARATOR = Comparator.comparing(Card::isBasicNumeric).reversed().thenComparing(Card::getValue, Comparator.nullsLast(Comparator.naturalOrder())).thenComparing(Card::getName);

	@Column(name = "card_name", nullable = false)
	private String name;

	@Column(name = "card_value")
	@Nullable
	private Double value;

	@Column(name = "card_description")
	private String description;

	protected Card() {
	}

	public Card(String name, @Nullable Double value) {
		this.name = name;
		this.value = value;
		description = "";
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Nullable
	public Double getValue() {
		return value;
	}

	public void setValue(@Nullable Double value) {
		this.value = value;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", Card.class.getSimpleName() + "[", "]").add("name='" + name + "'").add("value=" + value).toString();
	}

	/**
	 * @return if this card is considered a basic numeric card. This is the case if its name looks like a number.
	 * 	Most often this will be a card where the name is just the value of the card, but this is not enforced.
	 */
	public boolean isBasicNumeric() {
		if (name.isEmpty()) {
			return false;
		}
		return Character.isDigit(name.charAt(0));
	}

}
