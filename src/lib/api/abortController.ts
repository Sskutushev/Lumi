// src/lib/api/abortController.ts
class AbortControllerService {
  private static instance: AbortControllerService;
  private controllers: Map<string, AbortController> = new Map();

  private constructor() {}

  static getInstance(): AbortControllerService {
    if (!AbortControllerService.instance) {
      AbortControllerService.instance = new AbortControllerService();
    }
    return AbortControllerService.instance;
  }

  create(key: string): AbortController {
    // Cancel any existing controller with the same key
    this.abort(key);

    const controller = new AbortController();
    this.controllers.set(key, controller);
    return controller;
  }

  abort(key: string): void {
    const controller = this.controllers.get(key);
    if (controller) {
      controller.abort();
      this.controllers.delete(key);
    }
  }

  cleanup(key: string): void {
    this.controllers.delete(key);
  }
}

export const abortControllerService = AbortControllerService.getInstance();
