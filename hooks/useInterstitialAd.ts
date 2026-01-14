import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

// IDs de prueba (cambiar a reales en producción)
const adUnitId = __DEV__
  ? TestIds.INTERSTITIAL
  : Platform.OS === 'ios'
    ? process.env.EXPO_PUBLIC_ADMOB_IOS_INTERSTITIAL_ID || TestIds.INTERSTITIAL
    : process.env.EXPO_PUBLIC_ADMOB_ANDROID_INTERSTITIAL_ID || TestIds.INTERSTITIAL;

export const useInterstitialAd = () => {
  const [interstitial, setInterstitial] = useState<InterstitialAd | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Crear y cargar el anuncio intersticial
    const ad = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: false,
    });

    // Listener cuando se carga
    const unsubscribeLoaded = ad.addAdEventListener(AdEventType.LOADED, () => {
      console.log('✅ Interstitial ad loaded');
      setIsLoaded(true);
      setIsLoading(false);
    });

    // Listener cuando falla la carga
    const unsubscribeError = ad.addAdEventListener(AdEventType.ERROR, (error) => {
      console.log('❌ Interstitial ad failed to load:', error);
      setIsLoaded(false);
      setIsLoading(false);
    });

    // Listener cuando se cierra el anuncio
    const unsubscribeClosed = ad.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('🔄 Interstitial ad closed, reloading...');
      setIsLoaded(false);
      // Recargar automáticamente para el siguiente uso
      ad.load();
      setIsLoading(true);
    });

    setInterstitial(ad);
    setIsLoading(true);
    ad.load();

    // Cleanup
    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeClosed();
    };
  }, []);

  const showAd = async (): Promise<boolean> => {
    if (!interstitial) {
      console.log('⚠️ Interstitial ad not initialized');
      return false;
    }

    if (!isLoaded) {
      console.log('⚠️ Interstitial ad not loaded yet');
      return false;
    }

    try {
      await interstitial.show();
      return true;
    } catch (error) {
      console.log('❌ Error showing interstitial ad:', error);
      return false;
    }
  };

  return {
    showAd,
    isLoaded,
    isLoading,
  };
};