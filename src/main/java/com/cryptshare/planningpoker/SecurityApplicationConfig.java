package com.cryptshare.planningpoker;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.oauth2.client.JdbcOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
class SecurityApplicationConfig {

	// https://docs.spring.io/spring-security/reference/servlet/integrations/mvc.html#mvc-enablewebmvcsecurity
	@Bean
	SecurityFilterChain filterChain(HttpSecurity http, OidcClientInitiatedLogoutSuccessHandler oidcClientInitiatedLogoutSuccessHandler, JdbcOAuth2AuthorizedClientService jdbcOAuth2AuthorizedClientService) throws Exception {
		http.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated()).oauth2Login(withDefaults()).oauth2Client(oAuth2ClientConfigurer -> oAuth2ClientConfigurer.authorizedClientService(jdbcOAuth2AuthorizedClientService))
				.logout(l -> l.logoutSuccessHandler(oidcClientInitiatedLogoutSuccessHandler))
				// TODO: check how to properly implement this (https://docs.spring.io/spring-boot/docs/3.0.x/reference/htmlsingle/#data.sql.h2-web-console)
				.csrf(AbstractHttpConfigurer::disable)
				// TODO: re-check this.
				.headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin));
		return http.build();
	}

	@Bean
	OidcClientInitiatedLogoutSuccessHandler oidcClientInitiatedLogoutSuccessHandler(ClientRegistrationRepository clientRegistrationRepository) {
		final OidcClientInitiatedLogoutSuccessHandler oidcClientInitiatedLogoutSuccessHandler = new OidcClientInitiatedLogoutSuccessHandler(clientRegistrationRepository);
		oidcClientInitiatedLogoutSuccessHandler.setPostLogoutRedirectUri("{baseUrl}");
		return oidcClientInitiatedLogoutSuccessHandler;
	}

	@Bean
	JdbcOAuth2AuthorizedClientService jdbcOAuth2AuthorizedClientService(JdbcOperations jdbcOperations, ClientRegistrationRepository clientRegistrationRepository) {
		return new JdbcOAuth2AuthorizedClientService(jdbcOperations, clientRegistrationRepository);
	}

}
