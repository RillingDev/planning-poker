package com.cryptshare.planningpoker.data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.springframework.lang.Nullable;

import java.util.Comparator;
import java.util.StringJoiner;

@Entity
@Table(name = "card")
public class Card extends BaseEntity {
	public static final Comparator<Card> COMPARATOR = Comparator.comparing(Card::isBasic)
			.reversed()
			.thenComparing(Card::getValue, Comparator.nullsLast(Comparator.naturalOrder()))
			.thenComparing(Card::getName);

	@Column(name = "card_name", nullable = false)
	private String name;

	@Column(name = "card_value")
	private Double value;

	protected Card() {
	}

	public Card(String name, @Nullable Double value) {
		this.name = name;
		this.value = value;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public @Nullable Double getValue() {
		return value;
	}

	public void setValue(@Nullable Double value) {
		this.value = value;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", Card.class.getSimpleName() + "[", "]").add("name='" + name + "'").add("value=" + value).toString();
	}

	public boolean isBasic() {
		if (name.isEmpty()) {
			return false;
		}
		return Character.isDigit(name.charAt(0));
	}
}
