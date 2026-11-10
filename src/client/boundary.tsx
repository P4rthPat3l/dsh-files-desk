import React from 'react';
import type { ReactNode } from 'react';

/** What the boundary renders when it catches a failure. */
export interface SurfaceBoundaryProps {
  title: string;
  hint: string;
  reloadLabel: string;
  children?: ReactNode;
}

/** The boundary's own state. */
interface SurfaceBoundaryState {
  failed: boolean;
}

/**
 * Keep one plugin surface from taking the sidebar down when it throws.
 *
 * The fallback is intentionally small: a message and a reload of the page. The
 * failure still reaches the browser console through React; the plugin adds no
 * logging of its own and never logs file contents.
 */
export class SurfaceBoundary extends React.Component<SurfaceBoundaryProps, SurfaceBoundaryState> {
  constructor(props: SurfaceBoundaryProps) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError(): SurfaceBoundaryState {
    return { failed: true };
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <section className="fdp-root" data-dsh-files="">
        <div className="fdp-empty">
          <p className="fdp-empty-title">{this.props.title}</p>
          <p className="fdp-empty-hint">{this.props.hint}</p>
          <button type="button" className="fdp-button" onClick={() => window.location.reload()}>
            {this.props.reloadLabel}
          </button>
        </div>
      </section>
    );
  }
}
