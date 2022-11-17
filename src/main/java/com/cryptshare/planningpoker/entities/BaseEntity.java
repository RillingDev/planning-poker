package com.cryptshare.planningpoker.entities;

import org.springframework.data.domain.Persistable;
import org.springframework.lang.Nullable;

import javax.persistence.*;
import java.util.Objects;
import java.util.UUID;

/**
 * Adapted version of {@link org.springframework.data.jpa.domain.AbstractPersistable}.
 */
@MappedSuperclass
public abstract class BaseEntity implements Persistable<Long> {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private @Nullable Long id;

	@Column(name = "instance_id", nullable = false)
	private UUID instanceId = UUID.randomUUID();

	@Nullable
	@Override
	public Long getId() {
		return id;
	}

	public void setId(@Nullable Long id) {
		this.id = id;
	}

	@Override
	public boolean isNew() {
		return null == getId();
	}

	@Override
	public int hashCode() {
		return Objects.hash(instanceId);
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
		return Objects.equals(instanceId, that.instanceId);
	}

	public UUID getInstanceId() {
		return instanceId;
	}

	public void setInstanceId(UUID uuid) {
		this.instanceId = uuid;
	}
}
