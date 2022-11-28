package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.entities.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.provisioning.UserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
class SecurityConfig {

	// https://docs.spring.io/spring-security/reference/servlet/integrations/mvc.html#mvc-enablewebmvcsecurity
	@Bean
	SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
		// TODO
		http.authorizeHttpRequests((authorize) -> authorize.anyRequest().authenticated()).httpBasic(withDefaults()).csrf().disable();
		return http.build();
	}

	@Bean
	UserDetailsManager userDetailsService(UserRepository userRepository) {
		// FIXME for testing purposes only
		final String username = "John Doe";
		if (userRepository.findByUsername(username).isEmpty()) {
			userRepository.save(new com.cryptshare.planningpoker.entities.User(username));
		}
		final UserDetails user = User.withDefaultPasswordEncoder().username(username).password("changeme").roles("USER").build();
		return new InMemoryUserDetailsManager(user);
	}

}
