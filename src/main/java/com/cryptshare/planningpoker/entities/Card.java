package com.cryptshare.planningpoker.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import org.springframework.lang.Nullable;

import java.util.StringJoiner;

@Entity
@Table(name = "card")
public class Card extends BaseEntity {
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
}
