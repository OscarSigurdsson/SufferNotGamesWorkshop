package com.suffernot.workshop.service

import com.suffernot.workshop.domain.RuleSet
import com.suffernot.workshop.domain.RuleSetKeyword
import com.suffernot.workshop.domain.UnitType
import com.suffernot.workshop.domain.WeaponType
import com.suffernot.workshop.domain.json.SimpleRule
import com.suffernot.workshop.dto.AddKeywordRequest
import com.suffernot.workshop.dto.CreateUnitTypeRequest
import com.suffernot.workshop.dto.CreateWeaponTypeRequest
import com.suffernot.workshop.dto.KeywordResponse
import com.suffernot.workshop.dto.SimpleRuleDto
import com.suffernot.workshop.dto.UnitTypeResponse
import com.suffernot.workshop.dto.UpdateAbilityRequest
import com.suffernot.workshop.dto.UpdateUnitTypeRequest
import com.suffernot.workshop.dto.UpdateWeaponTypeRequest
import com.suffernot.workshop.dto.WeaponTypeResponse
import com.suffernot.workshop.exception.ForbiddenException
import com.suffernot.workshop.exception.NotFoundException
import com.suffernot.workshop.repository.RuleSetKeywordRepository
import com.suffernot.workshop.repository.RuleSetRepository
import com.suffernot.workshop.repository.UnitTypeRepository
import com.suffernot.workshop.repository.WeaponTypeRepository
import com.suffernot.workshop.security.WorkshopUserDetails
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.util.UUID

