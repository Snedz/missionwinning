/**
 * Client nav must not fall through to the app-group loading
 * boundary. Keep this file light — a page import suspends and
 * the group skeleton wins.
 */
export default function ActiveLoading() {
  return <div className="house-compose-live space-y-4" aria-busy="true" />;
}
