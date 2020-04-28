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

import { AuditMessage } from '../model/auditMessage';
import { PerunException } from '../model/perunException';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../configuration';



@Injectable({
  providedIn: 'root'
})
export class AuditMessagesManagerService {

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
     * Log arbitrary auditer message/event to the audit log. 
     * @param msg Message to be logged
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public auditMessagesManagerLog(msg: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public auditMessagesManagerLog(msg: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public auditMessagesManagerLog(msg: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public auditMessagesManagerLog(msg: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (msg === null || msg === undefined) {
            throw new Error('Required parameter msg was null or undefined when calling auditMessagesManagerLog.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (msg !== undefined && msg !== null) {
            queryParameters = queryParameters.set('msg', <any>msg);
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


        return this.httpClient.post<any>(`${this.configuration.basePath}/urlinjsonout/AuditMessagesManager/log`,
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
     * Creates new auditer consumer with last processed id which equals current auditer log max id. 
     * @param consumerName 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public createAuditerConsumer(consumerName: string, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public createAuditerConsumer(consumerName: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public createAuditerConsumer(consumerName: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public createAuditerConsumer(consumerName: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (consumerName === null || consumerName === undefined) {
            throw new Error('Required parameter consumerName was null or undefined when calling createAuditerConsumer.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (consumerName !== undefined && consumerName !== null) {
            queryParameters = queryParameters.set('consumerName', <any>consumerName);
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


        return this.httpClient.post<any>(`${this.configuration.basePath}/urlinjsonout/AuditMessagesManager/createAuditerConsumer`,
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
     * Get all auditer consumers as a map with key&#x3D;value pairs like String(name)&#x3D;Integer(lastProcessedId). 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getAllAuditerConsumers(observe?: 'body', reportProgress?: boolean): Observable<{ [key: string]: number; }>;
    public getAllAuditerConsumers(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<{ [key: string]: number; }>>;
    public getAllAuditerConsumers(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<{ [key: string]: number; }>>;
    public getAllAuditerConsumers(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

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


        return this.httpClient.get<{ [key: string]: number; }>(`${this.configuration.basePath}/json/AuditMessagesManager/getAllAuditerConsumers`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Get count of all messages stored in auditer logs. 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getAuditerMessagesCount(observe?: 'body', reportProgress?: boolean): Observable<number>;
    public getAuditerMessagesCount(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<number>>;
    public getAuditerMessagesCount(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<number>>;
    public getAuditerMessagesCount(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

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


        return this.httpClient.get<number>(`${this.configuration.basePath}/json/AuditMessagesManager/getAuditerMessagesCount`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Get ID of last (newest) message in auditer logs. 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getLastMessageId(observe?: 'body', reportProgress?: boolean): Observable<number>;
    public getLastMessageId(observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<number>>;
    public getLastMessageId(observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<number>>;
    public getLastMessageId(observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

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


        return this.httpClient.get<number>(`${this.configuration.basePath}/json/AuditMessagesManager/getLastMessageId`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * Returns 100 newest audit messages from audit log. If there is a less messages than 100, then all of them are returned OR Returns exact number of newest audit messages defined by \&#39;count\&#39; param (disregarding message IDs). If there is less messages present, then all of them are returned.. 
     * @param count Messages limit
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getMessages(count?: number, observe?: 'body', reportProgress?: boolean): Observable<Array<AuditMessage>>;
    public getMessages(count?: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<AuditMessage>>>;
    public getMessages(count?: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<AuditMessage>>>;
    public getMessages(count?: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (count !== undefined && count !== null) {
            queryParameters = queryParameters.set('count', <any>count);
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


        return this.httpClient.get<Array<AuditMessage>>(`${this.configuration.basePath}/json/AuditMessagesManager/getMessages`,
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
     * Returns all messages with IDs within the range from max(ID) to (max(ID)-count), where number of returned messages is equal or less than \&#39;count\&#39; param, because some IDs could be skipped in the sequence. 
     * @param count Number of IDs to subtract from max_id
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getMessagesByCount(count: number, observe?: 'body', reportProgress?: boolean): Observable<Array<AuditMessage>>;
    public getMessagesByCount(count: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<AuditMessage>>>;
    public getMessagesByCount(count: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<AuditMessage>>>;
    public getMessagesByCount(count: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (count === null || count === undefined) {
            throw new Error('Required parameter count was null or undefined when calling getMessagesByCount.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (count !== undefined && count !== null) {
            queryParameters = queryParameters.set('count', <any>count);
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


        return this.httpClient.get<Array<AuditMessage>>(`${this.configuration.basePath}/json/AuditMessagesManager/getMessagesByCount`,
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
     * Returns list of AuditMessages from audit log with IDs &gt; lastProcessedId for registered auditer consumer specified by consumerName param. 
     * @param consumerName 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public pollConsumerMessages(consumerName: string, observe?: 'body', reportProgress?: boolean): Observable<Array<AuditMessage>>;
    public pollConsumerMessages(consumerName: string, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<Array<AuditMessage>>>;
    public pollConsumerMessages(consumerName: string, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<Array<AuditMessage>>>;
    public pollConsumerMessages(consumerName: string, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (consumerName === null || consumerName === undefined) {
            throw new Error('Required parameter consumerName was null or undefined when calling pollConsumerMessages.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (consumerName !== undefined && consumerName !== null) {
            queryParameters = queryParameters.set('consumerName', <any>consumerName);
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


        return this.httpClient.get<Array<AuditMessage>>(`${this.configuration.basePath}/json/AuditMessagesManager/pollConsumerMessages`,
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
     * Set ID of last processed message for specified consumer. 
     * @param consumerName 
     * @param lastProcessedId id of message to what consumer will be set
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public setLastProcessedId(consumerName: string, lastProcessedId: number, observe?: 'body', reportProgress?: boolean): Observable<any>;
    public setLastProcessedId(consumerName: string, lastProcessedId: number, observe?: 'response', reportProgress?: boolean): Observable<HttpResponse<any>>;
    public setLastProcessedId(consumerName: string, lastProcessedId: number, observe?: 'events', reportProgress?: boolean): Observable<HttpEvent<any>>;
    public setLastProcessedId(consumerName: string, lastProcessedId: number, observe: any = 'body', reportProgress: boolean = false ): Observable<any> {
        if (consumerName === null || consumerName === undefined) {
            throw new Error('Required parameter consumerName was null or undefined when calling setLastProcessedId.');
        }
        if (lastProcessedId === null || lastProcessedId === undefined) {
            throw new Error('Required parameter lastProcessedId was null or undefined when calling setLastProcessedId.');
        }

        let queryParameters = new HttpParams({encoder: this.encoder});
        if (consumerName !== undefined && consumerName !== null) {
            queryParameters = queryParameters.set('consumerName', <any>consumerName);
        }
        if (lastProcessedId !== undefined && lastProcessedId !== null) {
            queryParameters = queryParameters.set('lastProcessedId', <any>lastProcessedId);
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


        return this.httpClient.post<any>(`${this.configuration.basePath}/urlinjsonout/AuditMessagesManager/setLastProcessedId`,
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
