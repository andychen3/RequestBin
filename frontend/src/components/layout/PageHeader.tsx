import type { ReactNode } from "react";
import "./PageHeader.css";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  rightActions?: ReactNode;
};

export const PageHeader = ({ title, subtitle, rightActions }: PageHeaderProps) => {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
      </div>
      {rightActions && <div className="page-header__actions">{rightActions}</div>}
    </div>
  );
};
