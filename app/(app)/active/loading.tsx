import { ActiveWorkoutPage } from '@/page-components/ActiveWorkoutPage';

/**
 * Client nav must not fall through to the app-group loading
 * boundary. First paint stays the compose page.
 */
export default function ActiveLoading() {
  return <ActiveWorkoutPage />;
}
