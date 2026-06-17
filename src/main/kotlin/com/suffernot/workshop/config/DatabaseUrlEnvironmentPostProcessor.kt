package com.suffernot.workshop.config

import org.springframework.boot.SpringApplication
import org.springframework.boot.env.EnvironmentPostProcessor
import org.springframework.core.env.ConfigurableEnvironment
import org.springframework.core.env.MapPropertySource
import java.net.URI

class DatabaseUrlEnvironmentPostProcessor : EnvironmentPostProcessor {

    override fun postProcessEnvironment(environment: ConfigurableEnvironment, application: SpringApplication) {
        val rawUrl = environment.getProperty("DATABASE_URL") ?: return

        val uri = URI(rawUrl.removePrefix("jdbc:"))
        val parts = uri.userInfo?.split(":", limit = 2)
        require(!parts.isNullOrEmpty()) {
            "DATABASE_URL must include credentials: postgresql://user:password@host/db"
        }

        val user = parts[0]
        val password = parts.getOrElse(1) { "" }
        val portSegment = if (uri.port != -1) ":${uri.port}" else ""
        val query = uri.rawQuery?.let { "?$it" } ?: "?sslmode=require"
        val jdbcUrl = "jdbc:postgresql://${uri.host}${portSegment}${uri.path}${query}"

        environment.propertySources.addFirst(
            MapPropertySource(
                "databaseUrl",
                mapOf(
                    "spring.datasource.url" to jdbcUrl,
                    "spring.datasource.username" to user,
                    "spring.datasource.password" to password,
                ),
            ),
        )
    }
}
