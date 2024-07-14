package dev.rilling.planningpoker.data;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

import java.util.Objects;
import java.util.UUID;

/**
 * Adapted version of {@link org.springframework.data.jpa.domain.AbstractPersistable}.
 */
@MappedSuperclass
abstract class BaseEntity {
	// UUID instead of auto-increment to always have an ID for equality checks.
	@Id
	@Column(name = "id", nullable = false)
	private UUID id = UUID.randomUUID();

	protected UUID getId() {
		return id;
	}

	protected void setId(UUID id) {
		this.id = id;
	}

	@Override
	public int hashCode() {
		return Objects.hash(id);
	}

	@Override
	public boolean equals(Object o) {
		if (this == o) {
			return true;
		}
		if (o == null || getClass() != o.getClass()) {
			return false;
		}
		BaseEntity that = (BaseEntity) o;
		return Objects.equals(id, that.id);
	}
}