@Service
class TypeService(
    private val ruleSetRepository: RuleSetRepository,
    private val ruleSetKeywordRepository: RuleSetKeywordRepository,
    private val unitTypeRepository: UnitTypeRepository,
    private val weaponTypeRepository: WeaponTypeRepository,
) {
    @Transactional
    fun createDefaultsForRuleSet(ruleSet: RuleSet) {
        unitTypeRepository.save(
            UnitType(
                name = "Standard",
                isStandard = true,
                statLine =
                    listOf(
                        "Movement",
                        "Strength",
                        "Toughness",
                        "Ballistic Skill",
                        "Weapon Skill",
                        "Wounds",
                        "Save",
                        "Leadership",
                    ),
                ruleSet = ruleSet,
            ),
        )
        weaponTypeRepository.save(
            WeaponType(
                name = "Melee",
                isDeletable = false,
                statLine = listOf("Strength", "Penetration", "Damage"),
                ruleSet = ruleSet,
            ),
        )
        weaponTypeRepository.save(
            WeaponType(
                name = "Ranged",
                isDeletable = false,
                statLine = listOf("Range", "Strength", "Penetration", "Damage"),
                ruleSet = ruleSet,
            ),
        )
    }

    fun getKeywordsForRuleSet(ruleSetId: UUID): List<KeywordResponse> =
        ruleSetKeywordRepository.findAllByRuleSetId(ruleSetId).map { it.toResponse() }

    fun getUnitTypesForRuleSet(ruleSetId: UUID): List<UnitTypeResponse> =
        unitTypeRepository.findAllByRuleSetId(ruleSetId).map { it.toResponse() }

    fun getWeaponTypesForRuleSet(ruleSetId: UUID): List<WeaponTypeResponse> =
        weaponTypeRepository.findAllByRuleSetId(ruleSetId).map { it.toResponse() }

    @Transactional
    fun addKeyword(
        ruleSetId: UUID,
        request: AddKeywordRequest,
        currentUser: WorkshopUserDetails,
    ): KeywordResponse {
        require(request.name.isNotBlank()) { "Ability name must not be blank" }
        val ruleSet = findAndCheckOwnership(ruleSetId, currentUser)
        val keyword =
            ruleSetKeywordRepository.save(
                RuleSetKeyword(name = request.name.trim(), description = request.description.trim(), ruleSet = ruleSet),
            )
        return keyword.toResponse()
    }

    @Transactional
    fun updateKeyword(
        ruleSetId: UUID,
        keywordId: UUID,
        request: UpdateAbilityRequest,
        currentUser: WorkshopUserDetails,
    ): KeywordResponse {
        require(request.name.isNotBlank()) { "Ability name must not be blank" }
        findAndCheckOwnership(ruleSetId, currentUser)
        val keyword =
            ruleSetKeywordRepository.findById(keywordId)
                .orElseThrow { NotFoundException("Ability $keywordId not found") }
        check(keyword.ruleSet.id == ruleSetId) { "Ability does not belong to rule set $ruleSetId" }
        keyword.name = request.name.trim()
        keyword.description = request.description.trim()
        return ruleSetKeywordRepository.save(keyword).toResponse()
    }

    @Transactional
    fun deleteKeyword(
        ruleSetId: UUID,
        keywordId: UUID,
        currentUser: WorkshopUserDetails,
    ) {
        findAndCheckOwnership(ruleSetId, currentUser)
        val keyword =
            ruleSetKeywordRepository.findById(keywordId)
                .orElseThrow { NotFoundException("Ability $keywordId not found") }
        check(keyword.ruleSet.id == ruleSetId) { "Ability does not belong to rule set $ruleSetId" }
        ruleSetKeywordRepository.delete(keyword)
    }

    @Transactional
    fun createUnitType(
        ruleSetId: UUID,
        request: CreateUnitTypeRequest,
        currentUser: WorkshopUserDetails,
    ): UnitTypeResponse {
        require(request.name.isNotBlank()) { "Unit type name must not be blank" }
        val ruleSet = findAndCheckOwnership(ruleSetId, currentUser)
        val type =
            unitTypeRepository.save(
                UnitType(
                    name = request.name.trim(),
                    statLine = request.statLine,
                    keywords = request.abilities,
                    rules = request.rules.map { SimpleRule(it.name, it.description) },
                    ruleSet = ruleSet,
                ),
            )
        return type.toResponse()
    }

    @Transactional
    fun updateUnitType(
        ruleSetId: UUID,
        typeId: UUID,
        request: UpdateUnitTypeRequest,
        currentUser: WorkshopUserDetails,
    ): UnitTypeResponse {
        require(request.name.isNotBlank()) { "Unit type name must not be blank" }
        findAndCheckOwnership(ruleSetId, currentUser)
        val type =
            unitTypeRepository.findById(typeId)
                .orElseThrow { NotFoundException("Unit type $typeId not found") }
        check(type.ruleSet.id == ruleSetId) { "Unit type does not belong to rule set $ruleSetId" }
        type.name = request.name.trim()
        type.statLine = request.statLine
        type.keywords = request.abilities
        type.rules = request.rules.map { SimpleRule(it.name, it.description) }
        return unitTypeRepository.save(type).toResponse()
    }

    @Transactional
    fun deleteUnitType(
        ruleSetId: UUID,
        typeId: UUID,
        currentUser: WorkshopUserDetails,
    ) {
        findAndCheckOwnership(ruleSetId, currentUser)
        val type =
            unitTypeRepository.findById(typeId)
                .orElseThrow { NotFoundException("Unit type $typeId not found") }
        check(type.ruleSet.id == ruleSetId) { "Unit type does not belong to rule set $ruleSetId" }
        require(!type.isStandard) { "The Standard unit type cannot be deleted" }
        unitTypeRepository.delete(type)
    }

    @Transactional
    fun createWeaponType(
        ruleSetId: UUID,
        request: CreateWeaponTypeRequest,
        currentUser: WorkshopUserDetails,
    ): WeaponTypeResponse {
        require(request.name.isNotBlank()) { "Weapon type name must not be blank" }
        val ruleSet = findAndCheckOwnership(ruleSetId, currentUser)
        val type =
            weaponTypeRepository.save(
                WeaponType(
                    name = request.name.trim(),
                    statLine = request.statLine,
                    keywords = request.abilities,
                    rules = request.rules.map { SimpleRule(it.name, it.description) },
                    ruleSet = ruleSet,
                ),
            )
        return type.toResponse()
    }

    @Transactional
    fun updateWeaponType(
        ruleSetId: UUID,
        typeId: UUID,
        request: UpdateWeaponTypeRequest,
        currentUser: WorkshopUserDetails,
    ): WeaponTypeResponse {
        require(request.name.isNotBlank()) { "Weapon type name must not be blank" }
        findAndCheckOwnership(ruleSetId, currentUser)
        val type =
            weaponTypeRepository.findById(typeId)
                .orElseThrow { NotFoundException("Weapon type $typeId not found") }
        check(type.ruleSet.id == ruleSetId) { "Weapon type does not belong to rule set $ruleSetId" }
        type.name = request.name.trim()
        type.statLine = request.statLine
        type.keywords = request.abilities
        type.rules = request.rules.map { SimpleRule(it.name, it.description) }
        return weaponTypeRepository.save(type).toResponse()
    }

    @Transactional
    fun deleteWeaponType(
        ruleSetId: UUID,
        typeId: UUID,
        currentUser: WorkshopUserDetails,
    ) {
        findAndCheckOwnership(ruleSetId, currentUser)
        val type =
            weaponTypeRepository.findById(typeId)
                .orElseThrow { NotFoundException("Weapon type $typeId not found") }
        check(type.ruleSet.id == ruleSetId) { "Weapon type does not belong to rule set $ruleSetId" }
        require(type.isDeletable) { "The ${type.name} weapon type cannot be deleted" }
        weaponTypeRepository.delete(type)
    }

    private fun findAndCheckOwnership(
        ruleSetId: UUID,
        currentUser: WorkshopUserDetails,
    ): RuleSet {
        val ruleSet =
            ruleSetRepository.findById(ruleSetId)
                .orElseThrow { NotFoundException("Rule set $ruleSetId not found") }
        if (ruleSet.owner?.id != currentUser.userId) throw ForbiddenException()
        return ruleSet
    }

    private fun RuleSetKeyword.toResponse() = KeywordResponse(id, name, description)

    private fun UnitType.toResponse() =
        UnitTypeResponse(
            id = id,
            name = name,
            isStandard = isStandard,
            statLine = statLine,
            abilities = keywords,
            rules = rules.map { SimpleRuleDto(it.name, it.description) },
        )

    private fun WeaponType.toResponse() =
        WeaponTypeResponse(
            id = id,
            name = name,
            isDeletable = isDeletable,
            statLine = statLine,
            abilities = keywords,
            rules = rules.map { SimpleRuleDto(it.name, it.description) },
        )
}
