package com.cryptshare.planningpoker;

import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

	private final Environment environment;

	public WebConfig(Environment environment) {
		this.environment = environment;
	}

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		if (environment.acceptsProfiles(Profiles.of("development"))) {
			registry.addResourceHandler("/index.html").addResourceLocations("classpath:/static-dev/");
		}
	}

	@Override
	public void addViewControllers(ViewControllerRegistry registry) {
		// Redirect paths that are handled by `react-router` to index.html
		registry.addViewController("/rooms/**").setViewName("forward:/");
	}
}
