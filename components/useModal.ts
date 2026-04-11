import { useCallback, useState } from 'react';

export type ModalConfig = {
  icon: string;
  iconColor: string;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

export type ModalState = {
  visible: boolean;
  config: ModalConfig;
  show: (config: ModalConfig) => void;
  hide: () => void;
};

const defaultConfig: ModalConfig = { icon: '', iconColor: '', title: '', message: '' };

export function useModal(): ModalState {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ModalConfig>(defaultConfig);

  const show = useCallback((cfg: ModalConfig) => {
    setConfig(cfg);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);
  }, []);

  return { visible, config, show, hide };
}
