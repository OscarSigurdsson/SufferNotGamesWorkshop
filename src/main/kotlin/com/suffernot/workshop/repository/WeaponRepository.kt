package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.Weapon
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface WeaponRepository : JpaRepository<Weapon, UUID> {
    fun findAllByFactionId(factionId: UUID): List<Weapon>

    @Modifying
    @Query("DELETE FROM Weapon w WHERE w.faction.id = :factionId")
    fun deleteAllByFactionId(
        @Param("factionId") factionId: UUID,
    )

    @Modifying
    @Query("DELETE FROM Weapon w WHERE w.faction.ruleSet.id = :ruleSetId")
    fun deleteAllByFactionRuleSetId(
        @Param("ruleSetId") ruleSetId: UUID,
    )
}
