package com.suffernot.workshop.dto

import java.util.UUID

data class RegisterRequest(
    val username: String,
    val email: String,
    val password: String,
)

data class LoginRequest(
    val username: String,
    val password: String,
)

data class UserResponse(
    val id: UUID,
    val username: String,
    val email: String,
)
