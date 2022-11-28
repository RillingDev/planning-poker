package com.cryptshare.planningpoker.data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.StringJoiner;

@Entity
@Table(name = "app_user")
public class User extends BaseEntity {
	@Column(name = "username", nullable = false)
	private String username;

	protected User() {
	}

	public User(String username) {
		this.username = username;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", User.class.getSimpleName() + "[", "]").add("username='" + username + "'").toString();
	}
}
