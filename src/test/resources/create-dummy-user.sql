INSERT INTO oauth2_authorized_client (client_registration_id, principal_name, access_token_type, access_token_value,
									  access_token_issued_at, access_token_expires_at)
VALUES ('someProvider', 'Bob', 'Bearer', 'someToken', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);