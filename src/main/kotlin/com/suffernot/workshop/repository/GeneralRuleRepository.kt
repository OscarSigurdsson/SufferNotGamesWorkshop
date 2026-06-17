package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.GeneralRule
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface GeneralRuleRepository : JpaRepository<GeneralRule, UUID> {
    fun findAllByRuleSetId(ruleSetId: UUID): List<GeneralRule>

    @Modifying
    @Query("DELETE FROM GeneralRule r WHERE r.ruleSet.id = :ruleSetId")
    fun deleteAllByRuleSetId(
        @Param("ruleSetId") ruleSetId: UUID,
    )
}
