package com.cryptshare.planningpoker;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2LoginAuthenticationToken;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
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

	SecurityApplicationConfig(DataSource dataSource) {
		this.dataSource = dataSource;
	}


	// https://docs.spring.io/spring-security/reference/servlet/integrations/mvc.html#mvc-enablewebmvcsecurity
	@Bean
	SecurityFilterChain filterChain(HttpSecurity http, OidcClientInitiatedLogoutSuccessHandler oidcClientInitiatedLogoutSuccessHandler) throws Exception {
		http.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated()).oauth2Login(withDefaults())
				.logout(l -> l.logoutSuccessHandler(oidcClientInitiatedLogoutSuccessHandler))
				// Makes AJAX messy, without too much of a security impact
				.csrf(AbstractHttpConfigurer::disable)
				// Allow usage of H2 console
				.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));
		return http.build();
	}

	@Bean
	OidcClientInitiatedLogoutSuccessHandler oidcClientInitiatedLogoutSuccessHandler(ClientRegistrationRepository clientRegistrationRepository) {
		final OidcClientInitiatedLogoutSuccessHandler oidcClientInitiatedLogoutSuccessHandler = new OidcClientInitiatedLogoutSuccessHandler(clientRegistrationRepository);
		oidcClientInitiatedLogoutSuccessHandler.setPostLogoutRedirectUri("{baseUrl}");
		return oidcClientInitiatedLogoutSuccessHandler;
	}

	// Ensure user table entry is present
	@EventListener
	public void onSuccess(AuthenticationSuccessEvent success) {
		try (Connection connection = dataSource.getConnection();
			 PreparedStatement preparedStatement = connection.prepareStatement("MERGE INTO app_user (username) VALUES (?)")) {
			final OidcUser user = (OidcUser) success.getAuthentication().getPrincipal();
			preparedStatement.setString(1, user.getPreferredUsername());
			preparedStatement.execute();
		} catch (SQLException e) {
			throw new IllegalStateException("Could not initialize user.", e);
		}
	}

}
