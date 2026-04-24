const Modal = ({ open, title, children, onClose, footer }) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
      <div className="app-surface w-full max-w-2xl rounded-[2rem] p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-2xl font-semibold text-slate-900 dark:text-white">{title}</h3>
          <button
            type="button"
            className="rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-500 dark:border-white/10 dark:text-slate-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-5">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>
  );
};

export default Modal;
