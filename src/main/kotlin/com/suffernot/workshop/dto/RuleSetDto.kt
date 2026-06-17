package com.suffernot.workshop.dto

import java.util.UUID

data class CreateRuleSetRequest(
    val name: String,
    val description: String? = null,
    val isPublic: Boolean = true,
)

data class RuleSetSummary(
    val id: UUID,
    val name: String,
    val description: String?,
    val isPublic: Boolean,
    val ownerUsername: String?,
    val isOwner: Boolean,
)

data class RuleSetResponse(
    val id: UUID,
    val name: String,
    val description: String?,
    val isPublic: Boolean,
    val ownerUsername: String?,
    val isOwner: Boolean,
    val generalRules: List<GeneralRuleResponse>,
    val factions: List<FactionSummary>,
    val abilities: List<KeywordResponse>,
    val unitTypes: List<UnitTypeResponse>,
    val weaponTypes: List<WeaponTypeResponse>,
)
