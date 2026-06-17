package com.suffernot.workshop.controller

import com.suffernot.workshop.dto.CreateWeaponRequest
import com.suffernot.workshop.dto.CreateWeaponSetRequest
import com.suffernot.workshop.dto.UpdateWeaponRequest
import com.suffernot.workshop.dto.UpdateWeaponSetRequest
import com.suffernot.workshop.dto.WeaponResponse
import com.suffernot.workshop.dto.WeaponSetResponse
import com.suffernot.workshop.security.WorkshopUserDetails
import com.suffernot.workshop.service.WeaponService
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
@RequestMapping("/api/rule-sets/{ruleSetId}/factions/{factionId}")
class WeaponController(private val weaponService: WeaponService) {
    @GetMapping("/weapons")
    fun listWeapons(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
    ): ResponseEntity<List<WeaponResponse>> = ResponseEntity.ok(weaponService.getWeaponsForFaction(factionId))

    @PostMapping("/weapons")
    fun createWeapon(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @RequestBody request: CreateWeaponRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<WeaponResponse> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(weaponService.createWeapon(ruleSetId, factionId, request, user))

    @PutMapping("/weapons/{weaponId}")
    fun updateWeapon(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable weaponId: UUID,
        @RequestBody request: UpdateWeaponRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<WeaponResponse> = ResponseEntity.ok(weaponService.updateWeapon(ruleSetId, factionId, weaponId, request, user))

    @DeleteMapping("/weapons/{weaponId}")
    fun deleteWeapon(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable weaponId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<Void> {
        weaponService.deleteWeapon(ruleSetId, factionId, weaponId, user)
        return ResponseEntity.noContent().build()
    }

    @GetMapping("/units/{unitId}/weapon-sets")
    fun listWeaponSets(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable unitId: UUID,
    ): ResponseEntity<List<WeaponSetResponse>> = ResponseEntity.ok(weaponService.getWeaponSets(ruleSetId, factionId, unitId))

    @PostMapping("/units/{unitId}/weapon-sets")
    fun createWeaponSet(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable unitId: UUID,
        @RequestBody request: CreateWeaponSetRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<WeaponSetResponse> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(weaponService.createWeaponSet(ruleSetId, factionId, unitId, request, user))

    @PutMapping("/units/{unitId}/weapon-sets/{setId}")
    fun updateWeaponSet(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable unitId: UUID,
        @PathVariable setId: UUID,
        @RequestBody request: UpdateWeaponSetRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<WeaponSetResponse> =
        ResponseEntity.ok(weaponService.updateWeaponSet(ruleSetId, factionId, unitId, setId, request, user))

    @DeleteMapping("/units/{unitId}/weapon-sets/{setId}")
    fun deleteWeaponSet(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable unitId: UUID,
        @PathVariable setId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<Void> {
        weaponService.deleteWeaponSet(ruleSetId, factionId, unitId, setId, user)
        return ResponseEntity.noContent().build()
    }

    @PostMapping("/units/{unitId}/weapon-sets/{setId}/weapons/{weaponId}")
    fun addWeaponToSet(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable unitId: UUID,
        @PathVariable setId: UUID,
        @PathVariable weaponId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<WeaponSetResponse> =
        ResponseEntity.ok(weaponService.addWeaponToSet(ruleSetId, factionId, unitId, setId, weaponId, user))

    @DeleteMapping("/units/{unitId}/weapon-sets/{setId}/entries/{entryId}")
    fun removeEntryFromSet(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable unitId: UUID,
        @PathVariable setId: UUID,
        @PathVariable entryId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<WeaponSetResponse> =
        ResponseEntity.ok(weaponService.removeEntryFromSet(ruleSetId, factionId, unitId, setId, entryId, user))
}
