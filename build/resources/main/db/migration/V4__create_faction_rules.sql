CREATE TABLE faction_rules (
    id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL,
    faction_id  UUID         NOT NULL REFERENCES factions (id) ON DELETE CASCADE
);
