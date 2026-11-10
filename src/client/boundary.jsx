import React from 'react';

/**
 * Keep one plugin surface from taking the sidebar down when it throws.
 *
 * The fallback is intentionally small: a message and a reload of the page. The
 * failure still reaches the browser console through React; the plugin adds no
 * logging of its own and never logs file contents.
 */
export class SurfaceBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
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
