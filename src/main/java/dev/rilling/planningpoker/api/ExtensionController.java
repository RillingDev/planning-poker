package dev.rilling.planningpoker.api;

import dev.rilling.planningpoker.data.Extension;
import dev.rilling.planningpoker.data.ExtensionRepository;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Access to globally available extensions.
 */
@RestController
class ExtensionController {
	private final ExtensionRepository extensionRepository;

	ExtensionController(ExtensionRepository extensionRepository) {
		this.extensionRepository = extensionRepository;
	}

	@GetMapping(value = "/api/extensions", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public List<String> getExtensions() {
		return extensionRepository.findAllByEnabled(true).stream().sorted(Extension.ALPHABETIC_COMPARATOR).map(Extension::getKey).toList();
	}

}
