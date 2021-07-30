export interface IEnvironment {
    production: boolean;
    // Enables use of ng.profiler.timeChangeDetection(); in browser console
    apiUrl: string;
    apiHost: string;
  }