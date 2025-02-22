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
import { User } from './user';
import { Attribute } from './attribute';
import { UserExtSource } from './userExtSource';

export interface Sponsor {
  user: User;
  userExtSources: Array<UserExtSource>;
  userAttributes: Array<Attribute>;
  /**
   * Date in format yyyy-MM-dd}
   */
  validityTo: string;
  active: boolean;
}
