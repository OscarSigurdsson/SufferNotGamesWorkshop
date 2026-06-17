package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.RuleSetKeyword
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface RuleSetKeywordRepository : JpaRepository<RuleSetKeyword, UUID> {
    fun findAllByRuleSetId(ruleSetId: UUID): List<RuleSetKeyword>

    @Modifying
    @Query("DELETE FROM RuleSetKeyword k WHERE k.ruleSet.id = :ruleSetId")
    fun deleteAllByRuleSetId(
        @Param("ruleSetId") ruleSetId: UUID,
    )
}
