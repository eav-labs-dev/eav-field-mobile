import { createPhotoAttachment } from '../photo-attachment';

describe('createPhotoAttachment', () => {
  it('maps picker metadata into a persistable camera attachment', () => {
    expect(
      createPhotoAttachment(
        {
          uri: 'file:///inspection.jpg',
          fileName: 'inspection.jpg',
          mimeType: 'image/jpeg',
          width: 1200,
          height: 900,
        },
        'camera',
        'inspection-1-123',
        '2026-08-24T08:00:00.000Z',
      ),
    ).toEqual({
      id: 'inspection-1-123',
      uri: 'file:///inspection.jpg',
      fileName: 'inspection.jpg',
      mimeType: 'image/jpeg',
      width: 1200,
      height: 900,
      source: 'camera',
      addedAt: '2026-08-24T08:00:00.000Z',
    });
  });

  it('normalizes optional picker metadata to null', () => {
    const attachment = createPhotoAttachment(
      { uri: 'file:///selected.png', width: 640, height: 480 },
      'library',
      'photo-2',
      '2026-08-24T08:05:00.000Z',
    );

    expect(attachment.fileName).toBeNull();
    expect(attachment.mimeType).toBeNull();
  });
});
