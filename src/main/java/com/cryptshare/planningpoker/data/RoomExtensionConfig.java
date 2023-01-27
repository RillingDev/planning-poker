package com.cryptshare.planningpoker.data;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.util.StringJoiner;

@Entity
@Table(name = "room_extension_config")
public class RoomExtensionConfig extends BaseEntity {

	@ManyToOne
	@JoinColumn(name = "extension_id", nullable = false)
	private Extension extension;

	protected RoomExtensionConfig() {
	}

	public RoomExtensionConfig(Extension extension) {
		this.extension = extension;
	}

	public Extension getExtension() {
		return extension;
	}

	public void setExtension(Extension extension) {
		this.extension = extension;
	}

	public boolean isEnabled() {
		return getExtension().isEnabled();
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", RoomExtensionConfig.class.getSimpleName() + "[", "]").add("extension='" + extension + "'").toString();
	}
}
