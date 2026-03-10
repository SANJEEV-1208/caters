import { Alert } from 'react-native';

/**
 * Common alert helper functions to reduce duplication
 */

export const showSuccessAlert = (message: string, onOk?: () => void) => {
  Alert.alert('Success', message, [{ text: 'OK', onPress: onOk }]);
};

export const showErrorAlert = (message: string, onOk?: () => void) => {
  Alert.alert('Error', message, [{ text: 'OK', onPress: onOk }]);
};

export const showWarningAlert = (message: string, onOk?: () => void) => {
  Alert.alert('Warning', message, [{ text: 'OK', onPress: onOk }]);
};

export const showConfirmAlert = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  title = 'Confirm'
) => {
  Alert.alert(title, message, [
    { text: 'Cancel', style: 'cancel', onPress: onCancel },
    { text: 'Confirm', onPress: onConfirm },
  ]);
};

export const showDeleteConfirm = (
  itemName: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  Alert.alert(
    'Delete Confirmation',
    `Are you sure you want to delete ${itemName}?`,
    [
      { text: 'Cancel', style: 'cancel', onPress: onCancel },
      { text: 'Delete', style: 'destructive', onPress: onConfirm },
    ]
  );
};

export const showValidationError = (field: string, message: string) => {
  Alert.alert('Validation Error', `${field}: ${message}`);
};

export const showNetworkError = (onRetry?: () => void) => {
  Alert.alert(
    'Network Error',
    'Unable to connect to the server. Please check your internet connection and try again.',
    onRetry
      ? [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Retry', onPress: onRetry },
        ]
      : [{ text: 'OK' }]
  );
};
