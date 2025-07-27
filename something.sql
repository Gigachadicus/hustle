CREATE TABLE users (
  userid SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  subscription_tier VARCHAR(50)
);

CREATE TABLE tokens (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    refresh_token TEXT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

alter table assets add column important TEXT[]

CREATE OR REPLACE FUNCTION delete_user_tokens()
RETURNS trigger AS $$
BEGIN
    DELETE FROM tokens WHERE user_id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER cleantokens
AFTER DELETE ON users
FOR EACH ROW
EXECUTE FUNCTION delete_user_tokens();
