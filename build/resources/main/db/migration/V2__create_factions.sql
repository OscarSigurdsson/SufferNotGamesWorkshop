CREATE TABLE factions (
    id          UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    rule_set_id UUID         NOT NULL REFERENCES rule_sets (id) ON DELETE CASCADE
);
