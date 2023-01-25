package com.cryptshare.planningpoker.data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "room_extension")
public class RoomExtension extends BaseEntity {

	@Column(name = "extension_name", nullable = false)
	private String extension;

	protected RoomExtension() {
	}

	public RoomExtension(String extension) {
		this.extension = extension;
	}

	public String getExtension() {
		return extension;
	}

	public void setExtension(String extension) {
		this.extension = extension;
	}
}
