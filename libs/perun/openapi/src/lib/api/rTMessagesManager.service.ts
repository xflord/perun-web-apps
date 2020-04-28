/**
 * Perun RPC API
 * Perun Remote Procedure Calls Application Programming Interface
 *
 * The version of the OpenAPI document: 3.10.0
 * Contact: perun@cesnet.cz
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent, HttpParameterCodec }       from '@angular/common/http';
import { CustomHttpParameterCodec }                          from '../encoder';
import { Observable }                                        from 'rxjs';

import { PerunException } from '../model/perunException';
import { RTMessage } from '../model/rTMessage';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';



@Injectable({
  providedIn: 'root'
})
export class RTMessagesManagerService {

    protected basePath = 'https://perun.cesnet.cz/krb/rpc';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();
    public encoder: HttpParameterCodec;

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string, @Optional() configuration: Configuration) {
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



    /**
     * Sends a message to RT. Member id is sent.
     * @param memberId Member whose e-mail address will be user
     * @param queue RT queue
     * @param subject Message subject
     * @param text Message text
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public sentMessageToRTWithMemberQueue(memberId: number, queue: string, subject: string, text: string, observe?: 'body', reportProgress?: boolean): Observable<RTMessage>;
    public sentMessageToRTWithMemberQueue(memberId: number, queue: string, subject: string, text: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<RTMessage>>;
    public sentMessageToRTWithMemberQueue(memberId: number, queue: string, subject: string, text: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<RTMessage>>;
    public sentMessageToRTWithMemberQueue(memberId: number, queue: string, subject: string, text: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (memberId === null || memberId === undefined) {
            throw new Error('Required parameter memberId was null or undefined when calling sentMessageToRTWithMemberQueue.');
        }
        if (queue === null || queue === undefined) {
            throw new Error('Required parameter queue was null or undefined when calling sentMessageToRTWithMemberQueue.');
        }
        if (subject === null || subject === undefined) {
            throw new Error('Required parameter subject was null or undefined when calling sentMessageToRTWithMemberQueue.');
        }
        if (text === null || text === undefined) {
            throw new Error('Required parameter text was null or undefined when calling sentMessageToRTWithMemberQueue.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (memberId !== undefined && memberId !== null) {
            queryParameters = queryParameters.set('memberId', <any>memberId);
        }
        if (queue !== undefined && queue !== null) {
            queryParameters = queryParameters.set('queue', <any>queue);
        }
        if (subject !== undefined && subject !== null) {
            queryParameters = queryParameters.set('subject', <any>subject);
        }
        if (text !== undefined && text !== null) {
            queryParameters = queryParameters.set('text', <any>text);
        }

        let headers = this.defaultHeaders;

        // authentication (ApiKeyAuth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // authentication (BasicAuth) required
        if (this.configuration.username || this.configuration.password) {
            headers = headers.set('Authorization', 'Basic ' + btoa(this.configuration.username + ':' + this.configuration.password));
        }
        // authentication (BearerAuth) required
        if (this.configuration.accessToken) {
            const accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        // to determine the Accept header
        const httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        return this.httpClient.post<RTMessage>(`${this.configuration.basePath}/urlinjsonout/rtMessagesManager/sentMessageToRT/m-q`,
            null,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
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
    public sentMessageToRTWithQueue(queue: string, subject: string, text: string, observe?: 'body', reportProgress?: boolean): Observable<RTMessage>;
    public sentMessageToRTWithQueue(queue: string, subject: string, text: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<RTMessage>>;
    public sentMessageToRTWithQueue(queue: string, subject: string, text: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<RTMessage>>;
    public sentMessageToRTWithQueue(queue: string, subject: string, text: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (queue === null || queue === undefined) {
            throw new Error('Required parameter queue was null or undefined when calling sentMessageToRTWithQueue.');
        }
        if (subject === null || subject === undefined) {
            throw new Error('Required parameter subject was null or undefined when calling sentMessageToRTWithQueue.');
        }
        if (text === null || text === undefined) {
            throw new Error('Required parameter text was null or undefined when calling sentMessageToRTWithQueue.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (queue !== undefined && queue !== null) {
            queryParameters = queryParameters.set('queue', <any>queue);
        }
        if (subject !== undefined && subject !== null) {
            queryParameters = queryParameters.set('subject', <any>subject);
        }
        if (text !== undefined && text !== null) {
            queryParameters = queryParameters.set('text', <any>text);
        }

        let headers = this.defaultHeaders;

        // authentication (ApiKeyAuth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // authentication (BasicAuth) required
        if (this.configuration.username || this.configuration.password) {
            headers = headers.set('Authorization', 'Basic ' + btoa(this.configuration.username + ':' + this.configuration.password));
        }
        // authentication (BearerAuth) required
        if (this.configuration.accessToken) {
            const accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        // to determine the Accept header
        const httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        return this.httpClient.post<RTMessage>(`${this.configuration.basePath}/urlinjsonout/rtMessagesManager/sentMessageToRT/q`,
            null,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
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
    public sentMessageToRTWithVo(voId: number, subject: string, text: string, observe?: 'body', reportProgress?: boolean): Observable<RTMessage>;
    public sentMessageToRTWithVo(voId: number, subject: string, text: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<RTMessage>>;
    public sentMessageToRTWithVo(voId: number, subject: string, text: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<RTMessage>>;
    public sentMessageToRTWithVo(voId: number, subject: string, text: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (voId === null || voId === undefined) {
            throw new Error('Required parameter voId was null or undefined when calling sentMessageToRTWithVo.');
        }
        if (subject === null || subject === undefined) {
            throw new Error('Required parameter subject was null or undefined when calling sentMessageToRTWithVo.');
        }
        if (text === null || text === undefined) {
            throw new Error('Required parameter text was null or undefined when calling sentMessageToRTWithVo.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (voId !== undefined && voId !== null) {
            queryParameters = queryParameters.set('voId', <any>voId);
        }
        if (subject !== undefined && subject !== null) {
            queryParameters = queryParameters.set('subject', <any>subject);
        }
        if (text !== undefined && text !== null) {
            queryParameters = queryParameters.set('text', <any>text);
        }

        let headers = this.defaultHeaders;

        // authentication (ApiKeyAuth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // authentication (BasicAuth) required
        if (this.configuration.username || this.configuration.password) {
            headers = headers.set('Authorization', 'Basic ' + btoa(this.configuration.username + ':' + this.configuration.password));
        }
        // authentication (BearerAuth) required
        if (this.configuration.accessToken) {
            const accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        // to determine the Accept header
        const httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        return this.httpClient.post<RTMessage>(`${this.configuration.basePath}/urlinjsonout/rtMessagesManager/sentMessageToRT/v`,
            null,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
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
    public sentMessageToRTWithVoQueue(voId: number, queue: string, subject: string, text: string, observe?: 'body', reportProgress?: boolean): Observable<RTMessage>;
    public sentMessageToRTWithVoQueue(voId: number, queue: string, subject: string, text: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<RTMessage>>;
    public sentMessageToRTWithVoQueue(voId: number, queue: string, subject: string, text: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<RTMessage>>;
    public sentMessageToRTWithVoQueue(voId: number, queue: string, subject: string, text: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (voId === null || voId === undefined) {
            throw new Error('Required parameter voId was null or undefined when calling sentMessageToRTWithVoQueue.');
        }
        if (queue === null || queue === undefined) {
            throw new Error('Required parameter queue was null or undefined when calling sentMessageToRTWithVoQueue.');
        }
        if (subject === null || subject === undefined) {
            throw new Error('Required parameter subject was null or undefined when calling sentMessageToRTWithVoQueue.');
        }
        if (text === null || text === undefined) {
            throw new Error('Required parameter text was null or undefined when calling sentMessageToRTWithVoQueue.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (voId !== undefined && voId !== null) {
            queryParameters = queryParameters.set('voId', <any>voId);
        }
        if (queue !== undefined && queue !== null) {
            queryParameters = queryParameters.set('queue', <any>queue);
        }
        if (subject !== undefined && subject !== null) {
            queryParameters = queryParameters.set('subject', <any>subject);
        }
        if (text !== undefined && text !== null) {
            queryParameters = queryParameters.set('text', <any>text);
        }

        let headers = this.defaultHeaders;

        // authentication (ApiKeyAuth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["Authorization"]) {
            headers = headers.set('Authorization', this.configuration.apiKeys["Authorization"]);
        }

        // authentication (BasicAuth) required
        if (this.configuration.username || this.configuration.password) {
            headers = headers.set('Authorization', 'Basic ' + btoa(this.configuration.username + ':' + this.configuration.password));
        }
        // authentication (BearerAuth) required
        if (this.configuration.accessToken) {
            const accessToken = typeof this.configuration.accessToken === 'function'
                ? this.configuration.accessToken()
                : this.configuration.accessToken;
            headers = headers.set('Authorization', 'Bearer ' + accessToken);
        }
        // to determine the Accept header
        const httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected !== undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }


        return this.httpClient.post<RTMessage>(`${this.configuration.basePath}/urlinjsonout/rtMessagesManager/sentMessageToRT/v-q`,
            null,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

}
