CREATE TABLE extension
(
	id            UUID           NOT NULL PRIMARY KEY,
	extension_key VARCHAR UNIQUE NOT NULL
);

CREATE TABLE room_extension_config
(
	id           UUID    NOT NULL PRIMARY KEY,
	room_id      UUID    NOT NULL REFERENCES room (id) ON DELETE CASCADE,
	extension_id VARCHAR NOT NULL REFERENCES extension (id) ON DELETE CASCADE,
	CONSTRAINT uq_room_extension_config UNIQUE (room_id, extension_id)
);

INSERT INTO extension (id, extension_key)
VALUES (RANDOM_UUID(), 'aha');