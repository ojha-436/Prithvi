import { Component, type ErrorInfo, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches render-time errors anywhere in the tree and shows a graceful,
 * on-brand fallback instead of a blank white screen — so a single component
 * failure (e.g. a lazy route or a chart) never takes down the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production this is where you'd forward to an error reporter.
    console.error("Unhandled UI error:", error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div role="alert" className="bg-paper grid min-h-dvh place-items-center px-6 text-center">
        <div className="max-w-sm">
          <Logo className="mx-auto" />
          <h1 className="mt-6 font-display text-2xl font-semibold tracking-tight">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            An unexpected error interrupted the app. Reloading usually fixes it — your saved data is
            safe.
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Reload Prithvi
          </Button>
        </div>
      </div>
    );
  }
}
