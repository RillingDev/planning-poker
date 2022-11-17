package com.cryptshare.planningpoker.entities;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;
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
