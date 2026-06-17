package com.suffernot.workshop.controller

import com.suffernot.workshop.dto.CreateFactionRuleRequest
import com.suffernot.workshop.dto.CreateUnitRequest
import com.suffernot.workshop.dto.FactionResponse
import com.suffernot.workshop.dto.FactionRuleResponse
import com.suffernot.workshop.dto.UnitSummary
import com.suffernot.workshop.dto.UpdateFactionRequest
import com.suffernot.workshop.dto.UpdateFactionRuleRequest
import com.suffernot.workshop.dto.UpdateUnitRequest
import com.suffernot.workshop.security.WorkshopUserDetails
import com.suffernot.workshop.service.FactionService
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
@RequestMapping("/api/rule-sets/{ruleSetId}/factions")
class FactionController(private val factionService: FactionService) {
    @GetMapping("/{factionId}")
    fun getFaction(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
    ): ResponseEntity<FactionResponse> = ResponseEntity.ok(factionService.findById(ruleSetId, factionId))

    @PutMapping("/{factionId}")
    fun updateFaction(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @RequestBody request: UpdateFactionRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<FactionResponse> = ResponseEntity.ok(factionService.updateFaction(ruleSetId, factionId, request, user))

    @PostMapping("/{factionId}/faction-rules")
    fun addFactionRule(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @RequestBody request: CreateFactionRuleRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<FactionRuleResponse> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(factionService.addFactionRule(ruleSetId, factionId, request, user))

    @PutMapping("/{factionId}/faction-rules/{ruleId}")
    fun updateFactionRule(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable ruleId: UUID,
        @RequestBody request: UpdateFactionRuleRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<FactionRuleResponse> =
        ResponseEntity.ok(factionService.updateFactionRule(ruleSetId, factionId, ruleId, request, user))

    @PostMapping("/{factionId}/units")
    fun addUnit(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @RequestBody request: CreateUnitRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<UnitSummary> =
        ResponseEntity.status(HttpStatus.CREATED)
            .body(factionService.addUnit(ruleSetId, factionId, request, user))

    @PutMapping("/{factionId}/units/{unitId}")
    fun updateUnit(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable unitId: UUID,
        @RequestBody request: UpdateUnitRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<UnitSummary> = ResponseEntity.ok(factionService.updateUnit(ruleSetId, factionId, unitId, request, user))

    @DeleteMapping("/{factionId}")
    fun deleteFaction(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<Void> {
        factionService.deleteFaction(ruleSetId, factionId, user)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{factionId}/faction-rules/{ruleId}")
    fun deleteFactionRule(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable ruleId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<Void> {
        factionService.deleteFactionRule(ruleSetId, factionId, ruleId, user)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{factionId}/units/{unitId}")
    fun deleteUnit(
        @PathVariable ruleSetId: UUID,
        @PathVariable factionId: UUID,
        @PathVariable unitId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<Void> {
        factionService.deleteUnit(ruleSetId, factionId, unitId, user)
        return ResponseEntity.noContent().build()
    }
}
