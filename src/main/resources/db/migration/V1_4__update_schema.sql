ALTER TABLE room_extension_config
	ADD COLUMN entries VARCHAR NOT NULL USING '{}';