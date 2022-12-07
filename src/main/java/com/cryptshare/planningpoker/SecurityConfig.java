package com.cryptshare.planningpoker;

import org.h2.engine.UserBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.security.authentication.event.AuthenticationSuccessEvent;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import javax.sql.DataSource;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
class SecurityConfig {

	private final DataSource dataSource;

	SecurityConfig(DataSource dataSource) {
		this.dataSource = dataSource;
	}

	// https://docs.spring.io/spring-security/reference/servlet/integrations/mvc.html#mvc-enablewebmvcsecurity
	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests((authorize) -> authorize.anyRequest().authenticated())
				.formLogin(withDefaults())
				.csrf()
				.disable();
		return http.build();
	}

	// Ensure user table entry is present
	@EventListener
	public void onSuccess(AuthenticationSuccessEvent success) {
		try (PreparedStatement preparedStatement = dataSource.getConnection()
				.prepareStatement("MERGE INTO app_user (username) VALUES (?)")) {
			preparedStatement.setString(1, success.getAuthentication().getName());
			preparedStatement.execute();
		} catch (SQLException e) {
			throw new IllegalStateException("Could not initialize user.", e);
		}
	}

	@Bean
	UserDetailsManager userDetailsService(DataSource dataSource) {
		final UserDetailsManager userDetailsManager = new InMemoryUserDetailsManager();
		userDetailsManager.createUser(User.withDefaultPasswordEncoder().username("John Doe").password("changeme").roles("USER").build());
		userDetailsManager.createUser(User.withDefaultPasswordEncoder().username("Jane Doe").password("changeme").roles("USER").build());
		userDetailsManager.createUser(User.withDefaultPasswordEncoder().username("Jacob Doe").password("changeme").roles("USER").build());
		return userDetailsManager;
	}
}
