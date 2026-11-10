import type { SidebarRightService } from './harness.js';

/** Runtime handles shared by code that runs outside a slot. */
export const runtime: { sidebarRight: SidebarRightService | null } = {
  sidebarRight: null,
};
