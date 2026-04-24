import { createContext, useCallback, useMemo, useState } from "react";

export const ToastContext = createContext(null);

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback(
    ({ type = "success", title, description }) => {
      const id = ++toastId;
      setToasts((current) => [...current, { id, type, title, description }]);
      window.setTimeout(() => dismissToast(id), 3500);
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      toast: pushToast,
      success: (title, description) => pushToast({ type: "success", title, description }),
      error: (title, description) => pushToast({ type: "error", title, description }),
    }),
    [pushToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`app-surface rounded-2xl p-4 ${
              toast.type === "error" ? "border-red-300/40 dark:border-red-400/20" : "border-emerald-300/40 dark:border-emerald-400/20"
            }`}
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{toast.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
