export function isStatusOk(res: Response) {
  return res.status >= 200 && res.status <= 299;
}

export const MEDIA_TYPE_JSON = "application/json";
