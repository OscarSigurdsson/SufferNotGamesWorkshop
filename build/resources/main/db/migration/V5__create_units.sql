CREATE TABLE units (
    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name             VARCHAR(255) NOT NULL,
    points_cost      INTEGER      NOT NULL DEFAULT 0,
    model_count      VARCHAR(100) NOT NULL DEFAULT '1 model',
    faction_id       UUID         NOT NULL REFERENCES factions (id) ON DELETE CASCADE,
    stats            JSONB        NOT NULL DEFAULT '{}',
    ranged_weapons   JSONB        NOT NULL DEFAULT '[]',
    melee_weapons    JSONB        NOT NULL DEFAULT '[]',
    abilities        JSONB        NOT NULL DEFAULT '[]',
    keywords         JSONB        NOT NULL DEFAULT '[]',
    faction_keywords JSONB        NOT NULL DEFAULT '[]'
);
