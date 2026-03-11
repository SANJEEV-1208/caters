import { useState, useCallback } from 'react';
import { showSuccessAlert, showErrorAlert } from '../utils/alertHelpers';

interface UseAsyncOperationOptions {
  onSuccess?: (result?: unknown) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  showSuccessAlert?: boolean;
  showErrorAlert?: boolean;
}

interface UseAsyncOperationReturn {
  loading: boolean;
  execute: <T>(
    operation: () => Promise<T>,
    options?: UseAsyncOperationOptions
  ) => Promise<T | undefined>;
}

/**
 * Custom hook to handle async operations with loading states and error handling
 * Eliminates repetitive try-catch-finally patterns across the app
 *
 * @example
 * const { loading, execute } = useAsyncOperation();
 *
 * const handleSave = async () => {
 *   await execute(
 *     () => saveData(formData),
 *     {
 *       successMessage: 'Data saved successfully',
 *       onSuccess: () => router.back()
 *     }
 *   );
 * };
 */
export const useAsyncOperation = (): UseAsyncOperationReturn => {
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      options: UseAsyncOperationOptions = {}
    ): Promise<T | undefined> => {
      const {
        onSuccess,
        onError,
        successMessage,
        errorMessage,
        showSuccessAlert: shouldShowSuccess = Boolean(successMessage),
        showErrorAlert: shouldShowError = true,
      } = options;

      try {
        setLoading(true);
        const result = await operation();

        // Show success alert if message provided
        if (shouldShowSuccess && successMessage) {
          showSuccessAlert(successMessage, onSuccess);
        } else if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        console.error('Async operation failed:', error);

        const errorMsg =
          errorMessage ||
          (error instanceof Error ? error.message : 'Operation failed. Please try again.');

        // Show error alert if enabled
        if (shouldShowError) {
          showErrorAlert(errorMsg);
        }

        // Call error callback if provided
        if (onError && error instanceof Error) {
          onError(error);
        }

        return undefined;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { loading, execute };
};
