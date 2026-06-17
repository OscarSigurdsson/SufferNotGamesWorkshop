package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.WeaponSet
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface WeaponSetRepository : JpaRepository<WeaponSet, UUID> {
    fun findAllByUnitId(unitId: UUID): List<WeaponSet>

    @Modifying
    @Query(
        value = "DELETE FROM weapon_set_entries WHERE weapon_id = :weaponId",
        nativeQuery = true,
    )
    fun removeWeaponFromAllSets(
        @Param("weaponId") weaponId: UUID,
    )

    @Modifying
    @Query(
        value = "DELETE FROM weapon_set_entries WHERE weapon_set_id = :setId",
        nativeQuery = true,
    )
    fun deleteEntriesForSet(
        @Param("setId") setId: UUID,
    )

    @Modifying
    @Query(
        value = """
            DELETE FROM weapon_set_entries
            WHERE weapon_set_id IN (
                SELECT ws.id FROM weapon_sets ws WHERE ws.unit_id = :unitId
            )
        """,
        nativeQuery = true,
    )
    fun deleteEntriesForUnit(
        @Param("unitId") unitId: UUID,
    )

    @Modifying
    @Query(
        value = """
            DELETE FROM weapon_set_entries
            WHERE weapon_set_id IN (
                SELECT ws.id FROM weapon_sets ws
                JOIN units u ON u.id = ws.unit_id
                WHERE u.faction_id = :factionId
            )
        """,
        nativeQuery = true,
    )
    fun deleteEntriesForFaction(
        @Param("factionId") factionId: UUID,
    )

    @Modifying
    @Query(
        value = """
            DELETE FROM weapon_set_entries
            WHERE weapon_set_id IN (
                SELECT ws.id FROM weapon_sets ws
                JOIN units u ON u.id = ws.unit_id
                JOIN factions f ON f.id = u.faction_id
                WHERE f.rule_set_id = :ruleSetId
            )
        """,
        nativeQuery = true,
    )
    fun deleteEntriesForRuleSet(
        @Param("ruleSetId") ruleSetId: UUID,
    )

    @Modifying
    @Query("DELETE FROM WeaponSet ws WHERE ws.unit.id = :unitId")
    fun deleteAllByUnitId(
        @Param("unitId") unitId: UUID,
    )

    @Modifying
    @Query("DELETE FROM WeaponSet ws WHERE ws.unit.faction.id = :factionId")
    fun deleteAllByUnitFactionId(
        @Param("factionId") factionId: UUID,
    )

    @Modifying
    @Query("DELETE FROM WeaponSet ws WHERE ws.unit.faction.ruleSet.id = :ruleSetId")
    fun deleteAllByUnitFactionRuleSetId(
        @Param("ruleSetId") ruleSetId: UUID,
    )
}
