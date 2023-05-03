package com.cryptshare.planningpoker.api;

import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;

public final class MockOidcLogins {
	private MockOidcLogins() {
	}

	public static SecurityMockMvcRequestPostProcessors.OidcLoginRequestPostProcessor bobOidcLogin() {
		return oidcLogin().userInfoToken(build -> build.givenName("Bob").familyName("Doe").preferredUsername("Bob"));
	}
}
