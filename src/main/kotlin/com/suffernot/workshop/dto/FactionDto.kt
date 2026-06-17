package com.suffernot.workshop.dto

import java.util.UUID

data class CreateFactionRequest(
    val name: String,
    val description: String? = null,
)

data class FactionSummary(
    val id: UUID,
    val name: String,
    val description: String?,
)

data class FactionResponse(
    val id: UUID,
    val name: String,
    val description: String?,
    val factionRules: List<FactionRuleResponse>,
    val units: List<UnitSummary>,
    val weapons: List<WeaponResponse>,
)
