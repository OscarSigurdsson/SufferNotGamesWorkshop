package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.FactionRule
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface FactionRuleRepository : JpaRepository<FactionRule, UUID> {
    fun findAllByFactionId(factionId: UUID): List<FactionRule>

    @Modifying
    @Query("DELETE FROM FactionRule r WHERE r.faction.id = :factionId")
    fun deleteAllByFactionId(
        @Param("factionId") factionId: UUID,
    )

    @Modifying
    @Query("DELETE FROM FactionRule r WHERE r.faction.ruleSet.id = :ruleSetId")
    fun deleteAllByFactionRuleSetId(
        @Param("ruleSetId") ruleSetId: UUID,
    )
}
