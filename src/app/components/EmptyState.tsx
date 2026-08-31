import { ReactNode } from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  text?: string;
  action?: ReactNode;
}

export default function EmptyState({ icon = "📭", title, text, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <p className="empty-state-title">{title}</p>
      {text && <p className="empty-state-text">{text}</p>}
      {action}
    </div>
  );
}
