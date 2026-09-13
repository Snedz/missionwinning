/**
 * Nav must not fall through to the app-group loading boundary.
 * Keep this file light — a page import suspends and the group wins.
 */
export default function BuilderLoading() {
  return <div className="house-builder" aria-busy="true" />;
}
