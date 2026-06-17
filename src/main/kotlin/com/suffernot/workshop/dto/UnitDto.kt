package com.suffernot.workshop.dto

import java.util.UUID

data class CreateUnitRequest(
    val name: String,
    val pointsCost: Int = 0,
    val unitTypeId: UUID? = null,
    val stats: Map<String, String> = emptyMap(),
    val abilities: List<String> = emptyList(),
)

data class UpdateUnitRequest(
    val name: String,
    val pointsCost: Int = 0,
    val unitTypeId: UUID? = null,
    val stats: Map<String, String> = emptyMap(),
    val abilities: List<String> = emptyList(),
)

data class UnitSummary(
    val id: UUID,
    val name: String,
    val pointsCost: Int,
    val unitTypeName: String?,
    val weaponSets: List<WeaponSetResponse> = emptyList(),
    val stats: Map<String, String> = emptyMap(),
    val abilities: List<String> = emptyList(),
)
