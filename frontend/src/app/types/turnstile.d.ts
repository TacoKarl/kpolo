export {};

declare global {
  interface Window {
    turnstile?: {
      render: (
          container: HTMLElement,
          options: {
            sitekey: string | undefined;
            callback?: (token: string) => void;
            "error-callback"?: () => void;
          }
      ) => string;
      remove: (widgetId: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}