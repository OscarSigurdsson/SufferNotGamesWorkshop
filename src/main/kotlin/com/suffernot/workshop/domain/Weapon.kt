package com.suffernot.workshop.domain

import com.suffernot.workshop.domain.json.SimpleRule
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.FetchType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.ManyToOne
import jakarta.persistence.Table
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.type.SqlTypes
import java.util.UUID

@Entity
@Table(name = "weapons")
class Weapon(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(nullable = false)
    var name: String,
    @Column(name = "points_cost", nullable = false)
    var pointsCost: Int = 0,
    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    var stats: Map<String, String> = emptyMap(),
    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    var keywords: List<String> = emptyList(),
    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    var rules: List<SimpleRule> = emptyList(),
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "weapon_type_id")
    var weaponType: WeaponType? = null,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faction_id", nullable = false)
    val faction: Faction,
)
