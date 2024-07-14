package dev.rilling.planningpoker.data;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Comparator;
import java.util.StringJoiner;

/**
 * Data of an extension.
 */
@Entity
@Table(name = "extension")
public class Extension extends BaseEntity {
	public static final Comparator<Extension> ALPHABETIC_COMPARATOR = Comparator.comparing(Extension::getKey);

	@Column(name = "extension_key", nullable = false)
	private String key;

	/**
	 * If the extension is enabled globally.
	 * <p>
	 * If false, it should be hidden from clients.
	 */
	@Column(name = "extension_enabled", nullable = false)
	private boolean enabled;

	protected Extension() {
	}

	public Extension(String key) {
		this.key = key;
		enabled = true;
	}

	public String getKey() {
		return key;
	}

	public void setKey(String extension) {
		this.key = extension;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	@Override
	public String toString() {
		return new StringJoiner(", ", Extension.class.getSimpleName() + "[", "]").add("key='" + key + "'").add("enabled=" + enabled).toString();
	}
}
