package com.suffernot.workshop.service

import com.suffernot.workshop.domain.Weapon
import com.suffernot.workshop.domain.WeaponSet
import com.suffernot.workshop.domain.WeaponSetEntry
import com.suffernot.workshop.domain.json.SimpleRule
import com.suffernot.workshop.dto.CreateWeaponRequest
import com.suffernot.workshop.dto.CreateWeaponSetRequest
import com.suffernot.workshop.dto.SimpleRuleDto
import com.suffernot.workshop.dto.UpdateWeaponRequest
import com.suffernot.workshop.dto.UpdateWeaponSetRequest
import com.suffernot.workshop.dto.WeaponResponse
import com.suffernot.workshop.dto.WeaponSetEntryResponse
import com.suffernot.workshop.dto.WeaponSetResponse
import com.suffernot.workshop.exception.ForbiddenException
import com.suffernot.workshop.exception.NotFoundException
import com.suffernot.workshop.repository.FactionRepository
import com.suffernot.workshop.repository.GameUnitRepository
import com.suffernot.workshop.repository.WeaponRepository
import com.suffernot.workshop.repository.WeaponSetEntryRepository
import com.suffernot.workshop.repository.WeaponSetRepository
import com.suffernot.workshop.repository.WeaponTypeRepository
import com.suffernot.workshop.security.WorkshopUserDetails
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class WeaponService(
    private val weaponRepository: WeaponRepository,
    private val weaponSetRepository: WeaponSetRepository,
    private val weaponSetEntryRepository: WeaponSetEntryRepository,
    private val weaponTypeRepository: WeaponTypeRepository,
    private val factionRepository: FactionRepository,
    private val gameUnitRepository: GameUnitRepository,
) {
    fun getWeaponsForFaction(factionId: UUID): List<WeaponResponse> = weaponRepository.findAllByFactionId(factionId).map { it.toResponse() }

    @Transactional
    fun createWeapon(
        ruleSetId: UUID,
        factionId: UUID,
        request: CreateWeaponRequest,
        currentUser: WorkshopUserDetails,
    ): WeaponResponse {
        require(request.name.isNotBlank()) { "Weapon name must not be blank" }
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val weaponType =
            request.weaponTypeId?.let {
                weaponTypeRepository.findById(it)
                    .orElseThrow { NotFoundException("Weapon type $it not found") }
            }
        val weapon =
            weaponRepository.save(
                Weapon(
                    name = request.name.trim(),
                    pointsCost = request.pointsCost,
                    stats = request.stats,
                    keywords = request.abilities,
                    rules = request.rules.map { SimpleRule(it.name, it.description) },
                    weaponType = weaponType,
                    faction = faction,
                ),
            )
        return weapon.toResponse()
    }

    @Transactional
    fun updateWeapon(
        ruleSetId: UUID,
        factionId: UUID,
        weaponId: UUID,
        request: UpdateWeaponRequest,
        currentUser: WorkshopUserDetails,
    ): WeaponResponse {
        require(request.name.isNotBlank()) { "Weapon name must not be blank" }
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val weapon =
            weaponRepository.findById(weaponId)
                .orElseThrow { NotFoundException("Weapon $weaponId not found") }
        check(weapon.faction.id == factionId) { "Weapon does not belong to faction $factionId" }
        val weaponType =
            request.weaponTypeId?.let {
                weaponTypeRepository.findById(it)
                    .orElseThrow { NotFoundException("Weapon type $it not found") }
            }
        weapon.name = request.name.trim()
        weapon.pointsCost = request.pointsCost
        weapon.stats = request.stats
        weapon.keywords = request.abilities
        weapon.rules = request.rules.map { SimpleRule(it.name, it.description) }
        weapon.weaponType = weaponType
        return weaponRepository.save(weapon).toResponse()
    }

    @Transactional
    fun deleteWeapon(
        ruleSetId: UUID,
        factionId: UUID,
        weaponId: UUID,
        currentUser: WorkshopUserDetails,
    ) {
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val weapon =
            weaponRepository.findById(weaponId)
                .orElseThrow { NotFoundException("Weapon $weaponId not found") }
        check(weapon.faction.id == factionId) { "Weapon does not belong to faction $factionId" }
        weaponSetRepository.removeWeaponFromAllSets(weaponId)
        weaponRepository.delete(weapon)
    }

    @Transactional(readOnly = true)
    fun getWeaponSets(
        ruleSetId: UUID,
        factionId: UUID,
        unitId: UUID,
    ): List<WeaponSetResponse> {
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        val unit =
            gameUnitRepository.findById(unitId)
                .orElseThrow { NotFoundException("Unit $unitId not found") }
        check(unit.faction.id == factionId) { "Unit does not belong to faction $factionId" }
        return weaponSetRepository.findAllByUnitId(unitId).map { it.toResponse() }
    }

    @Transactional
    fun createWeaponSet(
        ruleSetId: UUID,
        factionId: UUID,
        unitId: UUID,
        request: CreateWeaponSetRequest,
        currentUser: WorkshopUserDetails,
    ): WeaponSetResponse {
        require(request.name.isNotBlank()) { "Weapon set name must not be blank" }
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val unit =
            gameUnitRepository.findById(unitId)
                .orElseThrow { NotFoundException("Unit $unitId not found") }
        check(unit.faction.id == factionId) { "Unit does not belong to faction $factionId" }
        if (request.isDefault) {
            weaponSetRepository.findAllByUnitId(unitId).forEach { existing ->
                existing.isDefault = false
                weaponSetRepository.save(existing)
            }
        }
        val set =
            weaponSetRepository.save(
                WeaponSet(name = request.name.trim(), isDefault = request.isDefault, unit = unit),
            )
        return set.toResponse()
    }

    @Transactional
    fun updateWeaponSet(
        ruleSetId: UUID,
        factionId: UUID,
        unitId: UUID,
        setId: UUID,
        request: UpdateWeaponSetRequest,
        currentUser: WorkshopUserDetails,
    ): WeaponSetResponse {
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val unit =
            gameUnitRepository.findById(unitId)
                .orElseThrow { NotFoundException("Unit $unitId not found") }
        check(unit.faction.id == factionId) { "Unit does not belong to faction $factionId" }
        val set =
            weaponSetRepository.findById(setId)
                .orElseThrow { NotFoundException("Weapon set $setId not found") }
        check(set.unit.id == unitId) { "Weapon set does not belong to unit $unitId" }
        request.name?.let {
            require(it.isNotBlank()) { "Weapon set name must not be blank" }
            set.name = it.trim()
        }
        if (request.isDefault == true) {
            weaponSetRepository.findAllByUnitId(unitId).forEach { existing ->
                if (existing.id != setId) {
                    existing.isDefault = false
                    weaponSetRepository.save(existing)
                }
            }
            set.isDefault = true
        } else if (request.isDefault == false) {
            set.isDefault = false
        }
        set.overriddenPointsCost = if (request.clearOverride) null else (request.overriddenPointsCost ?: set.overriddenPointsCost)
        return weaponSetRepository.save(set).toResponse()
    }

    @Transactional
    fun deleteWeaponSet(
        ruleSetId: UUID,
        factionId: UUID,
        unitId: UUID,
        setId: UUID,
        currentUser: WorkshopUserDetails,
    ) {
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val set =
            weaponSetRepository.findById(setId)
                .orElseThrow { NotFoundException("Weapon set $setId not found") }
        check(set.unit.id == unitId) { "Weapon set does not belong to unit $unitId" }
        weaponSetRepository.deleteEntriesForSet(setId)
        weaponSetRepository.delete(set)
    }

    @Transactional
    fun addWeaponToSet(
        ruleSetId: UUID,
        factionId: UUID,
        unitId: UUID,
        setId: UUID,
        weaponId: UUID,
        currentUser: WorkshopUserDetails,
    ): WeaponSetResponse {
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val set =
            weaponSetRepository.findById(setId)
                .orElseThrow { NotFoundException("Weapon set $setId not found") }
        check(set.unit.id == unitId) { "Weapon set does not belong to unit $unitId" }
        val weapon =
            weaponRepository.findById(weaponId)
                .orElseThrow { NotFoundException("Weapon $weaponId not found") }
        check(weapon.faction.id == factionId) { "Weapon does not belong to faction $factionId" }
        weaponSetEntryRepository.save(WeaponSetEntry(weaponSet = set, weapon = weapon))
        return weaponSetRepository.findById(setId).get().toResponse()
    }

    @Transactional
    fun removeEntryFromSet(
        ruleSetId: UUID,
        factionId: UUID,
        unitId: UUID,
        setId: UUID,
        entryId: UUID,
        currentUser: WorkshopUserDetails,
    ): WeaponSetResponse {
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val set =
            weaponSetRepository.findById(setId)
                .orElseThrow { NotFoundException("Weapon set $setId not found") }
        check(set.unit.id == unitId) { "Weapon set does not belong to unit $unitId" }
        val entry =
            weaponSetEntryRepository.findById(entryId)
                .orElseThrow { NotFoundException("Entry $entryId not found") }
        check(entry.weaponSet.id == setId) { "Entry does not belong to weapon set $setId" }
        weaponSetEntryRepository.delete(entry)
        return weaponSetRepository.findById(setId).get().toResponse()
    }

    private fun Weapon.toResponse() =
        WeaponResponse(
            id = id,
            name = name,
            pointsCost = pointsCost,
            weaponTypeName = weaponType?.name,
            stats = stats,
            abilities = keywords,
            rules = rules.map { SimpleRuleDto(it.name, it.description) },
        )

    private fun WeaponSet.toResponse(): WeaponSetResponse {
        val entryResponses =
            entries.map { entry ->
                WeaponSetEntryResponse(
                    entryId = entry.id,
                    weaponId = entry.weapon.id,
                    name = entry.weapon.name,
                    pointsCost = entry.weapon.pointsCost,
                    weaponTypeName = entry.weapon.weaponType?.name,
                )
            }
        return WeaponSetResponse(
            id = id,
            name = name,
            isDefault = isDefault,
            overriddenPointsCost = overriddenPointsCost,
            entries = entryResponses,
            effectivePointsCost = overriddenPointsCost ?: entryResponses.sumOf { it.pointsCost },
        )
    }
}
