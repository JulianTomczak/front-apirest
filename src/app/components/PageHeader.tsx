import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  primaryAction?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon, primaryAction }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div className="page-header-left">
        <div>
          <h1 className="page-heading-title">
            {icon && <span aria-hidden="true">{icon}</span>}
            {title}
          </h1>
          {subtitle && <p className="page-heading-subtitle">{subtitle}</p>}
        </div>
      </div>
      {primaryAction && <div className="page-header-actions">{primaryAction}</div>}
    </header>
  );
}
