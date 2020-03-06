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


/**
 * type of propagation of service settings to a destination
 */
export type DestinationPropagationType = 'PARALLEL' | 'SERIAL' | 'DUMMY';

export const DestinationPropagationType = {
    PARALLEL: 'PARALLEL' as DestinationPropagationType,
    SERIAL: 'SERIAL' as DestinationPropagationType,
    DUMMY: 'DUMMY' as DestinationPropagationType
};
