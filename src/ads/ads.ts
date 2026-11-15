import { REWARDED_UNIT_ID, USING_TEST_ADS } from './units';

export type AdOutcome = 'earned' | 'dismissed' | 'unavailable';

const AD_TIMEOUT_MS = 20000;

type AdsSdk = typeof import('react-native-google-mobile-ads');

// Lazily resolved: the native module is absent in Expo Go, on web and under Jest.
let sdk: AdsSdk | null | undefined;
let initialisation: Promise<void> | null = null;

function loadSdk(): AdsSdk | null {
  if (sdk !== undefined) return sdk;
  try {
    sdk = require('react-native-google-mobile-ads') as AdsSdk;
  } catch {
    sdk = null;
  }
  return sdk;
}

export function initialiseAds(): Promise<void> {
  if (initialisation) return initialisation;
  initialisation = (async () => {
    const module = loadSdk();
    if (!module) return;
    if (__DEV__ && USING_TEST_ADS) {
      console.warn('[ads] using Google test units; no revenue will be recorded');
    }
    try {
      await module.default().initialize();
    } catch {
      return;
    }
    try {
      await module.AdsConsent.requestInfoUpdate();
      await module.AdsConsent.loadAndShowConsentFormIfRequired();
    } catch {
      // No consent message configured, or outside a regulated region. Requests stay
      // non-personalized either way.
    }
  })();
  return initialisation;
}

export async function showRewardedAd(): Promise<AdOutcome> {
  const module = loadSdk();
  if (!module) return 'unavailable';
  await initialiseAds();

  try {
    const ad = module.RewardedAd.createForAdRequest(REWARDED_UNIT_ID, {
      requestNonPersonalizedAdsOnly: true,
    });

    return await new Promise<AdOutcome>((resolve) => {
      let settled = false;
      let timer: ReturnType<typeof setTimeout> | undefined;
      const unsubscribe: Array<() => void> = [];

      const finish = (outcome: AdOutcome) => {
        if (settled) return;
        settled = true;
        if (timer) clearTimeout(timer);
        for (const off of unsubscribe) off();
        resolve(outcome);
      };

      timer = setTimeout(() => finish('unavailable'), AD_TIMEOUT_MS);

      unsubscribe.push(
        ad.addAdEventListener(module.RewardedAdEventType.LOADED, () => {
          ad.show().catch(() => finish('unavailable'));
        }),
        ad.addAdEventListener(module.RewardedAdEventType.EARNED_REWARD, () => finish('earned')),
        ad.addAdEventListener(module.AdEventType.CLOSED, () => finish('dismissed')),
        ad.addAdEventListener(module.AdEventType.ERROR, () => finish('unavailable')),
      );

      ad.load();
    });
  } catch {
    return 'unavailable';
  }
}
