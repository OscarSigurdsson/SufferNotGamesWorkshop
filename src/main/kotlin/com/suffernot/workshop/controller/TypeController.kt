package com.suffernot.workshop.controller

import com.suffernot.workshop.dto.AddKeywordRequest
import com.suffernot.workshop.dto.CreateUnitTypeRequest
import com.suffernot.workshop.dto.CreateWeaponTypeRequest
import com.suffernot.workshop.dto.KeywordResponse
import com.suffernot.workshop.dto.UnitTypeResponse
import com.suffernot.workshop.dto.UpdateAbilityRequest
import com.suffernot.workshop.dto.UpdateUnitTypeRequest
import com.suffernot.workshop.dto.UpdateWeaponTypeRequest
import com.suffernot.workshop.dto.WeaponTypeResponse
import com.suffernot.workshop.security.WorkshopUserDetails
import com.suffernot.workshop.service.TypeService
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.UUID

@RestController
@RequestMapping("/api/rule-sets/{ruleSetId}")
class TypeController(private val typeService: TypeService) {
    @GetMapping("/abilities")
    fun listAbilities(
        @PathVariable ruleSetId: UUID,
    ): ResponseEntity<List<KeywordResponse>> = ResponseEntity.ok(typeService.getKeywordsForRuleSet(ruleSetId))

    @PostMapping("/abilities")
    fun addAbility(
        @PathVariable ruleSetId: UUID,
        @RequestBody request: AddKeywordRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<KeywordResponse> = ResponseEntity.status(HttpStatus.CREATED).body(typeService.addKeyword(ruleSetId, request, user))

    @PutMapping("/abilities/{abilityId}")
    fun updateAbility(
        @PathVariable ruleSetId: UUID,
        @PathVariable abilityId: UUID,
        @RequestBody request: UpdateAbilityRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<KeywordResponse> = ResponseEntity.ok(typeService.updateKeyword(ruleSetId, abilityId, request, user))

    @DeleteMapping("/abilities/{abilityId}")
    fun deleteAbility(
        @PathVariable ruleSetId: UUID,
        @PathVariable abilityId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<Void> {
        typeService.deleteKeyword(ruleSetId, abilityId, user)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/unit-types")
    fun listUnitTypes(
        @PathVariable ruleSetId: UUID,
    ): ResponseEntity<List<UnitTypeResponse>> = ResponseEntity.ok(typeService.getUnitTypesForRuleSet(ruleSetId))

    @PostMapping("/unit-types")
    fun createUnitType(
        @PathVariable ruleSetId: UUID,
        @RequestBody request: CreateUnitTypeRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<UnitTypeResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(typeService.createUnitType(ruleSetId, request, user))

    @PutMapping("/unit-types/{typeId}")
    fun updateUnitType(
        @PathVariable ruleSetId: UUID,
        @PathVariable typeId: UUID,
        @RequestBody request: UpdateUnitTypeRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<UnitTypeResponse> = ResponseEntity.ok(typeService.updateUnitType(ruleSetId, typeId, request, user))

    @DeleteMapping("/unit-types/{typeId}")
    fun deleteUnitType(
        @PathVariable ruleSetId: UUID,
        @PathVariable typeId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<Void> {
        typeService.deleteUnitType(ruleSetId, typeId, user)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/weapon-types")
    fun listWeaponTypes(
        @PathVariable ruleSetId: UUID,
    ): ResponseEntity<List<WeaponTypeResponse>> = ResponseEntity.ok(typeService.getWeaponTypesForRuleSet(ruleSetId))

    @PostMapping("/weapon-types")
    fun createWeaponType(
        @PathVariable ruleSetId: UUID,
        @RequestBody request: CreateWeaponTypeRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<WeaponTypeResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(typeService.createWeaponType(ruleSetId, request, user))

    @PutMapping("/weapon-types/{typeId}")
    fun updateWeaponType(
        @PathVariable ruleSetId: UUID,
        @PathVariable typeId: UUID,
        @RequestBody request: UpdateWeaponTypeRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<WeaponTypeResponse> = ResponseEntity.ok(typeService.updateWeaponType(ruleSetId, typeId, request, user))

    @DeleteMapping("/weapon-types/{typeId}")
    fun deleteWeaponType(
        @PathVariable ruleSetId: UUID,
        @PathVariable typeId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<Void> {
        typeService.deleteWeaponType(ruleSetId, typeId, user)
        return ResponseEntity.noContent().build()
    }
}
