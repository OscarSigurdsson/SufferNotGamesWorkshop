package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.UnitType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface UnitTypeRepository : JpaRepository<UnitType, UUID> {
    fun findAllByRuleSetId(ruleSetId: UUID): List<UnitType>

    fun findFirstByRuleSetIdAndIsStandardTrue(ruleSetId: UUID): UnitType?

    @Modifying
    @Query("DELETE FROM UnitType t WHERE t.ruleSet.id = :ruleSetId")
    fun deleteAllByRuleSetId(
        @Param("ruleSetId") ruleSetId: UUID,
    )
}
