package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.RuleSet
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.UUID

interface RuleSetRepository : JpaRepository<RuleSet, UUID> {
    @Query("SELECT r FROM RuleSet r WHERE r.isPublic = true OR r.owner IS NULL OR r.owner.id = :userId")
    fun findVisibleToUser(
        @Param("userId") userId: UUID,
    ): List<RuleSet>
}
