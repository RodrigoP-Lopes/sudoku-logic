/** Web build of the ad layer: Metro prefers this file on web, so the native package never loads. */
export type AdOutcome = 'earned' | 'dismissed' | 'unavailable';

export function initialiseAds(): Promise<void> {
  return Promise.resolve();
}

export function showRewardedAd(): Promise<AdOutcome> {
  return Promise.resolve('unavailable');
}
