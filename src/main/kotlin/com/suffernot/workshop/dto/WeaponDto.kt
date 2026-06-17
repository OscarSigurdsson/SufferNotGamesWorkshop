package com.suffernot.workshop.dto

import java.util.UUID

data class WeaponResponse(
    val id: UUID,
    val name: String,
    val pointsCost: Int,
    val weaponTypeName: String?,
    val stats: Map<String, String>,
    val abilities: List<String>,
    val rules: List<SimpleRuleDto>,
)

data class WeaponSetEntryResponse(
    val entryId: UUID,
    val weaponId: UUID,
    val name: String,
    val pointsCost: Int,
    val weaponTypeName: String?,
)

data class WeaponSetResponse(
    val id: UUID,
    val name: String,
    val isDefault: Boolean,
    val overriddenPointsCost: Int?,
    val entries: List<WeaponSetEntryResponse>,
    val effectivePointsCost: Int,
)

data class CreateWeaponRequest(
    val name: String,
    val pointsCost: Int = 0,
    val weaponTypeId: UUID? = null,
    val stats: Map<String, String> = emptyMap(),
    val abilities: List<String> = emptyList(),
    val rules: List<SimpleRuleDto> = emptyList(),
)

data class UpdateWeaponRequest(
    val name: String,
    val pointsCost: Int = 0,
    val weaponTypeId: UUID? = null,
    val stats: Map<String, String> = emptyMap(),
    val abilities: List<String> = emptyList(),
    val rules: List<SimpleRuleDto> = emptyList(),
)

data class CreateWeaponSetRequest(
    val name: String,
    val isDefault: Boolean = false,
)

data class UpdateWeaponSetRequest(
    val name: String? = null,
    val isDefault: Boolean? = null,
    val overriddenPointsCost: Int? = null,
    val clearOverride: Boolean = false,
)
