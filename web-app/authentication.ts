import { User } from "./model.ts";

// The following functions can be used to access authentication details which are inserted into the HTML via thymeleaf.

export function getCsrfHeaders() {
  const csrfTokenHeaderName = document
    .querySelector("meta[name='_csrf_header']")!
    .getAttribute("content")!;
  const csrfToken = document
    .querySelector("meta[name='_csrf']")!
    .getAttribute("content")!;

  return {
    [csrfTokenHeaderName]: csrfToken,
  };
}

export function getUser(): User {
  const username = document
    .querySelector("meta[name='_username']")!
    .getAttribute("content")!;

  return { username };
}
