package com.cryptshare.planningpoker;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

// Based on https://www.baeldung.com/spring-boot-keycloak
@Component
public class KeycloakLogoutHandler implements LogoutHandler {
	private static final Logger logger = LoggerFactory.getLogger(KeycloakLogoutHandler.class);

	private final RestTemplate restTemplate;
	private final Environment environment;

	public KeycloakLogoutHandler(RestTemplateBuilder restTemplateBuilder, Environment environment) {
		this.restTemplate = restTemplateBuilder.build();
		this.environment = environment;
	}

	@Override
	public void logout(HttpServletRequest request, HttpServletResponse response,
					   Authentication auth) {
		// Ignore if keycloak provider is not configured
		if (environment.containsProperty("spring.security.oauth2.client.provider.keycloak.issuer-uri")) {
			logoutFromKeycloak((OidcUser) auth.getPrincipal());
		}
	}

	private void logoutFromKeycloak(OidcUser user) {
		UriComponentsBuilder builder = UriComponentsBuilder
				.fromUriString(user.getIssuer() + "/protocol/openid-connect/logout")
				.queryParam("id_token_hint", user.getIdToken().getTokenValue())
				.queryParam("client_id", environment.getRequiredProperty("spring.security.oauth2.client.registration.keycloak.client-id"));

		ResponseEntity<String> logoutResponse = restTemplate.getForEntity(
				builder.toUriString(), String.class);
		if (logoutResponse.getStatusCode().is2xxSuccessful()) {
			logger.info("Successfully propagated logout.");
		} else {
			logger.error("Could not propagate logout");
		}
	}
}
