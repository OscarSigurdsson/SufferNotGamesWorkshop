package com.suffernot.workshop.repository

import com.suffernot.workshop.domain.WeaponSetEntry
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface WeaponSetEntryRepository : JpaRepository<WeaponSetEntry, UUID>
