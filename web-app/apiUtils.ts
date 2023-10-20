function isStatusSuccess(res: Response) {
  return res.status >= 200 && res.status <= 299;
}

export async function assertStatusSuccess(res: Response): Promise<Response> {
  if (isStatusSuccess(res)) {
    return res;
  }

  // If the error response has a message property, directly use it instead of throwing the full body for better UX.
  if (res.headers.get("Content-Type") == MEDIA_TYPE_JSON) {
    const jsonBody = await res.json();
    if ("message" in jsonBody) {
      throw new Error(jsonBody.message);
    }
  }

  const textBody = await res.text();
  throw new Error(
    `Unexpected status code '${res.status}':
    \n
		${textBody}.`,
  );
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
