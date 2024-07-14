package dev.rilling.planningpoker.api;

import dev.rilling.planningpoker.data.Extension;
import dev.rilling.planningpoker.data.ExtensionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(value = ExtensionController.class)
class ExtensionControllerIT {

	@MockBean
	ExtensionRepository extensionRepository;

	@Autowired
	MockMvc mockMvc;

	@Test
	@DisplayName("GET `/api/extensions` returns extensions")
	void loadsExtensions() throws Exception {
		final Extension foo = new Extension("foo");
		final Extension bar = new Extension("bar");
		given(extensionRepository.findAllByEnabled(true)).willReturn(Set.of(bar, foo));

		mockMvc.perform(get("/api/extensions").with(MockOidcLogins.bobOidcLogin()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.length()").value(2))
				.andExpect(jsonPath("$[0]").value("bar"))
				.andExpect(jsonPath("$[1]").value("foo"));
	}
}
