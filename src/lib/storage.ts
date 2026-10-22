import * as Keychain from 'react-native-keychain';

export const secureStorage = {
  async getItem(key: string) {
    const entry = await Keychain.getGenericPassword({
      service: `seveneleven.${key}`,
    });
    return entry ? entry.password : null;
  },
  async setItem(key: string, value: string) {
    await Keychain.setGenericPassword(key, value, {
      service: `seveneleven.${key}`,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  },
  async removeItem(key: string) {
    await Keychain.resetGenericPassword({ service: `seveneleven.${key}` });
  },
};
export function randomToken() {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)), b =>
    b.toString(16).padStart(2, '0'),
  ).join('');
}
