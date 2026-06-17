package com.suffernot.workshop.controller

import com.suffernot.workshop.domain.User
import com.suffernot.workshop.dto.LoginRequest
import com.suffernot.workshop.dto.RegisterRequest
import com.suffernot.workshop.dto.UserResponse
import com.suffernot.workshop.exception.ConflictException
import com.suffernot.workshop.repository.UserRepository
import com.suffernot.workshop.security.WorkshopUserDetails
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.context.SecurityContextRepository
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val userRepository: UserRepository,
    private val passwordEncoder: PasswordEncoder,
    private val authenticationManager: AuthenticationManager,
    private val securityContextRepository: SecurityContextRepository,
) {
    @PostMapping("/register")
    fun register(
        @RequestBody req: RegisterRequest,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): ResponseEntity<UserResponse> {
        require(req.username.isNotBlank()) { "Username must not be blank" }
        require(req.email.isNotBlank()) { "Email must not be blank" }
        require(req.password.length >= 8) { "Password must be at least 8 characters" }
        if (userRepository.existsByUsername(req.username)) throw ConflictException("Username already taken")
        if (userRepository.existsByEmail(req.email)) throw ConflictException("Email already registered")
        userRepository.save(
            User(username = req.username, email = req.email, passwordHash = passwordEncoder.encode(req.password)),
        )
        val auth = authenticationManager.authenticate(
            UsernamePasswordAuthenticationToken(req.username, req.password),
        )
        val ctx = SecurityContextHolder.createEmptyContext()
        ctx.authentication = auth
        SecurityContextHolder.setContext(ctx)
        securityContextRepository.saveContext(ctx, request, response)
        val details = auth.principal as WorkshopUserDetails
        return ResponseEntity.status(HttpStatus.CREATED).body(UserResponse(details.userId, details.username, details.email))
    }

    @PostMapping("/login")
    fun login(
        @RequestBody req: LoginRequest,
        request: HttpServletRequest,
        response: HttpServletResponse,
    ): ResponseEntity<UserResponse> {
        val auth =
            try {
                authenticationManager.authenticate(UsernamePasswordAuthenticationToken(req.username, req.password))
            } catch (e: BadCredentialsException) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build()
            }
        val ctx = SecurityContextHolder.createEmptyContext()
        ctx.authentication = auth
        SecurityContextHolder.setContext(ctx)
        securityContextRepository.saveContext(ctx, request, response)
        val details = auth.principal as WorkshopUserDetails
        return ResponseEntity.ok(UserResponse(details.userId, details.username, details.email))
    }

    @PostMapping("/logout")
    fun logout(request: HttpServletRequest): ResponseEntity<Void> {
        request.getSession(false)?.invalidate()
        SecurityContextHolder.clearContext()
        return ResponseEntity.ok().build()
    }

    @GetMapping("/me")
    fun me(
        @AuthenticationPrincipal user: WorkshopUserDetails,
    ): ResponseEntity<UserResponse> = ResponseEntity.ok(UserResponse(user.userId, user.username, user.email))
}
