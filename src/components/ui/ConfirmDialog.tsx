import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({ title: '', message: '' });
  const [resolveFunc, setResolveFunc] = useState<{ fn: (value: boolean) => void } | null>(null);

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolveFunc({ fn: resolve });
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveFunc) resolveFunc.fn(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveFunc) resolveFunc.fn(false);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 transition-opacity">
          <Card className="w-full max-w-md shadow-xl bg-white">
            <CardHeader>
              <CardTitle className="text-lg">{options.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">{options.message}</p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCancel}>
                  {options.cancelText || 'Cancelar'}
                </Button>
                <Button 
                  variant="default" 
                  className={options.destructive !== false ? "bg-red-600 hover:bg-red-700 text-white" : ""} 
                  onClick={handleConfirm}
                >
                  {options.confirmText || 'Confirmar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
