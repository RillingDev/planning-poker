package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.ExtensionService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
class ExtensionController {
	private static final String PREFIX = "extension:";

	private final ExtensionService extensionService;

	ExtensionController(ExtensionService extensionService) {
		this.extensionService = extensionService;
	}

	@GetMapping(value = "/api/extensions", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public List<String> loadExtensions() {
		return extensionService.loadExtensions().stream().sorted().toList();
	}

}
