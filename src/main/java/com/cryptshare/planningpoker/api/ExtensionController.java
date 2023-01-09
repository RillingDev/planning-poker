package com.cryptshare.planningpoker.api;

import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
class ExtensionController {
	private static final String PREFIX = "extension:";

	private final Environment environment;

	ExtensionController(Environment environment) {
		this.environment = environment;
	}

	@GetMapping(value = "/api/extensions", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public List<String> loadExtensions() {
		return Arrays.stream(environment.getActiveProfiles())
				.filter(profile -> profile.startsWith(PREFIX))
				.map(profile -> profile.replace(PREFIX, ""))
				.sorted()
				.toList();
	}

}
