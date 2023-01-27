package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.data.Extension;
import com.cryptshare.planningpoker.data.ExtensionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;

@Configuration
public class ExtensionConfig {
	private static final Logger logger = LoggerFactory.getLogger(PlanningpokerApplication.class);

	private final Environment environment;
	private final ExtensionRepository extensionRepository;

	ExtensionConfig(Environment environment, ExtensionRepository extensionRepository) {
		this.environment = environment;
		this.extensionRepository = extensionRepository;
	}

	@EventListener
	public void onSuccess(ApplicationStartedEvent event) {
		initializeExtensions();
	}

	private void initializeExtensions() {
		for (Extension extension : extensionRepository.findAll()) {
			final boolean extensionEnabled = environment.acceptsProfiles(Profiles.of("extension:" + extension.getKey()));
			extension.setEnabled(extensionEnabled);
			extensionRepository.save(extension);
			logger.info("Extension '{}' is {}.", extension.getKey(), extensionEnabled ? "enabled" : "disabled");
		}
	}
}
