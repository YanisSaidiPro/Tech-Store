export const NOTIFICATIONS_REFRESH_EVENT = 'techstore-notifications-refresh'

export function emitNotificationsRefresh() {
  window.dispatchEvent(new CustomEvent(NOTIFICATIONS_REFRESH_EVENT))
}
