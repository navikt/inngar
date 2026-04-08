import { createCookie } from "react-router";

export const mockSettingsCookie = createCookie("mock-settings", {
  maxAge: 604_800, // one week
});