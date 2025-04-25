// Utility function to handle API requests with token refresh capabilities
export const apiRequest = async(url: string, options: RequestInit = {}) => {
  const fetchOptions = {
    ...options,
    credentials: 'include' as RequestCredentials,
    headers: {
      ...options.headers,
    },
  };

  try {
    // Skip token refresh for auth-related paths
    const isAuthPath = url.includes('/api/auth/');

    // Make the initial request
    let response = await fetch(url, fetchOptions);

    // Special handling for login endpoint - don't try to refresh on 404 (invalid credentials)
    if (url.includes('/api/auth/login') && response.status === 404) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Invalid credentials');
    }

    // If we get a 401 Unauthorized and it's not an auth endpoint, try to refresh the token
    if (response.status === 401 && !isAuthPath) {
      // Try to refresh the token
      const refreshResponse = await fetch(`${process.env.HOST_DOMAIN}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      // If refresh was successful, retry the original request
      if (refreshResponse.ok) {
        // Retry the original request with the new token
        response = await fetch(url, fetchOptions);
      } else {
        // If refresh failed, throw an error to be caught by the caller
        throw new Error('Authentication expired');
      }
    }

    // If the response is not ok, throw an error
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      } catch (jsonError) {
        console.error('JSON parse error:', jsonError);
        throw new Error(response.statusText || 'An error occurred');
      }
    }

    // For successful responses, check if there's content to parse
    if (response.status === 204 || response.headers.get('content-length') === '0') {
      // No content
      return null;
    }

    try {
      // Parse the JSON response
      return await response.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return null;
    }
  } catch (error) {
    // Re-throw any errors to be handled by the caller
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
};
