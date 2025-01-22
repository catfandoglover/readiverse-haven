import { Book } from "epubjs";

export interface ExtendedBook extends Book {
  epubcfi: (element: Node, offset?: number, ignoreClass?: string) => string;
}