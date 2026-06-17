package com.suffernot.workshop.domain

import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "weapon_set_entries")
class WeaponSetEntry(
    @Id
    val id: UUID = UUID.randomUUID(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weapon_set_id", nullable = false)
    val weaponSet: WeaponSet,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weapon_id", nullable = false)
    val weapon: Weapon,
)
