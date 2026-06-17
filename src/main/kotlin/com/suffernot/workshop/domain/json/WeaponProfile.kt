package com.suffernot.workshop.domain.json

data class WeaponProfile(
    val name: String = "",
    val range: String = "",
    val attacks: String = "",
    val skill: String = "",
    val strength: Int = 0,
    val armorPenetration: Int = 0,
    val damage: String = "",
    val abilities: List<String> = emptyList(),
)
