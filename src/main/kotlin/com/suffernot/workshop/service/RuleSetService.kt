package com.suffernot.workshop.service

import com.suffernot.workshop.domain.Faction
import com.suffernot.workshop.domain.GeneralRule
import com.suffernot.workshop.domain.RuleSet
import com.suffernot.workshop.dto.CreateFactionRequest
import com.suffernot.workshop.dto.CreateGeneralRuleRequest
import com.suffernot.workshop.dto.CreateRuleSetRequest
import com.suffernot.workshop.dto.FactionSummary
import com.suffernot.workshop.dto.GeneralRuleResponse
import com.suffernot.workshop.dto.RuleSetResponse
import com.suffernot.workshop.dto.RuleSetSummary
import com.suffernot.workshop.dto.UpdateGeneralRuleRequest
import com.suffernot.workshop.dto.UpdateRuleSetRequest
import com.suffernot.workshop.exception.ForbiddenException
import com.suffernot.workshop.exception.NotFoundException
import com.suffernot.workshop.repository.FactionRepository
import com.suffernot.workshop.repository.FactionRuleRepository
import com.suffernot.workshop.repository.GameUnitRepository
import com.suffernot.workshop.repository.GeneralRuleRepository
import com.suffernot.workshop.repository.RuleSetKeywordRepository
import com.suffernot.workshop.repository.RuleSetRepository
import com.suffernot.workshop.repository.UnitTypeRepository
import com.suffernot.workshop.repository.UserRepository
import com.suffernot.workshop.repository.WeaponRepository
import com.suffernot.workshop.repository.WeaponSetRepository
import com.suffernot.workshop.repository.WeaponTypeRepository
import com.suffernot.workshop.security.WorkshopUserDetails
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class RuleSetService(
    private val ruleSetRepository: RuleSetRepository,
    private val generalRuleRepository: GeneralRuleRepository,
    private val factionRepository: FactionRepository,
    private val factionRuleRepository: FactionRuleRepository,
    private val gameUnitRepository: GameUnitRepository,
    private val userRepository: UserRepository,
    private val typeService: TypeService,
    private val ruleSetKeywordRepository: RuleSetKeywordRepository,
    private val unitTypeRepository: UnitTypeRepository,
    private val weaponTypeRepository: WeaponTypeRepository,
    private val weaponRepository: WeaponRepository,
    private val weaponSetRepository: WeaponSetRepository,
) {
    fun findVisible(currentUser: WorkshopUserDetails): List<RuleSetSummary> =
        ruleSetRepository.findVisibleToUser(currentUser.userId).map { it.toSummary(currentUser.userId) }

    @Transactional(readOnly = true)
    fun findById(
        id: UUID,
        currentUser: WorkshopUserDetails,
    ): RuleSetResponse {
        val ruleSet =
            ruleSetRepository.findById(id)
                .orElseThrow { NotFoundException("Rule set $id not found") }
        val generalRules =
            generalRuleRepository.findAllByRuleSetId(id)
                .map { GeneralRuleResponse(it.id, it.name, it.description) }
        val factions =
            factionRepository.findAllByRuleSetId(id)
                .map { FactionSummary(it.id, it.name, it.description) }
        return RuleSetResponse(
            id = ruleSet.id,
            name = ruleSet.name,
            description = ruleSet.description,
            isPublic = ruleSet.isPublic,
            ownerUsername = ruleSet.owner?.username,
            isOwner = ruleSet.owner?.id == currentUser.userId,
            generalRules = generalRules,
            factions = factions,
            abilities = typeService.getKeywordsForRuleSet(id),
            unitTypes = typeService.getUnitTypesForRuleSet(id),
            weaponTypes = typeService.getWeaponTypesForRuleSet(id),
        )
    }

    @Transactional
    fun create(
        request: CreateRuleSetRequest,
        currentUser: WorkshopUserDetails,
    ): RuleSetSummary {
        require(request.name.isNotBlank()) { "Rule set name must not be blank" }
        val owner = userRepository.getReferenceById(currentUser.userId)
        val ruleSet =
            ruleSetRepository.save(
                RuleSet(name = request.name, description = request.description, owner = owner, isPublic = request.isPublic),
            )
        typeService.createDefaultsForRuleSet(ruleSet)
        return ruleSet.toSummary(currentUser.userId)
    }

    @Transactional
    fun addGeneralRule(
        ruleSetId: UUID,
        request: CreateGeneralRuleRequest,
        currentUser: WorkshopUserDetails,
    ): GeneralRuleResponse {
        require(request.name.isNotBlank()) { "Rule name must not be blank" }
        val ruleSet =
            ruleSetRepository.findById(ruleSetId)
                .orElseThrow { NotFoundException("Rule set $ruleSetId not found") }
        if (ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val rule =
            generalRuleRepository.save(
                GeneralRule(name = request.name, description = request.description, ruleSet = ruleSet),
            )
        return GeneralRuleResponse(rule.id, rule.name, rule.description)
    }

    @Transactional
    fun addFaction(
        ruleSetId: UUID,
        request: CreateFactionRequest,
        currentUser: WorkshopUserDetails,
    ): FactionSummary {
        require(request.name.isNotBlank()) { "Faction name must not be blank" }
        val ruleSet =
            ruleSetRepository.findById(ruleSetId)
                .orElseThrow { NotFoundException("Rule set $ruleSetId not found") }
        if (ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val faction =
            factionRepository.save(
                Faction(name = request.name, description = request.description, ruleSet = ruleSet),
            )
        return FactionSummary(faction.id, faction.name, faction.description)
    }

    @Transactional
    fun updateRuleSet(
        id: UUID,
        request: UpdateRuleSetRequest,
        currentUser: WorkshopUserDetails,
    ): RuleSetSummary {
        require(request.name.isNotBlank()) { "Rule set name must not be blank" }
        val ruleSet =
            ruleSetRepository.findById(id)
                .orElseThrow { NotFoundException("Rule set $id not found") }
        if (ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        ruleSet.name = request.name.trim()
        ruleSet.description = request.description?.trim()
        ruleSet.isPublic = request.isPublic
        return ruleSetRepository.save(ruleSet).toSummary(currentUser.userId)
    }

    @Transactional
    fun updateGeneralRule(
        ruleSetId: UUID,
        ruleId: UUID,
        request: UpdateGeneralRuleRequest,
        currentUser: WorkshopUserDetails,
    ): GeneralRuleResponse {
        require(request.name.isNotBlank()) { "Rule name must not be blank" }
        val ruleSet =
            ruleSetRepository.findById(ruleSetId)
                .orElseThrow { NotFoundException("Rule set $ruleSetId not found") }
        if (ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val rule =
            generalRuleRepository.findById(ruleId)
                .orElseThrow { NotFoundException("General rule $ruleId not found") }
        check(rule.ruleSet.id == ruleSetId) { "Rule does not belong to rule set $ruleSetId" }
        rule.name = request.name.trim()
        rule.description = request.description.trim()
        return generalRuleRepository.save(rule).let { GeneralRuleResponse(it.id, it.name, it.description) }
    }

    @Transactional
    fun deleteRuleSet(
        id: UUID,
        currentUser: WorkshopUserDetails,
    ) {
        val ruleSet =
            ruleSetRepository.findById(id)
                .orElseThrow { NotFoundException("Rule set $id not found") }
        if (ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        weaponSetRepository.deleteEntriesForRuleSet(id)
        weaponSetRepository.deleteAllByUnitFactionRuleSetId(id)
        weaponRepository.deleteAllByFactionRuleSetId(id)
        gameUnitRepository.deleteAllByFactionRuleSetId(id)
        factionRuleRepository.deleteAllByFactionRuleSetId(id)
        factionRepository.deleteAllByRuleSetId(id)
        generalRuleRepository.deleteAllByRuleSetId(id)
        unitTypeRepository.deleteAllByRuleSetId(id)
        weaponTypeRepository.deleteAllByRuleSetId(id)
        ruleSetKeywordRepository.deleteAllByRuleSetId(id)
        ruleSetRepository.delete(ruleSet)
    }

    @Transactional
    fun deleteGeneralRule(
        ruleSetId: UUID,
        ruleId: UUID,
        currentUser: WorkshopUserDetails,
    ) {
        val ruleSet =
            ruleSetRepository.findById(ruleSetId)
                .orElseThrow { NotFoundException("Rule set $ruleSetId not found") }
        if (ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        val rule =
            generalRuleRepository.findById(ruleId)
                .orElseThrow { NotFoundException("General rule $ruleId not found") }
        check(rule.ruleSet.id == ruleSetId) { "Rule does not belong to rule set $ruleSetId" }
        generalRuleRepository.delete(rule)
    }

    private fun RuleSet.toSummary(currentUserId: UUID) =
        RuleSetSummary(
            id = id,
            name = name,
            description = description,
            isPublic = isPublic,
            ownerUsername = owner?.username,
            isOwner = owner?.id == currentUserId,
        )
}
