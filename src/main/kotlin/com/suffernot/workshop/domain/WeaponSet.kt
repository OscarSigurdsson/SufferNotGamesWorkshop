package com.suffernot.workshop.domain

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.util.UUID

@Entity
@Table(name = "weapon_sets")
class WeaponSet(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(nullable = false)
    var name: String,
    @Column(name = "is_default", nullable = false)
    var isDefault: Boolean = false,
    @Column(name = "overridden_points_cost")
    var overriddenPointsCost: Int? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_id", nullable = false)
    val unit: GameUnit,
    @OneToMany(mappedBy = "weaponSet", fetch = FetchType.LAZY)
    val entries: List<WeaponSetEntry> = emptyList(),
)
