package com.suffernot.workshop.service

import com.suffernot.workshop.domain.FactionRule
import com.suffernot.workshop.domain.GameUnit
import com.suffernot.workshop.dto.CreateFactionRuleRequest
import com.suffernot.workshop.dto.CreateUnitRequest
import com.suffernot.workshop.dto.FactionResponse
import com.suffernot.workshop.dto.FactionRuleResponse
import com.suffernot.workshop.dto.SimpleRuleDto
import com.suffernot.workshop.dto.UnitSummary
import com.suffernot.workshop.dto.UpdateFactionRequest
import com.suffernot.workshop.dto.UpdateFactionRuleRequest
import com.suffernot.workshop.dto.UpdateUnitRequest
import com.suffernot.workshop.dto.WeaponResponse
import com.suffernot.workshop.exception.ForbiddenException
import com.suffernot.workshop.exception.NotFoundException
import com.suffernot.workshop.repository.FactionRepository
import com.suffernot.workshop.repository.FactionRuleRepository
import com.suffernot.workshop.repository.GameUnitRepository
import com.suffernot.workshop.repository.UnitTypeRepository
import com.suffernot.workshop.repository.WeaponRepository
import com.suffernot.workshop.repository.WeaponSetRepository
import com.suffernot.workshop.security.WorkshopUserDetails
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class FactionService(
    private val factionRepository: FactionRepository,
    private val factionRuleRepository: FactionRuleRepository,
    private val gameUnitRepository: GameUnitRepository,
    private val unitTypeRepository: UnitTypeRepository,
    private val weaponRepository: WeaponRepository,
    private val weaponSetRepository: WeaponSetRepository,
) {
    @Transactional(readOnly = true)
    fun findById(
        ruleSetId: UUID,
        factionId: UUID,
    ): FactionResponse {
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        val factionRules =
            factionRuleRepository.findAllByFactionId(factionId)
                .map { FactionRuleResponse(it.id, it.name, it.description) }
        val units =
            gameUnitRepository.findAllByFactionId(factionId).map { unit ->
                UnitSummary(
                    id = unit.id,
                    name = unit.name,
                    pointsCost = unit.pointsCost,
                    unitTypeName = unit.unitType?.name,
                    weaponSetCount = weaponSetRepository.findAllByUnitId(unit.id).size,
                    stats = unit.stats,
                    abilities = unit.abilities,
                )
            }
        val weapons =
            weaponRepository.findAllByFactionId(factionId).map { w ->
                WeaponResponse(
                    id = w.id,
                    name = w.name,
                    pointsCost = w.pointsCost,
                    weaponTypeName = w.weaponType?.name,
                    stats = w.stats,
                    abilities = w.keywords,
                    rules = w.rules.map { SimpleRuleDto(it.name, it.description) },
                )
            }
        return FactionResponse(faction.id, faction.name, faction.description, factionRules, units, weapons)
    }

    @Transactional
    fun updateFaction(
        ruleSetId: UUID,
        factionId: UUID,
        request: UpdateFactionRequest,
        currentUser: WorkshopUserDetails,
    ): FactionResponse {
        require(request.name.isNotBlank()) { "Faction name must not be blank" }
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        faction.name = request.name.trim()
        faction.description = request.description?.trim()
        factionRepository.save(faction)
        return findById(ruleSetId, factionId)
    }

    @Transactional
    fun addFactionRule(
        ruleSetId: UUID,
        factionId: UUID,
        request: CreateFactionRuleRequest,
        currentUser: WorkshopUserDetails,
    ): FactionRuleResponse {
        require(request.name.isNotBlank()) { "Rule name must not be blank" }
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val rule =
            factionRuleRepository.save(
                FactionRule(name = request.name, description = request.description, faction = faction),
            )
        return FactionRuleResponse(rule.id, rule.name, rule.description)
    }

    @Transactional
    fun updateFactionRule(
        ruleSetId: UUID,
        factionId: UUID,
        ruleId: UUID,
        request: UpdateFactionRuleRequest,
        currentUser: WorkshopUserDetails,
    ): FactionRuleResponse {
        require(request.name.isNotBlank()) { "Rule name must not be blank" }
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val rule =
            factionRuleRepository.findById(ruleId)
                .orElseThrow { NotFoundException("Faction rule $ruleId not found") }
        check(rule.faction.id == factionId) { "Rule does not belong to faction $factionId" }
        rule.name = request.name.trim()
        rule.description = request.description.trim()
        return factionRuleRepository.save(rule).let { FactionRuleResponse(it.id, it.name, it.description) }
    }

    @Transactional
    fun addUnit(
        ruleSetId: UUID,
        factionId: UUID,
        request: CreateUnitRequest,
        currentUser: WorkshopUserDetails,
    ): UnitSummary {
        require(request.name.isNotBlank()) { "Unit name must not be blank" }
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val unitType =
            request.unitTypeId?.let {
                unitTypeRepository.findById(it)
                    .orElseThrow { NotFoundException("Unit type $it not found") }
            }
        val unit =
            gameUnitRepository.save(
                GameUnit(
                    name = request.name.trim(),
                    pointsCost = request.pointsCost,
                    faction = faction,
                    unitType = unitType,
                    stats = request.stats,
                    abilities = request.abilities,
                ),
            )
        return UnitSummary(unit.id, unit.name, unit.pointsCost, unit.unitType?.name, 0, unit.stats, unit.abilities)
    }

    @Transactional
    fun updateUnit(
        ruleSetId: UUID,
        factionId: UUID,
        unitId: UUID,
        request: UpdateUnitRequest,
        currentUser: WorkshopUserDetails,
    ): UnitSummary {
        require(request.name.isNotBlank()) { "Unit name must not be blank" }
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val unit =
            gameUnitRepository.findById(unitId)
                .orElseThrow { NotFoundException("Unit $unitId not found") }
        check(unit.faction.id == factionId) { "Unit does not belong to faction $factionId" }
        val unitType =
            request.unitTypeId?.let {
                unitTypeRepository.findById(it)
                    .orElseThrow { NotFoundException("Unit type $it not found") }
            }
        unit.name = request.name.trim()
        unit.pointsCost = request.pointsCost
        unit.unitType = unitType
        unit.stats = request.stats
        unit.abilities = request.abilities
        val saved = gameUnitRepository.save(unit)
        val setCount = weaponSetRepository.findAllByUnitId(unitId).size
        return UnitSummary(saved.id, saved.name, saved.pointsCost, saved.unitType?.name, setCount, saved.stats, saved.abilities)
    }

    @Transactional
    fun deleteFaction(
        ruleSetId: UUID,
        factionId: UUID,
        currentUser: WorkshopUserDetails,
    ) {
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        weaponSetRepository.deleteEntriesForFaction(factionId)
        weaponSetRepository.deleteAllByUnitFactionId(factionId)
        gameUnitRepository.deleteAllByFactionId(factionId)
        weaponRepository.deleteAllByFactionId(factionId)
        factionRuleRepository.deleteAllByFactionId(factionId)
        factionRepository.delete(faction)
    }

    @Transactional
    fun deleteFactionRule(
        ruleSetId: UUID,
        factionId: UUID,
        ruleId: UUID,
        currentUser: WorkshopUserDetails,
    ) {
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val rule =
            factionRuleRepository.findById(ruleId)
                .orElseThrow { NotFoundException("Faction rule $ruleId not found") }
        check(rule.faction.id == factionId) { "Rule does not belong to faction $factionId" }
        factionRuleRepository.delete(rule)
    }

    @Transactional
    fun deleteUnit(
        ruleSetId: UUID,
        factionId: UUID,
        unitId: UUID,
        currentUser: WorkshopUserDetails,
    ) {
        val faction =
            factionRepository.findById(factionId)
                .orElseThrow { NotFoundException("Faction $factionId not found") }
        check(faction.ruleSet.id == ruleSetId) { "Faction does not belong to rule set $ruleSetId" }
        if (faction.ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val unit =
            gameUnitRepository.findById(unitId)
                .orElseThrow { NotFoundException("Unit $unitId not found") }
        check(unit.faction.id == factionId) { "Unit does not belong to faction $factionId" }
        weaponSetRepository.deleteEntriesForUnit(unitId)
        weaponSetRepository.deleteAllByUnitId(unitId)
        gameUnitRepository.delete(unit)
    }
}
