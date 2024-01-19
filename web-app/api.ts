import {
  assertStatusSuccess,
  getStateChangingHeaders,
  MEDIA_TYPE_JSON,
} from "./apiUtils.ts";
import {
  CardSet,
  EditAction,
  ExtensionKey,
  Room,
  RoomCreationOptions,
  RoomEditOptions,
  SummaryResult,
  User,
} from "./model.ts";

export async function getIdentity(): Promise<User> {
  return fetch("/api/identity", {
    method: "GET",
    headers: { Accept: MEDIA_TYPE_JSON },
  })
    .then(assertStatusSuccess)
    .then((res) => res.json() as Promise<User>);
}

export async function getExtensions(): Promise<readonly ExtensionKey[]> {
  return fetch("/api/extensions", {
    method: "GET",
    headers: { Accept: MEDIA_TYPE_JSON },
  })
    .then(assertStatusSuccess)
    .then((res) => res.json() as Promise<readonly ExtensionKey[]>);
}

export async function getExtensionConfig<T>(
  extensionKey: ExtensionKey,
): Promise<T> {
  return fetch(`/api/extensions/${extensionKey}`, {
    method: "GET",
    headers: { Accept: MEDIA_TYPE_JSON },
  })
    .then(assertStatusSuccess)
    .then((res) => res.json() as Promise<T>);
}

export async function getExtensionRoomConfig<T>(
  roomName: string,
  extensionKey: ExtensionKey,
): Promise<T> {
  return fetch(
    `/api/rooms/${encodeURIComponent(roomName)}/extensions/${extensionKey}`,
    {
      method: "GET",
      headers: { Accept: MEDIA_TYPE_JSON },
    },
  )
    .then(assertStatusSuccess)
    .then((res) => res.json() as Promise<T>);
}

export async function editExtensionRoomConfig<T>(
  roomName: string,
  extensionKey: ExtensionKey,
  config: Partial<T>,
): Promise<void> {
  await fetch(
    `/api/rooms/${encodeURIComponent(roomName)}/extensions/${extensionKey}`,
    {
      method: "PATCH",
      headers: {
        ...getStateChangingHeaders(),
        "Content-Type": MEDIA_TYPE_JSON,
      },
      body: JSON.stringify(config),
    },
  ).then(assertStatusSuccess);
}

export async function getCardSets(): Promise<CardSet[]> {
  return fetch("/api/card-sets", {
    method: "GET",
    headers: { Accept: MEDIA_TYPE_JSON },
  })
    .then(assertStatusSuccess)
    .then((res) => res.json() as Promise<CardSet[]>);
}

export async function getRooms(): Promise<Room[]> {
  return fetch("/api/rooms", {
    method: "GET",
    headers: { Accept: MEDIA_TYPE_JSON },
  })
    .then(assertStatusSuccess)
    .then((res) => res.json() as Promise<Room[]>);
}

export async function createRoom(
  roomName: string,
  { cardSetName }: RoomCreationOptions,
): Promise<void> {
  await fetch(`/api/rooms/${encodeURIComponent(roomName)}`, {
    method: "POST",
    headers: { ...getStateChangingHeaders(), "Content-Type": MEDIA_TYPE_JSON },
    body: JSON.stringify({ cardSetName }),
  }).then(assertStatusSuccess);
}

export async function getRoom(roomName: string): Promise<Room> {
  return fetch(`/api/rooms/${encodeURIComponent(roomName)}/`, {
    method: "GET",
    headers: { Accept: MEDIA_TYPE_JSON },
  })
    .then(assertStatusSuccess)
    .then((res) => res.json() as Promise<Room>);
}

export async function deleteRoom(roomName: string): Promise<void> {
  await fetch(`/api/rooms/${encodeURIComponent(roomName)}`, {
    method: "DELETE",
    headers: getStateChangingHeaders(),
  }).then(assertStatusSuccess);
}

export async function editRoom(
  roomName: string,
  { topic, cardSetName, extensions }: RoomEditOptions,
): Promise<void> {
  await fetch(`/api/rooms/${encodeURIComponent(roomName)}`, {
    method: "PATCH",
    headers: { ...getStateChangingHeaders(), "Content-Type": MEDIA_TYPE_JSON },
    // Note: `undefined` values mean the key will not be part of the JSON payload
    body: JSON.stringify({ topic, cardSetName, extensions }),
  }).then(assertStatusSuccess);
}

export async function joinRoom(roomName: string): Promise<void> {
  await fetch(`/api/rooms/${encodeURIComponent(roomName)}/members`, {
    method: "POST",
    headers: getStateChangingHeaders(),
  }).then(assertStatusSuccess);
}

export async function leaveRoom(roomName: string): Promise<void> {
  await fetch(`/api/rooms/${encodeURIComponent(roomName)}/members`, {
    method: "DELETE",
    headers: getStateChangingHeaders(),
  }).then(assertStatusSuccess);
}

export async function editMember(
  roomName: string,
  memberUsername: string,
  action: EditAction,
): Promise<void> {
  const url = new URL(
    `/api/rooms/${encodeURIComponent(roomName)}/members/${encodeURIComponent(
      memberUsername,
    )}`,
    location.href,
  );
  url.searchParams.set("action", action);
  await fetch(url, {
    method: "PATCH",
    headers: getStateChangingHeaders(),
  }).then(assertStatusSuccess);
}

export async function createVote(
  roomName: string,
  cardName: string,
): Promise<void> {
  const url = new URL(
    `/api/rooms/${encodeURIComponent(roomName)}/votes`,
    location.href,
  );
  url.searchParams.set("card-name", cardName);
  await fetch(url, {
    method: "POST",
    headers: getStateChangingHeaders(),
  }).then(assertStatusSuccess);
}

export async function clearVotes(roomName: string): Promise<void> {
  await fetch(`/api/rooms/${encodeURIComponent(roomName)}/votes`, {
    method: "DELETE",
    headers: getStateChangingHeaders(),
  }).then(assertStatusSuccess);
}

export async function getSummary(roomName: string): Promise<SummaryResult> {
  return fetch(`/api/rooms/${encodeURIComponent(roomName)}/votes/summary`, {
    method: "GET",
    headers: { Accept: MEDIA_TYPE_JSON },
  })
    .then(assertStatusSuccess)
    .then((res) => res.json() as Promise<SummaryResult>);
}
