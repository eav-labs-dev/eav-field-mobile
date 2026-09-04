/**
 * @fileoverview Converts image-picker results into locally persisted draft metadata.
 */

import type { PhotoAttachment } from './inspection-form';

export type PickedImageAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
  width: number;
  height: number;
};

/**
 * Builds stable draft metadata without coupling domain tests to the native picker.
 */
export const createPhotoAttachment = (
  asset: PickedImageAsset,
  source: PhotoAttachment['source'],
  id: string,
  addedAt: string,
): PhotoAttachment => ({
  id,
  uri: asset.uri,
  fileName: asset.fileName ?? null,
  mimeType: asset.mimeType ?? null,
  width: asset.width,
  height: asset.height,
  source,
  addedAt,
});
