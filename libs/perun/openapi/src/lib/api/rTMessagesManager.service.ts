/**
 * Perun RPC API
 * Perun Remote Procedure Calls Application Programming Interface
 *
 * The version of the OpenAPI document: 0.0.0
 * Contact: perun@cesnet.cz
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpResponse,
  HttpEvent,
  HttpParameterCodec,
  HttpContext,
} from '@angular/common/http';
import { CustomHttpParameterCodec } from '../encoder';
import { Observable } from 'rxjs';

// @ts-ignore
import { PerunException } from '../model/perunException';
// @ts-ignore
import { RTMessage } from '../model/rTMessage';

// @ts-ignore
import { BASE_PATH, COLLECTION_FORMATS } from '../variables';
import { Configuration } from '../configuration';

@Injectable({
  providedIn: 'root',
})
export class RTMessagesManagerService {
  protected basePath = 'https://perun.cesnet.cz/krb/rpc';
  public defaultHeaders = new HttpHeaders();
  public configuration = new Configuration();
  public encoder: HttpParameterCodec;

  constructor(
    protected httpClient: HttpClient,
    @Optional() @Inject(BASE_PATH) basePath: string,
    @Optional() configuration: Configuration
  ) {
    if (configuration) {
      this.configuration = configuration;
    }
    if (typeof this.configuration.basePath !== 'string') {
      if (typeof basePath !== 'string') {
        basePath = this.basePath;
      }
      this.configuration.basePath = basePath;
    }
    this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
  }

  private addToHttpParams(httpParams: HttpParams, value: any, key?: string): HttpParams {
    if (typeof value === 'object' && value instanceof Date === false) {
      httpParams = this.addToHttpParamsRecursive(httpParams, value);
    } else {
      httpParams = this.addToHttpParamsRecursive(httpParams, value, key);
    }
    return httpParams;
  }

  private addToHttpParamsRecursive(httpParams: HttpParams, value?: any, key?: string): HttpParams {
    if (value == null) {
      return httpParams;
    }

    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        (value as any[]).forEach(
          (elem) => (httpParams = this.addToHttpParamsRecursive(httpParams, elem, key))
        );
      } else if (value instanceof Date) {
        if (key != null) {
          httpParams = httpParams.append(key, (value as Date).toISOString().substr(0, 10));
        } else {
          throw Error('key may not be null if value is Date');
        }
      } else {
        Object.keys(value).forEach(
          (k) =>
            (httpParams = this.addToHttpParamsRecursive(
              httpParams,
              value[k],
              key != null ? `${key}.${k}` : k
            ))
        );
      }
    } else if (key != null) {
      httpParams = httpParams.append(key, value);
    } else {
      throw Error('key may not be null if value is not object or array');
    }
    return httpParams;
  }

  /**
   * Sends a message to RT. Member id is sent.
   * @param memberId Member whose e-mail address will be user
   * @param queue RT queue
   * @param subject Message subject
   * @param text Message text
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public sentMessageToRTWithMemberQueue(
    memberId: number,
    queue: string,
    subject: string,
    text: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<RTMessage>;
  public sentMessageToRTWithMemberQueue(
    memberId: number,
    queue: string,
    subject: string,
    text: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<HttpResponse<RTMessage>>;
  public sentMessageToRTWithMemberQueue(
    memberId: number,
    queue: string,
    subject: string,
    text: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<HttpEvent<RTMessage>>;
  public sentMessageToRTWithMemberQueue(
    memberId: number,
    queue: string,
    subject: string,
    text: string,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<any> {
    if (memberId === null || memberId === undefined) {
      throw new Error(
        'Required parameter memberId was null or undefined when calling sentMessageToRTWithMemberQueue.'
      );
    }
    if (queue === null || queue === undefined) {
      throw new Error(
        'Required parameter queue was null or undefined when calling sentMessageToRTWithMemberQueue.'
      );
    }
    if (subject === null || subject === undefined) {
      throw new Error(
        'Required parameter subject was null or undefined when calling sentMessageToRTWithMemberQueue.'
      );
    }
    if (text === null || text === undefined) {
      throw new Error(
        'Required parameter text was null or undefined when calling sentMessageToRTWithMemberQueue.'
      );
    }

    let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
    if (memberId !== undefined && memberId !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>memberId,
        'memberId'
      );
    }
    if (queue !== undefined && queue !== null) {
      localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, <any>queue, 'queue');
    }
    if (subject !== undefined && subject !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>subject,
        'subject'
      );
    }
    if (text !== undefined && text !== null) {
      localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, <any>text, 'text');
    }

    let localVarHeaders = this.defaultHeaders;

    let localVarCredential: string | undefined;
    // authentication (BasicAuth) required
    localVarCredential = this.configuration.lookupCredential('BasicAuth');
    if (localVarCredential) {
      localVarHeaders = localVarHeaders.set('Authorization', 'Basic ' + localVarCredential);
    }

    // authentication (BearerAuth) required
    localVarCredential = this.configuration.lookupCredential('BearerAuth');
    if (localVarCredential) {
      localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
    }

    let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
    if (localVarHttpHeaderAcceptSelected === undefined) {
      // to determine the Accept header
      const httpHeaderAccepts: string[] = ['application/json'];
      localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
    }
    if (localVarHttpHeaderAcceptSelected !== undefined) {
      localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
    }

    let localVarHttpContext: HttpContext | undefined = options && options.context;
    if (localVarHttpContext === undefined) {
      localVarHttpContext = new HttpContext();
    }

    let responseType_: 'text' | 'json' | 'blob' = 'json';
    if (localVarHttpHeaderAcceptSelected) {
      if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
        responseType_ = 'text';
      } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
        responseType_ = 'json';
      } else {
        responseType_ = 'blob';
      }
    }

    return this.httpClient.post<RTMessage>(
      `${this.configuration.basePath}/urlinjsonout/rtMessagesManager/sentMessageToRT/m-q`,
      null,
      {
        context: localVarHttpContext,
        params: localVarQueryParameters,
        responseType: <any>responseType_,
        withCredentials: this.configuration.withCredentials,
        headers: localVarHeaders,
        observe: observe,
        reportProgress: reportProgress,
      }
    );
  }

  /**
   * Sends a message to RT. Only text information is sent.
   * @param queue RT queue
   * @param subject Message subject
   * @param text Message text
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public sentMessageToRTWithQueue(
    queue: string,
    subject: string,
    text: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<RTMessage>;
  public sentMessageToRTWithQueue(
    queue: string,
    subject: string,
    text: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<HttpResponse<RTMessage>>;
  public sentMessageToRTWithQueue(
    queue: string,
    subject: string,
    text: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<HttpEvent<RTMessage>>;
  public sentMessageToRTWithQueue(
    queue: string,
    subject: string,
    text: string,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<any> {
    if (queue === null || queue === undefined) {
      throw new Error(
        'Required parameter queue was null or undefined when calling sentMessageToRTWithQueue.'
      );
    }
    if (subject === null || subject === undefined) {
      throw new Error(
        'Required parameter subject was null or undefined when calling sentMessageToRTWithQueue.'
      );
    }
    if (text === null || text === undefined) {
      throw new Error(
        'Required parameter text was null or undefined when calling sentMessageToRTWithQueue.'
      );
    }

    let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
    if (queue !== undefined && queue !== null) {
      localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, <any>queue, 'queue');
    }
    if (subject !== undefined && subject !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>subject,
        'subject'
      );
    }
    if (text !== undefined && text !== null) {
      localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, <any>text, 'text');
    }

    let localVarHeaders = this.defaultHeaders;

    let localVarCredential: string | undefined;
    // authentication (BasicAuth) required
    localVarCredential = this.configuration.lookupCredential('BasicAuth');
    if (localVarCredential) {
      localVarHeaders = localVarHeaders.set('Authorization', 'Basic ' + localVarCredential);
    }

    // authentication (BearerAuth) required
    localVarCredential = this.configuration.lookupCredential('BearerAuth');
    if (localVarCredential) {
      localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
    }

    let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
    if (localVarHttpHeaderAcceptSelected === undefined) {
      // to determine the Accept header
      const httpHeaderAccepts: string[] = ['application/json'];
      localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
    }
    if (localVarHttpHeaderAcceptSelected !== undefined) {
      localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
    }

    let localVarHttpContext: HttpContext | undefined = options && options.context;
    if (localVarHttpContext === undefined) {
      localVarHttpContext = new HttpContext();
    }

    let responseType_: 'text' | 'json' | 'blob' = 'json';
    if (localVarHttpHeaderAcceptSelected) {
      if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
        responseType_ = 'text';
      } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
        responseType_ = 'json';
      } else {
        responseType_ = 'blob';
      }
    }

    return this.httpClient.post<RTMessage>(
      `${this.configuration.basePath}/urlinjsonout/rtMessagesManager/sentMessageToRT/q`,
      null,
      {
        context: localVarHttpContext,
        params: localVarQueryParameters,
        responseType: <any>responseType_,
        withCredentials: this.configuration.withCredentials,
        headers: localVarHeaders,
        observe: observe,
        reportProgress: reportProgress,
      }
    );
  }

  /**
   * Sends a message to RT. VO id is sent. Queue is not sent.
   * @param voId VO id
   * @param subject Message subject
   * @param text Message text
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public sentMessageToRTWithVo(
    voId: number,
    subject: string,
    text: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<RTMessage>;
  public sentMessageToRTWithVo(
    voId: number,
    subject: string,
    text: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<HttpResponse<RTMessage>>;
  public sentMessageToRTWithVo(
    voId: number,
    subject: string,
    text: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<HttpEvent<RTMessage>>;
  public sentMessageToRTWithVo(
    voId: number,
    subject: string,
    text: string,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<any> {
    if (voId === null || voId === undefined) {
      throw new Error(
        'Required parameter voId was null or undefined when calling sentMessageToRTWithVo.'
      );
    }
    if (subject === null || subject === undefined) {
      throw new Error(
        'Required parameter subject was null or undefined when calling sentMessageToRTWithVo.'
      );
    }
    if (text === null || text === undefined) {
      throw new Error(
        'Required parameter text was null or undefined when calling sentMessageToRTWithVo.'
      );
    }

    let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
    if (voId !== undefined && voId !== null) {
      localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, <any>voId, 'voId');
    }
    if (subject !== undefined && subject !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>subject,
        'subject'
      );
    }
    if (text !== undefined && text !== null) {
      localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, <any>text, 'text');
    }

    let localVarHeaders = this.defaultHeaders;

    let localVarCredential: string | undefined;
    // authentication (BasicAuth) required
    localVarCredential = this.configuration.lookupCredential('BasicAuth');
    if (localVarCredential) {
      localVarHeaders = localVarHeaders.set('Authorization', 'Basic ' + localVarCredential);
    }

    // authentication (BearerAuth) required
    localVarCredential = this.configuration.lookupCredential('BearerAuth');
    if (localVarCredential) {
      localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
    }

    let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
    if (localVarHttpHeaderAcceptSelected === undefined) {
      // to determine the Accept header
      const httpHeaderAccepts: string[] = ['application/json'];
      localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
    }
    if (localVarHttpHeaderAcceptSelected !== undefined) {
      localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
    }

    let localVarHttpContext: HttpContext | undefined = options && options.context;
    if (localVarHttpContext === undefined) {
      localVarHttpContext = new HttpContext();
    }

    let responseType_: 'text' | 'json' | 'blob' = 'json';
    if (localVarHttpHeaderAcceptSelected) {
      if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
        responseType_ = 'text';
      } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
        responseType_ = 'json';
      } else {
        responseType_ = 'blob';
      }
    }

    return this.httpClient.post<RTMessage>(
      `${this.configuration.basePath}/urlinjsonout/rtMessagesManager/sentMessageToRT/v`,
      null,
      {
        context: localVarHttpContext,
        params: localVarQueryParameters,
        responseType: <any>responseType_,
        withCredentials: this.configuration.withCredentials,
        headers: localVarHeaders,
        observe: observe,
        reportProgress: reportProgress,
      }
    );
  }

  /**
   * Sends a message to RT. VO id is sent.
   * @param voId VO id
   * @param queue RT queue
   * @param subject Message subject
   * @param text Message text
   * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
   * @param reportProgress flag to report request and response progress.
   */
  public sentMessageToRTWithVoQueue(
    voId: number,
    queue: string,
    subject: string,
    text: string,
    observe?: 'body',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<RTMessage>;
  public sentMessageToRTWithVoQueue(
    voId: number,
    queue: string,
    subject: string,
    text: string,
    observe?: 'response',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<HttpResponse<RTMessage>>;
  public sentMessageToRTWithVoQueue(
    voId: number,
    queue: string,
    subject: string,
    text: string,
    observe?: 'events',
    reportProgress?: boolean,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<HttpEvent<RTMessage>>;
  public sentMessageToRTWithVoQueue(
    voId: number,
    queue: string,
    subject: string,
    text: string,
    observe: any = 'body',
    reportProgress: boolean = false,
    options?: { httpHeaderAccept?: 'application/json'; context?: HttpContext }
  ): Observable<any> {
    if (voId === null || voId === undefined) {
      throw new Error(
        'Required parameter voId was null or undefined when calling sentMessageToRTWithVoQueue.'
      );
    }
    if (queue === null || queue === undefined) {
      throw new Error(
        'Required parameter queue was null or undefined when calling sentMessageToRTWithVoQueue.'
      );
    }
    if (subject === null || subject === undefined) {
      throw new Error(
        'Required parameter subject was null or undefined when calling sentMessageToRTWithVoQueue.'
      );
    }
    if (text === null || text === undefined) {
      throw new Error(
        'Required parameter text was null or undefined when calling sentMessageToRTWithVoQueue.'
      );
    }

    let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
    if (voId !== undefined && voId !== null) {
      localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, <any>voId, 'voId');
    }
    if (queue !== undefined && queue !== null) {
      localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, <any>queue, 'queue');
    }
    if (subject !== undefined && subject !== null) {
      localVarQueryParameters = this.addToHttpParams(
        localVarQueryParameters,
        <any>subject,
        'subject'
      );
    }
    if (text !== undefined && text !== null) {
      localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, <any>text, 'text');
    }

    let localVarHeaders = this.defaultHeaders;

    let localVarCredential: string | undefined;
    // authentication (BasicAuth) required
    localVarCredential = this.configuration.lookupCredential('BasicAuth');
    if (localVarCredential) {
      localVarHeaders = localVarHeaders.set('Authorization', 'Basic ' + localVarCredential);
    }

    // authentication (BearerAuth) required
    localVarCredential = this.configuration.lookupCredential('BearerAuth');
    if (localVarCredential) {
      localVarHeaders = localVarHeaders.set('Authorization', 'Bearer ' + localVarCredential);
    }

    let localVarHttpHeaderAcceptSelected: string | undefined = options && options.httpHeaderAccept;
    if (localVarHttpHeaderAcceptSelected === undefined) {
      // to determine the Accept header
      const httpHeaderAccepts: string[] = ['application/json'];
      localVarHttpHeaderAcceptSelected = this.configuration.selectHeaderAccept(httpHeaderAccepts);
    }
    if (localVarHttpHeaderAcceptSelected !== undefined) {
      localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
    }

    let localVarHttpContext: HttpContext | undefined = options && options.context;
    if (localVarHttpContext === undefined) {
      localVarHttpContext = new HttpContext();
    }

    let responseType_: 'text' | 'json' | 'blob' = 'json';
    if (localVarHttpHeaderAcceptSelected) {
      if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
        responseType_ = 'text';
      } else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
        responseType_ = 'json';
      } else {
        responseType_ = 'blob';
      }
    }

    return this.httpClient.post<RTMessage>(
      `${this.configuration.basePath}/urlinjsonout/rtMessagesManager/sentMessageToRT/v-q`,
      null,
      {
        context: localVarHttpContext,
        params: localVarQueryParameters,
        responseType: <any>responseType_,
        withCredentials: this.configuration.withCredentials,
        headers: localVarHeaders,
        observe: observe,
        reportProgress: reportProgress,
      }
    );
  }
}
