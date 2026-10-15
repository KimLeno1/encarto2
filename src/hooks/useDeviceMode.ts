import { useState, useEffect } from 'react';
import { DeviceModeSetting, ActiveDevice } from '../types.ts';

export function useDeviceMode() {
  const [deviceSetting, setDeviceSetting] = useState<DeviceModeSetting>(() => {
    return (localStorage.getItem('encarto_device_setting') as DeviceModeSetting) || 'auto';
  });

  const [detectedActive, setDetectedActive] = useState<ActiveDevice>(() => {
    if (typeof window === 'undefined') return 'desktop';
    return window.innerWidth < 768 ? 'mobile' : 'desktop';
  });

  useEffect(() => {
    const checkDevice = () => {
      const isMobileWidth = window.innerWidth < 768;
      setDetectedActive(isMobileWidth ? 'mobile' : 'desktop');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  const handleSetSetting = (setting: DeviceModeSetting) => {
    setDeviceSetting(setting);
    localStorage.setItem('encarto_device_setting', setting);
  };

  const activeDevice: ActiveDevice =
    deviceSetting === 'auto' ? detectedActive : deviceSetting;

  return {
    deviceSetting,
    setDeviceSetting: handleSetSetting,
    activeDevice,
    isAuto: deviceSetting === 'auto',
  };
}
