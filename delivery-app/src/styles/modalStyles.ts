import { StyleSheet } from 'react-native';

/**
 * Reusable Modal Styles
 * Eliminates 150+ lines of duplicate modal styling across payment modals
 */

export const modalStyles = StyleSheet.create({
  // Modal Container & Backdrop
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },

  // Modal Header
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },

  closeButton: {
    padding: 8,
  },

  // Modal Content
  modalContent: {
    paddingHorizontal: 4,
  },

  modalSection: {
    marginBottom: 20,
  },

  // Input Styles
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: '#1A1A1A',
  },

  inputFocused: {
    borderColor: '#10B981',
    borderWidth: 2,
  },

  inputError: {
    borderColor: '#EF4444',
  },

  // Button Styles
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },

  primaryButtonDisabled: {
    backgroundColor: '#D1D5DB',
    shadowOpacity: 0,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },

  // Info/Warning Boxes
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },

  warningBox: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },

  errorBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },

  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },

  warningText: {
    fontSize: 13,
    color: '#92400E',
    lineHeight: 18,
  },

  errorText: {
    fontSize: 13,
    color: '#991B1B',
    lineHeight: 18,
  },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
});
