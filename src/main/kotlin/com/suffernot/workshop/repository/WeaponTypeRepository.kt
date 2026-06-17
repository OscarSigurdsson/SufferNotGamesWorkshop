package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.WeaponType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface WeaponTypeRepository : JpaRepository<WeaponType, UUID> {
    fun findAllByRuleSetId(ruleSetId: UUID): List<WeaponType>

    @Modifying
    @Query("DELETE FROM WeaponType t WHERE t.ruleSet.id = :ruleSetId")
    fun deleteAllByRuleSetId(
        @Param("ruleSetId") ruleSetId: UUID,
    )
}
