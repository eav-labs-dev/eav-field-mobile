import { isDemoModeEnabled } from '../demo-mode';

describe('isDemoModeEnabled', () => {
  test.each(['true', ' TRUE ', 'True'])('enables demo data only for an explicit true value', (value) => {
    expect(isDemoModeEnabled(value)).toBe(true);
  });

  test.each([undefined, '', 'false', '1', 'yes'])('keeps demo data disabled for %p', (value) => {
    expect(isDemoModeEnabled(value)).toBe(false);
  });
});
