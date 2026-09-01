/**
 * @fileoverview Durable device storage for inspection photo evidence.
 * @remarks Picker cache paths are copied into the app document directory before drafts reference them.
 */

import { Directory, File, Paths } from 'expo-file-system';

import type { PickedImageAsset } from './photo-attachment';

const PHOTO_DIRECTORY = 'inspection-photos';

const safeFileName = (id: string, asset: PickedImageAsset) => {
  const candidate = asset.fileName ?? asset.uri.split('/').pop() ?? '';
  const extension = candidate.match(/\.[a-zA-Z0-9]{1,8}$/)?.[0]?.toLowerCase() ?? '.jpg';
  return `${id.replace(/[^a-zA-Z0-9_-]/g, '-')}${extension}`;
};

/**
 * Copies a picker asset out of temporary storage.
 * @param asset ImagePicker asset selected by the field officer.
 * @param id Stable attachment identifier used for idempotent storage.
 */
export const persistPhotoAsset = async (
  asset: PickedImageAsset,
  id: string,
): Promise<PickedImageAsset> => {
  const directory = new Directory(Paths.document, PHOTO_DIRECTORY);
  if (!directory.exists) directory.create({ idempotent: true, intermediates: true });

  const source = new File(asset.uri);
  const destination = new File(directory, safeFileName(id, asset));
  if (destination.exists) destination.delete();
  await source.copy(destination);

  return { ...asset, fileName: destination.name, uri: destination.uri };
};

/** Removes a locally owned photo after the user removes it from a draft. */
export const deletePersistedPhoto = (uri: string) => {
  const directory = new Directory(Paths.document, PHOTO_DIRECTORY);
  if (!uri.startsWith(`${directory.uri}/`)) return;

  const file = new File(uri);
  if (file.exists) file.delete();
};
