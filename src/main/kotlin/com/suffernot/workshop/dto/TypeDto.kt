package com.suffernot.workshop.dto

import java.util.UUID

data class SimpleRuleDto(
    val name: String,
    val description: String,
)

data class KeywordResponse(
    val id: UUID,
    val name: String,
    val description: String,
)

data class AddKeywordRequest(
    val name: String,
    val description: String = "",
)

data class UpdateAbilityRequest(
    val name: String,
    val description: String,
)

data class UnitTypeResponse(
    val id: UUID,
    val name: String,
    val isStandard: Boolean,
    val statLine: List<String>,
    val abilities: List<String>,
    val rules: List<SimpleRuleDto>,
)

data class CreateUnitTypeRequest(
    val name: String,
    val statLine: List<String> = emptyList(),
    val abilities: List<String> = emptyList(),
    val rules: List<SimpleRuleDto> = emptyList(),
)

data class UpdateUnitTypeRequest(
    val name: String,
    val statLine: List<String> = emptyList(),
    val abilities: List<String> = emptyList(),
    val rules: List<SimpleRuleDto> = emptyList(),
)

data class WeaponTypeResponse(
    val id: UUID,
    val name: String,
    val isDeletable: Boolean,
    val statLine: List<String>,
    val abilities: List<String>,
    val rules: List<SimpleRuleDto>,
)

data class CreateWeaponTypeRequest(
    val name: String,
    val statLine: List<String> = emptyList(),
    val abilities: List<String> = emptyList(),
    val rules: List<SimpleRuleDto> = emptyList(),
)

data class UpdateWeaponTypeRequest(
    val name: String,
    val statLine: List<String> = emptyList(),
    val abilities: List<String> = emptyList(),
    val rules: List<SimpleRuleDto> = emptyList(),
)
