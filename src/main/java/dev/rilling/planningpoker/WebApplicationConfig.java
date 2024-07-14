package dev.rilling.planningpoker;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebApplicationConfig implements WebMvcConfigurer {

	@Override
	public void addViewControllers(ViewControllerRegistry registry) {
		// Redirect paths that are handled by `react-router` to index.html
		registry.addViewController("/rooms/**").setViewName("forward:/");
	}
}
