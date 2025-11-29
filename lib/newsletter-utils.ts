export interface NewsletterError {
  type: "network" | "validation" | "server" | "rate_limit" | "offline";
  message: string;
  code?: string;
  details?: any;
  retryable?: boolean;
  suggestions?: string[];
}

export interface SubmissionStatus {
  state:
    | "idle"
    | "validating"
    | "submitting"
    | "processing"
    | "success"
    | "error";
  progress?: number;
  message?: string;
}

// Enhanced error categorization
export const categorizeError = (error: any): NewsletterError => {
  // Network errors
  if (error.name === "TypeError" && error.message.includes("fetch")) {
    return {
      type: "network",
      message: "Unable to connect to server",
      code: "NETWORK_ERROR",
      retryable: true,
      suggestions: [
        "Check your internet connection",
        "Try refreshing the page",
        "Wait a moment and try again",
      ],
    };
  }

  if (error.name === "AbortError") {
    return {
      type: "network",
      message: "Request was cancelled",
      code: "REQUEST_CANCELLED",
      retryable: true,
      suggestions: ["Please try again"],
    };
  }

  // HTTP status codes
  if (error.status) {
    switch (error.status) {
      case 400:
        return {
          type: "validation",
          message: error.message || "Invalid email address",
          code: "BAD_REQUEST",
          retryable: false,
          suggestions: ["Please check your email address and try again"],
        };
      case 409:
        return {
          type: "server",
          message: "You are already subscribed",
          code: "ALREADY_SUBSCRIBED",
          retryable: false,
          suggestions: [
            "Check your email for confirmation",
            "You should receive our newsletters",
          ],
        };
      case 429:
        return {
          type: "rate_limit",
          message: "Too many requests. Please wait before trying again.",
          code: "RATE_LIMIT",
          retryable: true,
          suggestions: ["Wait a few minutes before trying again"],
        };
      case 500:
      case 502:
      case 503:
        return {
          type: "server",
          message: "Server is temporarily unavailable",
          code: "SERVER_ERROR",
          retryable: true,
          suggestions: [
            "Wait a moment and try again",
            "The server is experiencing issues",
          ],
        };
      default:
        return {
          type: "server",
          message: `Server error (${error.status})`,
          code: "UNKNOWN_SERVER_ERROR",
          retryable: error.status >= 500,
          suggestions: ["Please try again later"],
        };
    }
  }

  // Offline detection
  if (!navigator.onLine) {
    return {
      type: "offline",
      message: "You appear to be offline",
      code: "OFFLINE",
      retryable: true,
      suggestions: [
        "Check your internet connection",
        "Try again when you are back online",
      ],
    };
  }

  // Default error
  return {
    type: "server",
    message: error.message || "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    retryable: true,
    suggestions: [
      "Please try again",
      "Contact support if the problem persists",
    ],
  };
};

// Retry logic with exponential backoff
export const createRetryStrategy = (maxRetries: number = 3) => {
  const delays = [1000, 2000, 4000]; // Exponential backoff

  return {
    shouldRetry: (error: NewsletterError, attempt: number) => {
      return error.retryable && attempt < maxRetries;
    },
    getDelay: (attempt: number) => {
      return delays[Math.min(attempt, delays.length - 1)];
    },
  };
};

// Network status monitoring
export const createNetworkStatusMonitor = () => {
  let isOnline = navigator.onLine;

  const listeners: ((online: boolean) => void)[] = [];

  const updateStatus = () => {
    const newStatus = navigator.onLine;
    if (newStatus !== isOnline) {
      isOnline = newStatus;
      listeners.forEach((listener) => listener(isOnline));
    }
  };

  // Event listeners for network status changes
  window.addEventListener("online", updateStatus);
  window.addEventListener("offline", updateStatus);

  return {
    isOnline: () => isOnline,
    subscribe: (listener: (online: boolean) => void) => {
      listeners.push(listener);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    },
    cleanup: () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    },
  };
};

// Enhanced fetch with retry logic
export const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retryStrategy = createRetryStrategy(),
) => {
  let lastError: any;
  let attempt = 0;

  while (attempt <= 3) {
    // Allow for original attempt + 3 retries
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (!response.ok) {
        throw { status: response.status, message: response.statusText };
      }

      return await response.json();
    } catch (error) {
      lastError = error;
      const categorizedError = categorizeError(error);

      if (!retryStrategy.shouldRetry(categorizedError, attempt)) {
        throw categorizedError;
      }

      attempt++;
      if (attempt <= 3) {
        const delay = retryStrategy.getDelay(attempt - 1);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw categorizeError(lastError);
};
// Cookie utilities
export const getSubscriptionCookie = () => {
  if (!document.cookie) {
    return null;
  }

  const cookies = document.cookie.split("; ");
  const subscriptionCookie = cookies.find((row) =>
    row.startsWith("zealnews_subscribed_newsletter="),
  );

  if (!subscriptionCookie) {
    return null;
  }

  const cookieValue = subscriptionCookie.split("=");
  return cookieValue.length > 1 ? cookieValue[1] : null;
};

// Progress tracking utilities
export const createProgressTracker = () => {
  const steps = ["validating", "submitting", "processing"];

  return {
    getProgress: (currentStep: string): number => {
      const index = steps.indexOf(currentStep);
      return index === -1 ? 0 : ((index + 1) / steps.length) * 100;
    },
    getProgressMessage: (currentStep: string): string => {
      const messages = {
        validating: "Validating your email address...",
        submitting: "Subscribing to newsletter...",
        processing: "Setting up your subscription...",
      };
      return messages[currentStep as keyof typeof messages] || "Processing...";
    },
  };
};

// Accessibility utilities
export const announceToScreenReader = (
  message: string,
  priority: "polite" | "assertive" = "polite",
) => {
  const announcement = document.createElement("div");
  announcement.setAttribute("aria-live", priority);
  announcement.setAttribute("aria-atomic", "true");
  announcement.className = "sr-only";
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
};
