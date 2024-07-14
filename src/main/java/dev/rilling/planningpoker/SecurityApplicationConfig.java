package dev.rilling.planningpoker;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcOperations;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.JdbcOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
class SecurityApplicationConfig {

	@Bean
	SecurityFilterChain filterChain(HttpSecurity http, JdbcOAuth2AuthorizedClientService jdbcOAuth2AuthorizedClientService) throws Exception {
		return http.authorizeHttpRequests(authorize -> authorize.anyRequest().authenticated())
				.oauth2Login(withDefaults())
				.oauth2Client(oAuth2ClientConfigurer -> oAuth2ClientConfigurer.authorizedClientService(jdbcOAuth2AuthorizedClientService))
				.build();
	}

	@Bean
	JdbcOAuth2AuthorizedClientService jdbcOAuth2AuthorizedClientService(JdbcOperations jdbcOperations,
			ClientRegistrationRepository clientRegistrationRepository) {
		return new JdbcOAuth2AuthorizedClientService(jdbcOperations, clientRegistrationRepository);
	}

}
