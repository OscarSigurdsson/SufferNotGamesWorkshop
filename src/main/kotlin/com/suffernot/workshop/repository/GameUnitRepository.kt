package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.GameUnit
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface GameUnitRepository : JpaRepository<GameUnit, UUID> {
    fun findAllByFactionId(factionId: UUID): List<GameUnit>

    @Modifying
    @Query("DELETE FROM GameUnit u WHERE u.faction.id = :factionId")
    fun deleteAllByFactionId(
        @Param("factionId") factionId: UUID,
    )

    @Modifying
    @Query("DELETE FROM GameUnit u WHERE u.faction.ruleSet.id = :ruleSetId")
    fun deleteAllByFactionRuleSetId(
        @Param("ruleSetId") ruleSetId: UUID,
    )
}
