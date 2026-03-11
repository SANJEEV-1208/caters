import { StyleSheet } from 'react-native';

/**
 * Shared Screen Styles
 * Eliminates duplicate screen-level style patterns across app screens
 *
 * Includes:
 * - Base container layouts
 * - FAB (Floating Action Button) styles
 * - Loading container
 * - Empty state patterns
 */

export const screenStyles = StyleSheet.create({
  // Base Container
  container: {
    flex: 1,
    backgroundColor: '#F8F8F8',
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },

  // Floating Action Button (FAB)
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  // Content Scrollview
  content: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  // List Content
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },

  // Stats Bar (used in apartments, customers, etc.)
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },

  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },

  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },

  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 16,
  },

  // Section Styles (used in forms)
  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  sectionHint: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
});
