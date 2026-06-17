package com.suffernot.workshop.controller

import com.suffernot.workshop.dto.CreateFactionRequest
import com.suffernot.workshop.dto.CreateGeneralRuleRequest
import com.suffernot.workshop.dto.CreateRuleSetRequest
import com.suffernot.workshop.dto.FactionSummary
import com.suffernot.workshop.dto.GeneralRuleResponse
import com.suffernot.workshop.dto.RuleSetResponse
import com.suffernot.workshop.dto.RuleSetSummary
import com.suffernot.workshop.dto.UpdateGeneralRuleRequest
import com.suffernot.workshop.dto.UpdateRuleSetRequest
import com.suffernot.workshop.security.WorkshopUserDetails
import com.suffernot.workshop.service.RuleSetService
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
@RequestMapping("/api/rule-sets")
class RuleSetController(private val ruleSetService: RuleSetService) {
    @GetMapping
    fun listRuleSets(
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<List<RuleSetSummary>> = ResponseEntity.ok(ruleSetService.findVisible(user))

    @PostMapping
    fun createRuleSet(
        @RequestBody request: CreateRuleSetRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<RuleSetSummary> = ResponseEntity.status(HttpStatus.CREATED).body(ruleSetService.create(request, user))

    @GetMapping("/{id}")
    fun getRuleSet(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<RuleSetResponse> = ResponseEntity.ok(ruleSetService.findById(id, user))

    @PutMapping("/{id}")
    fun updateRuleSet(
        @PathVariable id: UUID,
        @RequestBody request: UpdateRuleSetRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<RuleSetSummary> = ResponseEntity.ok(ruleSetService.updateRuleSet(id, request, user))

    @PostMapping("/{id}/general-rules")
    fun addGeneralRule(
        @PathVariable id: UUID,
        @RequestBody request: CreateGeneralRuleRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<GeneralRuleResponse> =
        ResponseEntity.status(HttpStatus.CREATED).body(ruleSetService.addGeneralRule(id, request, user))

    @PutMapping("/{id}/general-rules/{ruleId}")
    fun updateGeneralRule(
        @PathVariable id: UUID,
        @PathVariable ruleId: UUID,
        @RequestBody request: UpdateGeneralRuleRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<GeneralRuleResponse> = ResponseEntity.ok(ruleSetService.updateGeneralRule(id, ruleId, request, user))

    @PostMapping("/{id}/factions")
    fun addFaction(
        @PathVariable id: UUID,
        @RequestBody request: CreateFactionRequest,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<FactionSummary> = ResponseEntity.status(HttpStatus.CREATED).body(ruleSetService.addFaction(id, request, user))

    @DeleteMapping("/{id}")
    fun deleteRuleSet(
        @PathVariable id: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<Void> {
        ruleSetService.deleteRuleSet(id, user)
        return ResponseEntity.noContent().build()
    }

    @DeleteMapping("/{id}/general-rules/{ruleId}")
    fun deleteGeneralRule(
        @PathVariable id: UUID,
        @PathVariable ruleId: UUID,
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<Void> {
        ruleSetService.deleteGeneralRule(id, ruleId, user)
        return ResponseEntity.noContent().build()
    }
}
