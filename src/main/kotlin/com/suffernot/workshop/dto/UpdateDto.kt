package com.suffernot.workshop.dto

data class UpdateRuleSetRequest(
    val name: String,
    val description: String? = null,
    val isPublic: Boolean = true,
)

data class UpdateGeneralRuleRequest(
    val name: String,
    val description: String,
)

data class UpdateFactionRequest(
    val name: String,
    val description: String? = null,
)

data class UpdateFactionRuleRequest(
    val name: String,
    val description: String,
)
