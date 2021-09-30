import { Injectable } from '@angular/core';
import { RegistrarManagerService } from '@perun-web-apps/perun/openapi';
import { Router } from '@angular/router';
import { parseQueryParams } from '@perun-web-apps/perun/utils';
import { RPCError } from '@perun-web-apps/perun/models';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class LinkIdentitiesService {
  constructor(private registrarService: RegistrarManagerService, private router: Router) {}

  consolidate(): Promise<void> {
    const queryParams = location.search.substring(1);
    const accessToken = parseQueryParams('formerToken', queryParams);
    return new Promise((resolve) => {
      this.registrarService.consolidate({ accessToken: accessToken }).subscribe(
        () => {
          void this.consolidatePreviousLogins(1, queryParams).then(() => {
            void this.router.navigate(['/result', 'OK']);
            resolve();
          });
        },
        (error: HttpErrorResponse) => {
          const exceptionName = (error.error as RPCError).name;
          let linkerResult = 'UNKNOWN_ERROR';
          switch (exceptionName) {
            case 'InvalidTokenException':
              linkerResult = 'TOKEN_EXPIRED';
              break;
            case 'ExpiredTokenException':
              linkerResult = 'TOKEN_EXPIRED';
              break;
            case 'IdentityUnknownException':
              linkerResult = 'IDENTITY_UNKNOWN';
              break;
            case 'IdentityAlreadyInUseException':
              linkerResult = 'IDENTITY_REGISTERED_ALREADY';
              break;
            case 'IdentityIsSameException':
              linkerResult = 'IDENTITY_IDENTICAL';
              break;
            case 'IdentitiesAlreadyJoinedException':
              linkerResult = 'IDENTITY_LINKED';
              break;
          }
          void this.router.navigate(['/result', linkerResult], {
            queryParamsHandling: 'merge',
          });
          resolve();
        }
      );
    });
  }

  consolidatePreviousLogins(index: number, queryParams: string): Promise<void> {
    return new Promise((resolve) => {
      const accessToken = parseQueryParams('formerToken' + index.toString(), queryParams);
      if (accessToken === undefined || accessToken === null || accessToken === '') {
        resolve();
      } else {
        this.registrarService.consolidate({ accessToken: accessToken }).subscribe(
          () => {
            void this.consolidatePreviousLogins(index + 1, queryParams).then(() => resolve());
          },
          () => {
            void this.consolidatePreviousLogins(index + 1, queryParams).then(() => resolve());
          }
        );
      }
    });
  }
}
