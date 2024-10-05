import React from "react";

import BreadcrumbNav from "./bread-crumb-header";
import { Navbar } from "./navbar";

/**
 * Props for the ContentLayout component.
 */
interface ContentLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The title to be displayed in the Navbar */
  title: string;
}

/**
 * ContentLayout component that provides a consistent layout structure for content pages.
 * It includes a Navbar with a title and a scrollable container for the main content.
 *
 * @param {ContentLayoutProps} props - The component props
 * @returns {React.ReactElement} The rendered ContentLayout component
 */
export const ContentLayout: React.FC<ContentLayoutProps> = React.memo(
  ({ title, children }) => {
    return (
      <div className="flex h-screen flex-col">
        <Navbar title={title} />
        <div className="flex-grow overflow-hidden">
          <main className="h-full overflow-y-auto px-4 pb-8 pt-8 sm:px-8 scrollbar-hide">
            <BreadcrumbNav />
            {children}
          </main>
        </div>
      </div>
    );
  },
);

ContentLayout.displayName = "ContentLayout";
