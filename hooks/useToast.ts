
import { useState, useCallback } from 'react';

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
  visible: boolean;
}

export const useToast = () => {
  const [toast, setToast] = useState<ToastState>({
    message: '',
    type: 'info',
    visible: false,
  });

  const show = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({
      message,
      type,
      visible: true,
    });
  }, []);

  const hide = useCallback(() => {
    setToast(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  const success = useCallback((message: string) => {
    show(message, 'success');
  }, [show]);

  const error = useCallback((message: string) => {
    show(message, 'error');
  }, [show]);

  const info = useCallback((message: string) => {
    show(message, 'info');
  }, [show]);

  return {
    toast,
    show,
    hide,
    success,
    error,
    info,
  };
};
