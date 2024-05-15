package com.cryptshare.planningpoker.data;

import jakarta.persistence.*;

import java.util.Comparator;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

/**
 * The configuration of an {@link Extension} for a {@link Room}.
 * <p>
 * The presence of an instance implies that this extension is active in this room.
 * Note that this can also be the case if the extension is disabled globally.
 */
@Entity
@Table(name = "room_extension_config")
public class RoomExtensionConfig extends BaseEntity {
	public static final Comparator<RoomExtensionConfig> ALPHABETIC_COMPARATOR = Comparator.comparing(RoomExtensionConfig::getExtension,
			Extension.ALPHABETIC_COMPARATOR);

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "extension_id", nullable = false)
	private Extension extension;

	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "room_extension_config_attribute", joinColumns = {
			@JoinColumn(name = "room_extension_config_id", referencedColumnName = "id", nullable = false) })
	@MapKeyColumn(name = "attribute_key")
	@Column(name = "attribute_value", nullable = false)
	private Map<String, String> attributes = new HashMap<>(4);

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

	public Map<String, String> getAttributes() {
		return attributes;
	}

	void setAttributes(Map<String, String> attributes) {
		this.attributes = attributes;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", RoomExtensionConfig.class.getSimpleName() + "[", "]").add("extension='" + extension + "'")
				.add("attributes=" + attributes.size())
				.toString();
	}
}
