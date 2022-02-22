import { Injectable } from '@angular/core';
import { PDFService } from './pdf.service';

interface MemberData {
  name: string;
  status: string;
  login?: string;
  password?: string;
}

interface MemberDataCell {
  text?: string;
  colSpan?: number;
  rowSpan?: number;
  alignment?: string;
  border?: boolean | boolean[];
  margin?: number[];
  fontSize?: number;
  bold?: boolean;
  color?: string;
}

interface MemberDataTable {
  heights: number[];
  widths: number[];
  body: MemberDataCell[][];
}

export interface MemberDataTableWrapper {
  table: MemberDataTable;
}

@Injectable({
  providedIn: 'root',
})
export class SponsoredMembersPdfService {
  constructor(private pdfService: PDFService) {}

  private static generateTableForUser(memberData: MemberData): MemberDataTableWrapper {
    const name = memberData.name.replace(';', ' ').split(';')[0];
    if (memberData.status !== 'OK') {
      const error = memberData.status;
      return this.generateErrorRowForUser(name, error);
    }

    const login = memberData.login;
    const password = memberData.password;
    return SponsoredMembersPdfService.generateRowForUser(name, login, password);
  }

  private static generateErrorRowForUser(name: string, error: string): MemberDataTableWrapper {
    const nameCell: MemberDataCell = {
      text: name,
      colSpan: 1,
      alignment: 'center',
      bold: true,
      fontSize: 12,
      margin: [20, 25],
      color: 'red',
    };
    const errorCell: MemberDataCell = {
      text: error,
      alignment: 'center',
      bold: true,
      color: 'red',
    };

    return {
      table: {
        heights: [30, 1, 1],
        widths: [249, 249],
        body: [[nameCell, errorCell]],
      },
    };
  }

  private static generateRowForUser(
    name: string,
    login: string,
    password: string
  ): MemberDataTableWrapper {
    return {
      table: {
        heights: [30, 0],
        widths: [120, 120, 120, 120],
        body: [
          [
            SponsoredMembersPdfService.generateNameCell(name),
            {},
            SponsoredMembersPdfService.getPasswordLabelCell(),
            SponsoredMembersPdfService.generatePasswordCell(password),
          ],
          [
            SponsoredMembersPdfService.getLoginLabelCell(),
            SponsoredMembersPdfService.generateLoginCell(login),
            {},
            {},
          ],
        ],
      },
    };
  }

  private static generateNameCell(name: string): MemberDataCell {
    return {
      text: name,
      colSpan: 2,
      alignment: 'center',
      border: [true, true, true, false],
      bold: true,
      fontSize: 12,
      margin: [10, 10],
    };
  }

  private static generatePasswordCell(password: string): MemberDataCell {
    return {
      text: password === undefined || password === null ? 'N/A' : password,
      border: [false, true, true, true],
      bold: true,
      margin: [0, 25],
      rowSpan: 2,
      alignment: 'left',
    };
  }

  private static generateLoginCell(login: string): MemberDataCell {
    return {
      text: login === undefined || login === null ? 'N/A' : login,
      border: [false, false, true, true],
      bold: true,
    };
  }

  private static getLoginLabelCell(): MemberDataCell {
    return {
      text: 'Login:',
      border: [true, false, false, true],
      alignment: 'right',
      margin: [0, 0, 0, 10],
    };
  }

  private static getPasswordLabelCell(): MemberDataCell {
    return {
      text: 'Password:',
      border: [true, true, false, true],
      alignment: 'right',
      margin: [0, 25],
      rowSpan: 2,
    };
  }

  /**
   * Example input:
   * [
   *   {
   *     name: "John;Doe;john.d@mail.com;note"
   *     status: "OK",
   *     login: "guest",
   *     password: "blabla"
   *   },
   *   {
   *     name: "John;Indie;john.I@mail.com;note"
   *     status: "Error: sdfsdfsdf"
   *   }
   * ]
   * @param results generated members' data, see example above
   */
  async generate(results: MemberData[]): Promise<void> {
    const userData: MemberDataTableWrapper[] = [];
    for (const memberData of results) {
      userData.push(SponsoredMembersPdfService.generateTableForUser(memberData));
    }

    const data = {
      content: userData,
    };

    return this.pdfService.generatePdf(data);
  }
}
