package com.suffernot.workshop.dto

import java.util.UUID

data class CreateGeneralRuleRequest(
    val name: String,
    val description: String,
)

data class GeneralRuleResponse(
    val id: UUID,
    val name: String,
    val description: String,
)
