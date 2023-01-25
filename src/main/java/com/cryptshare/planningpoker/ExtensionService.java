package com.cryptshare.planningpoker;

import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ExtensionService {
	private static final String PREFIX = "extension:";

	private final Environment environment;

	ExtensionService(Environment environment) {
		this.environment = environment;
	}

	public Set<String> loadExtensions() {
		return Arrays.stream(environment.getActiveProfiles())
				.filter(profile -> profile.startsWith(PREFIX))
				.map(profile -> profile.replace(PREFIX, ""))
				.collect(Collectors.toUnmodifiableSet());
	}
}
