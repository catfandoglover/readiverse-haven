import { Book as EPUBBook } from "epubjs";

declare module "epubjs" {
  interface Book extends EPUBBook {
    package?: {
      metadata?: any;
    };
  }
}