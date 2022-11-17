package com.cryptshare.planningpoker.entities;

import org.springframework.lang.Nullable;

import javax.persistence.Column;
import javax.persistence.Id;
import javax.persistence.MappedSuperclass;
import java.util.Objects;
import java.util.UUID;

/**
 * Adapted version of {@link org.springframework.data.jpa.domain.AbstractPersistable}.
 */
@MappedSuperclass
public abstract class BaseEntity {
	// UUID instead of auto-increment to always have an ID for equality checks.
	@Id
	@Column(name = "id", nullable = false)
	private @Nullable UUID id = UUID.randomUUID();

	@Nullable
	public UUID getId() {
		return id;
	}

	public void setId(@Nullable UUID id) {
		this.id = id;
	}

	public boolean isNew() {
		return null == getId();
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
