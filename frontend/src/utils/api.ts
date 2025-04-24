// Utility function to handle API requests with token refresh capabilities
export const apiRequest = async (url: string, options: RequestInit = {}) => {
  const fetchOptions = {
    ...options,
    credentials: 'include' as RequestCredentials,
    headers: {
      ...options.headers,
    },
  };

  try {
    // Make the initial request
    let response = await fetch(url, fetchOptions);

    // If we get a 401 Unauthorized, the token might have expired
    if (response.status === 401) {
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

    // Parse the JSON response
    const data = await response.json();

    // If the response is not ok, throw an error
    if (!response.ok) {
      throw new Error(data.error || 'An error occurred');
    }

    // Return the successful data
    return data;
  } catch (error) {
    // Re-throw any errors to be handled by the caller
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('An unknown error occurred');
  }
};