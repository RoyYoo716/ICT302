import { File, Paths } from "expo-file-system";

const AVATAR_FILE_PREFIX = "vafpqr.avatar";

export async function loadLocalAvatarUri(userId) {
  if (!userId) return null;

  const metadataFile = getMetadataFile(userId);
  if (!metadataFile.exists) return null;

  try {
    const metadata = JSON.parse(await metadataFile.text());
    if (typeof metadata?.uri !== "string" || !metadata.uri) return null;

    const avatarFile = new File(metadata.uri);
    return avatarFile.exists ? metadata.uri : null;
  } catch {
    return null;
  }
}

export async function saveLocalAvatar({ sourceUri, userId }) {
  if (!sourceUri || !userId) {
    throw new Error("A user and image are required to save an avatar.");
  }

  const sourceFile = new File(sourceUri);
  if (!sourceFile.exists) {
    throw new Error("The selected avatar image is no longer available.");
  }

  const userKey = getUserKey(userId);
  const previousUri = await loadLocalAvatarUri(userId);
  const extension = /^\.[a-zA-Z0-9]+$/.test(sourceFile.extension)
    ? sourceFile.extension.toLowerCase()
    : ".jpg";
  const destinationFile = new File(
    Paths.document,
    `${AVATAR_FILE_PREFIX}.${userKey}.${Date.now()}${extension}`
  );

  await sourceFile.copy(destinationFile);
  getMetadataFile(userId).write(JSON.stringify({ uri: destinationFile.uri }));

  deletePreviousAvatar(previousUri, userKey, destinationFile.uri);
  return destinationFile.uri;
}

function getMetadataFile(userId) {
  return new File(Paths.document, `${AVATAR_FILE_PREFIX}.${getUserKey(userId)}.json`);
}

function getUserKey(userId) {
  return String(userId).replace(/[^a-zA-Z0-9_-]/g, "_");
}

function deletePreviousAvatar(previousUri, userKey, nextUri) {
  if (!previousUri || previousUri === nextUri) return;

  try {
    const previousFile = new File(previousUri);
    const isManagedAvatar = previousFile.name.startsWith(`${AVATAR_FILE_PREFIX}.${userKey}.`);

    if (isManagedAvatar && previousFile.exists) {
      previousFile.delete();
    }
  } catch {
    // A stale previous avatar should not block the newly saved image.
  }
}
