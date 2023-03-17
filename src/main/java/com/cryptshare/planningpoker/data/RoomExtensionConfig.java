package com.cryptshare.planningpoker.data;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.persistence.*;

import java.util.Comparator;
import java.util.StringJoiner;

/**
 * The configuration of an {@link Extension} for a {@link Room}.
 */
@Entity
@Table(name = "room_extension_config")
public class RoomExtensionConfig extends BaseEntity {
	public static final Comparator<RoomExtensionConfig> ALPHABETIC_COMPARATOR = Comparator.comparing(RoomExtensionConfig::getExtension,
			Extension.ALPHABETIC_COMPARATOR);

	@ManyToOne
	@JoinColumn(name = "extension_id", nullable = false)
	private Extension extension;

	@Column(name = "entries", nullable = false)
	@Convert(converter = ObjectNodeConverter.class)
	private ObjectNode entries = new ObjectNode(JsonNodeFactory.instance);

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

	public ObjectNode getEntries() {
		return entries;
	}

	public void setEntries(ObjectNode entries) {
		this.entries = entries;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", RoomExtensionConfig.class.getSimpleName() + "[", "]").add("extension='" + extension + "'")
				.add("entries=" + entries.size() + "")
				.toString();
	}

	@Converter
	public static class ObjectNodeConverter implements AttributeConverter<ObjectNode, String> {

		private final ObjectMapper objectMapper = new ObjectMapper();

		public ObjectNodeConverter() {
		}

		@Override
		public String convertToDatabaseColumn(ObjectNode attribute) {
			try {
				return objectMapper.writeValueAsString(attribute);
			} catch (JsonProcessingException e) {
				throw new RuntimeException(e);
			}
		}

		@Override
		public ObjectNode convertToEntityAttribute(String dbData) {
			try {
				final JsonNode jsonNode = objectMapper.readTree(dbData);
				if (!(jsonNode instanceof ObjectNode)) {
					throw new IllegalStateException("Expected object node but found " + jsonNode);
				}
				return (ObjectNode) jsonNode;
			} catch (JsonProcessingException e) {
				throw new RuntimeException(e);
			}
		}
	}

}
