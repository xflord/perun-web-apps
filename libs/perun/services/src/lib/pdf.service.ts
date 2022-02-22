/* eslint-disable
   @typescript-eslint/no-explicit-any,
   @typescript-eslint/no-unsafe-member-access,
   @typescript-eslint/no-unsafe-call,
   @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@angular/core';
import { MemberDataTableWrapper } from './sponsored-members-pdf.service';

interface PDFData {
  content: MemberDataTableWrapper[];
}

@Injectable({
  providedIn: 'root',
})
export class PDFService {
  pdfMake: any;

  async generatePdf(data: PDFData): Promise<void> {
    await this.loadPdfMake();

    this.pdfMake.createPdf(data).open();
  }

  private async loadPdfMake(): Promise<void> {
    // we use lazy-loading to download the library only when it is needed
    if (!this.pdfMake) {
      const pdfMakeModule = await import('pdfmake/build/pdfmake');
      const pdfFontsModule = await import('pdfmake/build/vfs_fonts');
      this.pdfMake = pdfMakeModule.default;
      this.pdfMake.vfs = pdfFontsModule.default.pdfMake.vfs;
    }
  }
}
