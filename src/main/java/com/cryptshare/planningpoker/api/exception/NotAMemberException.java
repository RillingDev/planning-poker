package com.cryptshare.planningpoker.api.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.FORBIDDEN, reason = "You must be a member of this room to perform this action.")
public class NotAMemberException extends RuntimeException {
}
