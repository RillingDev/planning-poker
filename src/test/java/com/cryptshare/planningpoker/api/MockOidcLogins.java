package com.cryptshare.planningpoker.api;

import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;

final class MockOidcLogins {
	private MockOidcLogins() {
	}

	public static SecurityMockMvcRequestPostProcessors.OidcLoginRequestPostProcessor bobOidcLogin() {
		return oidcLogin().userInfoToken(build -> build.preferredUsername("Bob"));
	}

	public static SecurityMockMvcRequestPostProcessors.OidcLoginRequestPostProcessor aliceOidcLogin() {
		return oidcLogin().userInfoToken(build -> build.preferredUsername("Alice"));
	}
}
