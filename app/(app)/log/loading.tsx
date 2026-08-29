/**
 * Nav must not fall through to the app-group loading boundary.
 * Keep this file light — a page import suspends and the group wins.
 */
export default function LogLoading() {
  return <div className="house-card house-card-hero" aria-busy="true" />;
}
