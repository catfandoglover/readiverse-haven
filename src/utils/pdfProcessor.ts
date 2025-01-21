import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
import type { PDFDocumentProxy } from 'pdfjs-dist';

// Configure the worker
GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.min.js`;

export interface ProcessedPage {
  content: string;
  pageNum: number;
}

export class PDFProcessor {
  private document: PDFDocumentProxy | null = null;

  async loadDocument(file: ArrayBuffer): Promise<void> {
    try {
      console.log('Starting PDF document load...');
      this.document = await getDocument({ data: file }).promise;
      console.log('PDF document loaded successfully');
    } catch (error) {
      console.error('Error loading PDF:', error);
      throw new Error('Failed to load PDF document');
    }
  }

  async getPageCount(): Promise<number> {
    if (!this.document) throw new Error('No PDF document loaded');
    return this.document.numPages;
  }

  async getPage(pageNum: number): Promise<ProcessedPage> {
    if (!this.document) throw new Error('No PDF document loaded');
    
    const page = await this.document.getPage(pageNum);
    const textContent = await page.getTextContent();
    const content = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    return {
      content,
      pageNum
    };
  }

  async getAllPages(): Promise<ProcessedPage[]> {
    if (!this.document) throw new Error('No PDF document loaded');
    
    const pageCount = await this.getPageCount();
    const pages: ProcessedPage[] = [];

    for (let i = 1; i <= pageCount; i++) {
      const page = await this.getPage(i);
      pages.push(page);
    }

    return pages;
  }

  destroy(): void {
    if (this.document) {
      this.document.destroy();
      this.document = null;
    }
  }
}