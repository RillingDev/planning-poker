CREATE TABLE room_extension_config_attribute
(
	id                       LONG    NOT NULL GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
	room_extension_config_id UUID    NOT NULL REFERENCES room_extension_config (id) ON DELETE CASCADE,
	attribute_key            VARCHAR NOT NULL,
	attribute_value          VARCHAR NOT NULL,
	CONSTRAINT uq_key UNIQUE (room_extension_config_id, attribute_key)
);