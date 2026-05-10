import { Inbox } from "lucide-react";

const EmptyState = ({ title = "Nothing here yet", description = "" }) => (
  <div className="card p-10 text-center animate-slide-up">
    <div className="w-14 h-14 rounded-xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4 animate-float">
      <Inbox className="w-6 h-6 text-brand-400" strokeWidth={1.8} />
    </div>
    <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--text-primary)" }}>{title}</h3>
    {description && <p className="text-sm max-w-sm mx-auto" style={{ color: "var(--text-secondary)" }}>{description}</p>}
  </div>
);

export default EmptyState;
