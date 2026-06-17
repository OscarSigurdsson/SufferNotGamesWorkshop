package com.suffernot.workshop.security

import com.suffernot.workshop.repository.UserRepository
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.core.userdetails.UsernameNotFoundException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class WorkshopUserDetailsService(private val userRepository: UserRepository) : UserDetailsService {
    @Transactional(readOnly = true)
    override fun loadUserByUsername(username: String): UserDetails {
        val user =
            userRepository.findByUsername(username)
                .orElseThrow { UsernameNotFoundException("User '$username' not found") }
        return WorkshopUserDetails(user.id, user.username, user.email, user.passwordHash)
    }
}
