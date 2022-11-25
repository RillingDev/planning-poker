package com.cryptshare.planningpoker;

import com.cryptshare.planningpoker.entities.User;
import com.cryptshare.planningpoker.entities.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class UserService {

	private final UserRepository userRepository;

	UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	public User getUser(UserDetails userDetails) {
		// TODO find more ergonomic way to load user
		// Assumption: if UserDetails are present, a user must exist.
		return userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
	}
}
