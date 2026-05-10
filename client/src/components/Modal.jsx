import { X } from "lucide-react";

const Modal = ({ isOpen, open, onClose, title, children }) => {
  if (!isOpen && !open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      style={{ background: "rgba(0, 0, 0, 0.6)", backdropFilter: "blur(4px)" }}>
      <div
        className="relative w-full max-w-lg rounded-xl p-6 animate-scale-in max-h-[85vh] overflow-y-auto"
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold font-display" style={{ color: "var(--text-primary)" }}>{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:bg-white/[0.06]"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
