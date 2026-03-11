import type { ReactNode } from "react";
import "./BinPageLayout.css";

type BinPageLayoutProps = {
  sidebar: ReactNode;
  children: ReactNode;
};

export const BinPageLayout = ({ sidebar, children }: BinPageLayoutProps) => {
  return (
    <div className="bin-layout">
      <aside className="bin-layout__sidebar">{sidebar}</aside>
      <section className="bin-layout__main">{children}</section>
    </div>
  );
};
