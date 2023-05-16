package com.cryptshare.planningpoker.api;

import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;

public final class MockOidcLogins {
	private MockOidcLogins() {
	}

	public static SecurityMockMvcRequestPostProcessors.OidcLoginRequestPostProcessor bobOidcLogin() {
		return oidcLogin().idToken(build -> build.subject("Bob")).userInfoToken(b -> b.name("Bob T.").preferredUsername("Little Bobby Tables"));
	}
}
