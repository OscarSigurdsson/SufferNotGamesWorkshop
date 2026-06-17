package com.suffernot.workshop.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "users")
class User(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(nullable = false, unique = true, length = 100)
    val username: String,
    @Column(nullable = false, unique = true)
    val email: String,
    @Column(nullable = false)
    val passwordHash: String,
)
