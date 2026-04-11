import { useCallback, useState } from 'react';
import type { ToastConfig } from './CustomToast';

const DEFAULT_CONFIG: ToastConfig = { text: '' };

export function useToast() {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ToastConfig>(DEFAULT_CONFIG);

  const show = useCallback((cfg: ToastConfig) => {
    setConfig(cfg);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  return { visible, config, show, hide };
}
