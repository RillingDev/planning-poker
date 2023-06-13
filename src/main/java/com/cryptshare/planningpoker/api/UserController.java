package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.api.projection.UserJson;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class UserController {

	@GetMapping(value = "/api/identity", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	public UserJson loadIdentity(@AuthenticationPrincipal OidcUser user) {
		return new UserJson(user.getName());
	}

}
