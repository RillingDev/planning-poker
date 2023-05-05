package com.cryptshare.planningpoker;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@Profile("!test")
class SecurityApplicationConfig {

	private final DataSource dataSource;
	private final KeycloakLogoutHandler keycloakLogoutHandler;

	SecurityApplicationConfig(DataSource dataSource, KeycloakLogoutHandler keycloakLogoutHandler) {
		this.dataSource = dataSource;
		this.keycloakLogoutHandler = keycloakLogoutHandler;
	}

	// https://docs.spring.io/spring-security/reference/servlet/integrations/mvc.html#mvc-enablewebmvcsecurity
	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated()).oauth2Login(withDefaults())
				.logout(l -> l.addLogoutHandler(keycloakLogoutHandler))
				// Makes AJAX messy, without too much of a security impact
				.csrf(AbstractHttpConfigurer::disable)
				// Allow usage of H2 console
				.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));
		return http.build();
	}

	// Ensure user table entry is present
	@EventListener
	public void onSuccess(AuthenticationSuccessEvent success) {
		try (Connection connection = dataSource.getConnection();
			 PreparedStatement preparedStatement = connection.prepareStatement("MERGE INTO app_user (username) VALUES (?)")) {
			preparedStatement.setString(1, success.getAuthentication().getName());
			preparedStatement.execute();
		} catch (SQLException e) {
			throw new IllegalStateException("Could not initialize user.", e);
		}
	}

}
