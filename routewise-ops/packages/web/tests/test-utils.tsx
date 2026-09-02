import { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

/**
 * Renders with a fresh QueryClient every time, retries disabled so a test
 * that expects a fetch failure doesn't sit there retrying before failing.
 */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}
