/** The bundle wrapper installs this bridge before the plugin body runs. */
declare global {
  var __dshFilesDeskRequireAsync: (<T>(path: string) => Promise<T>) | undefined;
}

export {};
