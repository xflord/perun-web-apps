import { Injectable } from '@angular/core';
import { PDFService } from './pdf.service';

@Injectable({
  providedIn: 'root'
})
export class SponsoredMembersPdfService {

  constructor(
    private pdfService: PDFService
  ) { }

  private static generateTableForUser(rawName, result): any {
    const name = rawName.replace(';', ' ').split(';')[0];
    if (result.status !== "OK") {
      const error = result.status;
      return this.generateErrorRowForUser(name, error);
    }

    const login = result.login;
    const password = result.password;
    return SponsoredMembersPdfService.generateRowForUser(name, login, password);
  }

  private static generateErrorRowForUser(name: string, error: string): any {
    return {
      table: {
        heights: [30, 1, 1],
        widths: [249, 249],
        body: [
          [
            {
              text: name,
              colSpan: 1,
              alignment: 'center',
              bold: true,
              fontSize: 12,
              margin:[20, 25],
              color: 'red'
            },
            {
              text: error,
              alignment: 'center',
              bold: true,
              color: 'red'
            }
          ]
        ]
      }
    };
  }

  private static generateRowForUser(name: string, login:string, password: string): any {
    return {
      table: {
        heights: [30, 0],
        widths: [120, 120, 120, 120],
        body: [
          [
            SponsoredMembersPdfService.generateNameCell(name),
            {},
            SponsoredMembersPdfService.getPasswordLabelCell(),
            SponsoredMembersPdfService.generatePasswordCell(password)
          ],
          [
            SponsoredMembersPdfService.getLoginLabelCell(),
            SponsoredMembersPdfService.generateLoginCell(login),
            {},
            {}
          ]
        ]
      }
    };
  }

  private static generateNameCell(name: string): any {
    return {
      text: name,
      colSpan: 2,
      alignment: 'center',
      border: [true, true, true, false],
      bold: true,
      fontSize: 12,
      margin:[10, 10]
    };
  }

  private static generatePasswordCell(password: string): any {
    return {
      text: password === undefined || password === null ? 'N/A' : password,
      border: [false, true, true, true],
      bold: true,
      margin: [0, 25],
      rowSpan: 2,
      alignment: 'left'
    };
  }

  private static generateLoginCell(login: string): any {
    return {
      text: login === undefined || login === null ? 'N/A' : login,
      border: [false, false, true, true],
      bold: true
    };
  }

  private static getLoginLabelCell(): any {
    return {
      text: 'Login:',
      border: [true, false, false, true],
      alignment: 'right',
      margin: [0, 0, 0, 10]
    };
  }

  private static getPasswordLabelCell(): any {
    return {
      text: 'Password:',
      border: [true, true, false, true],
      alignment: 'right',
      margin: [0, 25],
      rowSpan: 2
    };
  }

  /**
   * Example input:
   * {
   *   John;Doe;john.d@mail.com;note : {
   *     status: "OK",
   *     login: "guest",
   *     password: "blabla"
   *   },
   *   John;Indie;john.I@mail.com;note : {
   *     status: "Error: sdfsdfsdf"
   *   }
   * }
   * @param results generated members' data, see example above
   */
  public async generate(results: any) {
    const userData = [];
    for (const memberName of Object.keys(results)) {
      userData.push(SponsoredMembersPdfService.generateTableForUser(memberName, results[memberName]));
    }

    const data = {
      content: userData
    };

    return this.pdfService.generatePdf(data)
  }
}
