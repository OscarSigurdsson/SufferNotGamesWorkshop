package com.suffernot.workshop.dto

import java.util.UUID

data class CreateFactionRuleRequest(
    val name: String,
    val description: String,
)

data class FactionRuleResponse(
    val id: UUID,
    val name: String,
    val description: String,
)
