CREATE TABLE ruleset_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    rule_set_id UUID NOT NULL REFERENCES rule_sets(id)
);

CREATE TABLE unit_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    is_standard BOOLEAN NOT NULL DEFAULT FALSE,
    stat_line JSONB NOT NULL DEFAULT '[]',
    keywords JSONB NOT NULL DEFAULT '[]',
    rules JSONB NOT NULL DEFAULT '[]',
    rule_set_id UUID NOT NULL REFERENCES rule_sets(id)
);

ALTER TABLE units ADD COLUMN unit_type_id UUID REFERENCES unit_types(id);

CREATE TABLE weapon_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    is_deletable BOOLEAN NOT NULL DEFAULT TRUE,
    stat_line JSONB NOT NULL DEFAULT '[]',
    keywords JSONB NOT NULL DEFAULT '[]',
    rules JSONB NOT NULL DEFAULT '[]',
    rule_set_id UUID NOT NULL REFERENCES rule_sets(id)
);

CREATE TABLE weapons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    points_cost INT NOT NULL DEFAULT 0,
    stats JSONB NOT NULL DEFAULT '{}',
    keywords JSONB NOT NULL DEFAULT '[]',
    rules JSONB NOT NULL DEFAULT '[]',
    weapon_type_id UUID REFERENCES weapon_types(id),
    faction_id UUID NOT NULL REFERENCES factions(id)
);

CREATE TABLE weapon_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    overridden_points_cost INT,
    unit_id UUID NOT NULL REFERENCES units(id)
);

CREATE TABLE weapon_set_entries (
    weapon_set_id UUID NOT NULL REFERENCES weapon_sets(id),
    weapon_id UUID NOT NULL REFERENCES weapons(id),
    PRIMARY KEY (weapon_set_id, weapon_id)
);

INSERT INTO unit_types (id, name, is_standard, stat_line, keywords, rules, rule_set_id)
SELECT gen_random_uuid(), 'Standard', TRUE,
    '["Movement","Strength","Toughness","Ballistic Skill","Weapon Skill","Wounds","Save","Leadership"]'::jsonb,
    '[]'::jsonb, '[]'::jsonb, id
FROM rule_sets;

INSERT INTO weapon_types (id, name, is_deletable, stat_line, keywords, rules, rule_set_id)
SELECT gen_random_uuid(), 'Melee', FALSE,
    '["Strength","Penetration","Damage"]'::jsonb, '[]'::jsonb, '[]'::jsonb, id
FROM rule_sets;

INSERT INTO weapon_types (id, name, is_deletable, stat_line, keywords, rules, rule_set_id)
SELECT gen_random_uuid(), 'Ranged', FALSE,
    '["Range","Strength","Penetration","Damage"]'::jsonb, '[]'::jsonb, '[]'::jsonb, id
FROM rule_sets;

UPDATE units u SET unit_type_id = (
    SELECT ut.id FROM unit_types ut
    JOIN factions f ON f.rule_set_id = ut.rule_set_id
    WHERE f.id = u.faction_id AND ut.is_standard = TRUE
    LIMIT 1
);
