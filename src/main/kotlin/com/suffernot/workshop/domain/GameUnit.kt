package com.suffernot.workshop.domain

import com.suffernot.workshop.domain.json.WeaponProfile
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
@Table(name = "units")
class GameUnit(
    @Id
    val id: UUID = UUID.randomUUID(),
    @Column(nullable = false)
    var name: String,
    @Column(nullable = false)
    var pointsCost: Int = 0,
    @Column(nullable = false)
    var modelCount: String = "1 model",
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faction_id", nullable = false)
    val faction: Faction,
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unit_type_id")
    var unitType: UnitType? = null,
    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    var stats: Map<String, String> = emptyMap(),
    @Column(name = "ranged_weapons", columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    var rangedWeapons: List<WeaponProfile> = emptyList(),
    @Column(name = "melee_weapons", columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    var meleeWeapons: List<WeaponProfile> = emptyList(),
    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    var abilities: List<String> = emptyList(),
    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    var keywords: List<String> = emptyList(),
    @Column(name = "faction_keywords", columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    var factionKeywords: List<String> = emptyList(),
)
