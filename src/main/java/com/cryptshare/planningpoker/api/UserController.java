package com.cryptshare.planningpoker.api;

import com.cryptshare.planningpoker.api.projection.UserJson;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class UserController {

	@GetMapping(value = "/api/identity", produces = MediaType.APPLICATION_JSON_VALUE)
	@ResponseBody
	UserJson loadIdentity(@AuthenticationPrincipal UserDetails user) {
		return new UserJson(user.getUsername());
	}

}
