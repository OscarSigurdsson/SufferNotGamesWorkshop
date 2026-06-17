-- Recreate weapon_set_entries with surrogate UUID PK to allow duplicate weapons
DROP TABLE weapon_set_entries;
CREATE TABLE weapon_set_entries (
    id            UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    weapon_set_id UUID NOT NULL REFERENCES weapon_sets(id),
    weapon_id     UUID NOT NULL REFERENCES weapons(id)
);

-- Add description to the ability pool
ALTER TABLE ruleset_keywords ADD COLUMN description TEXT NOT NULL DEFAULT '';

-- Reset unit stats/abilities to empty — old types (UnitStats object, Ability objects) are incompatible with
-- the new Map<String,String> and List<String> representations used by the updated GameUnit entity.
UPDATE units SET stats = '{}', abilities = '[]';
