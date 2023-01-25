CREATE TABLE extension
(
	extension_name VARCHAR PRIMARY KEY NOT NULL
);

CREATE TABLE room_extension
(
	id             UUID    NOT NULL PRIMARY KEY,
	room_id        UUID    NOT NULL REFERENCES room (id) ON DELETE CASCADE,
	extension_name VARCHAR NOT NULL REFERENCES extension (extension_name) ON DELETE CASCADE,
	CONSTRAINT uq_room_extension UNIQUE (room_id, extension_name)
);

INSERT INTO extension (extension_name)
VALUES ('aha');