export function isStatusOk(res: Response) {
  return res.status >= 200 && res.status <= 299;
}

export const MEDIA_TYPE_JSON = "application/json";

export function getStateChangingHeaders() {
  // These tokens are embedded by thymeleaf into the base HTML file.
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
