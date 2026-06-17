package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.Faction
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface FactionRepository : JpaRepository<Faction, UUID> {
    fun findAllByRuleSetId(ruleSetId: UUID): List<Faction>

    @Modifying
    @Query("DELETE FROM Faction f WHERE f.ruleSet.id = :ruleSetId")
    fun deleteAllByRuleSetId(
        @Param("ruleSetId") ruleSetId: UUID,
    )
}
