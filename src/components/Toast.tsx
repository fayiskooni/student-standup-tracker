"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  exiting?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
      );
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 300);
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, exiting: true } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  }, []);

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-mentrex-success" />,
    error: <XCircle className="h-5 w-5 text-mentrex-danger" />,
    info: <Info className="h-5 w-5 text-mentrex-primary" />,
  };

  const borderColors = {
    success: "border-l-mentrex-success",
    error: "border-l-mentrex-danger",
    info: "border-l-mentrex-primary",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-card border border-mentrex ${borderColors[toast.type]} border-l-4 bg-mentrex-card px-5 py-4 shadow-mentrex-lg ${
              toast.exiting ? "animate-toast-out" : "animate-toast-in"
            }`}
          >
            {icons[toast.type]}
            <p className="text-sm font-medium text-white">{toast.message}</p>
            <button
              onClick={() => dismissToast(toast.id)}
              className="ml-3 text-mentrex-text-secondary transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
