package com.cryptshare.planningpoker.data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.StringJoiner;

@Entity
@Table(name = "extension")
public class Extension extends BaseEntity {

	@Column(name = "extension_key", nullable = false)
	private String extension;

	protected Extension() {
	}

	public Extension(String extension) {
		this.extension = extension;
	}

	public String getExtension() {
		return extension;
	}

	public void setExtension(String extension) {
		this.extension = extension;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", Extension.class.getSimpleName() + "[", "]").add("extension='" + extension + "'").toString();
	}
}
