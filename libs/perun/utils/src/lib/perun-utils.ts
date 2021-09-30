/**
 * Return string representing Material icon for status of given member.
 *
 * @param richMember member
 */
import {
  Group,
  Owner,
  RichMember,
  RichUser,
  User,
  Candidate,
  ApplicationMail,
  ApplicationFormItem,
  RichGroup,
  Author,
  Facility,
  Vo,
  Resource,
  AttributeDefinition,
} from '@perun-web-apps/perun/openapi';
import { Attribute } from '@perun-web-apps/perun/openapi';
import { MatDialogConfig } from '@angular/material/dialog';
import { formatDate } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { saveAs } from 'file-saver';
import { AbstractControl, AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Urns } from '@perun-web-apps/perun/urns';

export const TABLE_ITEMS_COUNT_OPTIONS = [5, 10, 25, 100];

export const emailRegexString =
  /^(([^<>+()[\]\\.,;:\s@"-#$%&=]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]+))$/;

/**
 * Gets email of given member. The preferred email has top priority, the vo-email
 * has lower priority. If there are no emails, an empty string is returned.
 *
 * @param richMember RichMember
 */
export function parseEmail(richMember: RichMember): string {
  let email = '';
  richMember?.userAttributes.forEach((attr) => {
    if (attr.friendlyName === 'preferredMail') {
      email = attr.value as string;
    }
  });

  if (email && email.length === 0 && richMember.memberAttributes !== null) {
    richMember.memberAttributes.forEach((attr) => {
      if (attr.friendlyName === 'mail' && attr.value !== null) {
        email = attr.value as string;
      }
    });
  }
  return email;
}

/**
 * Gets email of given user. If there are no emails, an empty string is returned.
 *
 * @param richUser RichUser
 */
export function parseUserEmail(richUser: RichUser): string {
  let email = '';
  if (richUser) {
    richUser.userAttributes.forEach((attr) => {
      if (attr.friendlyName === 'preferredMail') {
        email = attr.value as string;
      }
    });
  }
  return email;
}

export function parseUserLogins(richUser: RichUser): string {
  let logins = '';
  if (!!richUser && !!richUser.userAttributes) {
    richUser.userAttributes
      .filter((attr) => attr.baseFriendlyName === 'login-namespace')
      .filter((attr) => attr.value !== null)
      .forEach((attr) => {
        logins = logins.concat(attr.friendlyNameParameter, ': ', attr.value as string, ', ');
      });
  }

  if (logins.endsWith(', ')) {
    logins = logins.substring(0, logins.length - 2);
  }
  return logins;
}

/**
 * Get logins of given member.
 *
 * @param richMember member
 */
export function parseLogins(richMember: RichMember | RichUser): string {
  let logins = '';

  if (!!richMember && !!richMember.userAttributes) {
    richMember.userAttributes
      .filter((attr) => attr.baseFriendlyName === 'login-namespace')
      .filter((attr) => attr.value !== null)
      .forEach((attr) => {
        logins = logins.concat(attr.friendlyNameParameter, ': ', attr.value as string, ', ');
      });
  }

  if (logins.endsWith(', ')) {
    logins = logins.substring(0, logins.length - 2);
  }
  return logins;
}

export function parseUrnsToUrlParam(paramName: string, urns: string[]): string {
  let attributesParam = '';
  urns.forEach((a) => (attributesParam = attributesParam.concat(`&${paramName}%5B%5D=`).concat(a)));
  return attributesParam;
}

/**
 * Creates full name for given user form his titles and names.
 *
 * @param user user
 */
export function parseFullName(user: User | Candidate): string {
  let fullName = '';

  if (user.titleBefore !== null) {
    fullName += user.titleBefore + ' ';
  }
  if (user.firstName !== null) {
    fullName += user.firstName + ' ';
  }
  if (user.middleName !== null) {
    fullName += user.middleName + ' ';
  }
  if (user.lastName !== null) {
    fullName += user.lastName + ' ';
  }
  if (user.titleAfter !== null) {
    fullName += user.titleAfter + ' ';
  }
  if (fullName.endsWith(' ')) {
    fullName = fullName.substring(0, fullName.length - 1);
  }

  return fullName;
}

/**
 * Creates name for given user. Returns users name without his titles.
 *
 * @param user user
 */
export function parseName(user: User | Candidate): string {
  let fullName = '';
  if (user.firstName !== null) {
    fullName += user.firstName + ' ';
  }
  if (user.middleName !== null) {
    fullName += user.middleName + ' ';
  }
  if (user.lastName !== null) {
    fullName += user.lastName + ' ';
  }
  if (fullName.endsWith(' ')) {
    fullName = fullName.substring(0, fullName.length - 1);
  }

  return fullName;
}

/**
 * Returns friendly name transformed from camel case to sentence like string
 * (eg. friendlyName -> Friendly name)
 *
 * @param friendlyName friendly name of the attribute
 */
export function parseAttributeFriendlyName(friendlyName: string): string {
  let name = '';
  const words = friendlyName.split(/(?=[A-Z])/g);
  words.forEach((word) => {
    name = name.concat(word.toLowerCase());
    name = name.concat(' ');
  });
  name = name.charAt(0).toUpperCase() + name.slice(1, name.length - 1);

  return name;
}

/**
 * Returns attribute with specific urn from given rich user.
 * If the given user doesn't have attribute with given urn, null is returned.
 *
 * @param user user with attributes
 * @param urn urn for required attribute
 */
export function getRichUserAttribute(user: RichUser, urn: string): Attribute {
  for (const attribute of user.userAttributes) {
    const attributeUrn = attribute.namespace + ':' + attribute.friendlyName;
    if (attributeUrn === urn) {
      return attribute;
    }
  }

  return null;
}

export function parseTechnicalOwnersNames(owners: Owner[]): string {
  let names = '';
  for (const owner of owners) {
    if (owner.type === 'technical') {
      names += owner.name + ', ';
    }
  }
  if (names.endsWith(', ')) {
    names = names.substring(0, names.length - 2);
  }
  return names;
}

export async function doAfterDelay(delayMs: number, callback: () => void): Promise<void> {
  await delay(delayMs);
  callback();
}

export function delay(ms: number): Promise<number> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Returns saved ids for given key.
 *
 * @param key of local storage
 */
export function getRecentlyVisitedIds(key: string): number[] {
  const recentIds: number[] = JSON.parse(localStorage.getItem(key)) as number[];
  if (recentIds) {
    return recentIds;
  }
  return [];
}

export interface RecentItem {
  id: number;
  type: string;
  voName: string;
}

/**
 * Returns saved ids for given key.
 *
 * @param key of local storage
 */
export function getRecentlyVisitedItems(key: string): RecentItem[] {
  const recentItems: RecentItem[] = JSON.parse(localStorage.getItem(key)) as RecentItem[];
  if (recentItems) {
    return recentItems;
  }
  return [];
}

/**
 * Add entity that was just visited to localStorage.
 *
 * @param key of localStorage
 * @param item entity that was visited
 */
export function addRecentlyVisited(key: string, item: Vo | Facility | Group): void {
  if (localStorage.getItem(key) === null) {
    // if user not have any in local storage
    const recent: number[] = [];
    recent.unshift(item.id);
    localStorage.setItem(key, JSON.stringify(recent));
  } else {
    const recent: number[] = JSON.parse(localStorage.getItem(key)) as number[];
    const index = indexOfEntity(recent, item.id);
    if (index > 0) {
      // if entity is in recent but not of first place, then we remove it to placed it first
      recent.splice(index, 1);
    }
    if (index !== 0) {
      // place the element as first
      recent.unshift(item.id);
    }
    if (recent.length > 5) {
      // pop last element if length exceed 5 vo
      recent.pop();
    }
    localStorage.setItem(key, JSON.stringify(recent));
  }
}

interface RecentEntity {
  id: number;
  name: string;
  fullName?: string;
  type: string;
  voId?: number | null;
  voName?: string | null;
}

/**
 * Add object that was just visited to 'recent' localStorage.
 *
 * @param item entity that was visited
 * @param voName is used for group tooltip on dashboard (we want to know parent VO of this group)
 */
export function addRecentlyVisitedObject(item: Vo & Facility & Group, voName?: string): void {
  if (localStorage.getItem('recent') === null) {
    // if user not have any in local storage
    let recent;
    if (item.beanName === 'Group') {
      recent = [
        {
          id: item.id,
          name: item.shortName,
          fullName: item.name,
          type: item.beanName,
          voId: item.voId,
          voName: voName,
        },
      ];
    } else {
      recent = [{ id: item.id, name: item.name, type: item.beanName, voId: item.voId }];
    }
    localStorage.setItem('recent', JSON.stringify(recent));
  } else {
    const recent: RecentEntity[] = JSON.parse(localStorage.getItem('recent')) as RecentEntity[];
    let object: RecentEntity;
    if (item.beanName === 'Group') {
      object = {
        id: item.id,
        name: item.shortName,
        fullName: item.name,
        type: item.beanName,
        voId: item.voId,
        voName: voName,
      };
    } else {
      object = { id: item.id, name: item.name, type: item.beanName, voId: item.voId };
    }
    const index = indexOfObject(recent, object);
    if (index > 0) {
      // if object is in recent but not of first place, then we remove it to placed it first
      recent.splice(index, 1);
    }
    if (index !== 0) {
      // place the element as first
      recent.unshift(object);
    }
    if (recent.length > 5) {
      // pop last element if length exceed 5 vo
      recent.pop();
    }
    localStorage.setItem('recent', JSON.stringify(recent));
  }
}

export function indexOfObject(recent: RecentEntity[], object: RecentEntity): number {
  for (let i = 0; i < recent.length; i++) {
    if (recent[i].id === object.id) {
      if (recent[i].type === object.type) {
        return i;
      }
    }
  }
  return -1;
}

export function indexOfEntity(recent: number[], id: number): number {
  for (let i = 0; i < recent.length; i++) {
    if (recent[i] === id) {
      return i;
    }
  }
  return -1;
}

/**
 * Gets Vo of given user.
 *
 * @param richUser RichUser
 */
export function parseVo(richUser: RichUser): string {
  let result = '';
  if (richUser) {
    richUser.userAttributes.forEach((attr) => {
      if (attr.friendlyName === 'organization') {
        result = attr.value as string;
      }
    });
  }
  return result;
}
/**
 * From given attributes array removes all core attributes.
 *
 * @param attributes non core attributes
 */
export function filterCoreAttributes(attributes: Attribute[]): Attribute[] {
  return attributes.filter((attribute) => !attribute.namespace.includes('def:core'));
}

/**
 * Find parents of given group in field of groups
 * @param group that you parent you want to found
 * @param groups field of groups where you want to find parent
 * return field of parents
 */
export function findParent(group: number, groups: Group[]): Group[] {
  const parent = groups.find((x) => x.id === group);
  if (parent) {
    if (parent.parentGroupId) {
      return findParent(parent.parentGroupId, groups).concat(parent);
    } else {
      return [parent];
    }
  } else {
    return [];
  }
}

/**
 * Finds attribute with given attrName from given attributes.
 *
 * @param attributes attributes
 * @param attrName attr name
 * @return attribute with given name or null if not found
 */
export function getAttribute(attributes: Attribute[], attrName: string): Attribute {
  for (const attribute of attributes) {
    if (attribute.namespace + ':' + attribute.friendlyName === attrName) {
      return attribute;
    }
  }
  return null;
}

/**
 * Find candidate email in his attributes
 * @param candidate
 * @return candidate email
 */
export function getCandidateEmail(candidate: Candidate): string {
  if (candidate.attributes['urn:perun:member:attribute-def:def:mail'] != null) {
    return candidate.attributes['urn:perun:member:attribute-def:def:mail'];
  } else if (candidate.attributes['urn:perun:user:attribute-def:def:preferredMail'] != null) {
    return candidate.attributes['urn:perun:user:attribute-def:def:preferredMail'];
  }
  return '';
}

export function getExtSourceNameOrOrganizationColumn(candidate: Candidate): string {
  if (
    candidate.userExtSource.extSource.type.toLowerCase() ===
    'cz.metacentrum.perun.core.impl.ExtSourceX509'.toLowerCase()
  ) {
    return convertCertCN(candidate.userExtSource.extSource.name);
  } else if (
    candidate.userExtSource.extSource.type.toLowerCase() ===
    'cz.metacentrum.perun.core.impl.ExtSourceIdp'.toLowerCase()
  ) {
    return translateIdp(candidate.userExtSource.extSource.name);
  } else {
    return candidate.userExtSource.extSource.name;
  }
}

/**
 * If passed string is DN of certificate(recognized by "/CN=") then returns only CN part with unescaped chars.
 * If passed string is not DN of certificate, original string is returned.
 *
 * @param toConvert
 * @return
 */
export function convertCertCN(toConvert: string): string {
  if (toConvert.includes('/CN=')) {
    const splitted = toConvert.split('/');
    for (const s of splitted) {
      if (s.startsWith('CN=')) {
        return unescapeDN(s.substring(3));
      }
    }
  }
  return toConvert;
}

export function unescapeDN(string: string): string {
  return decodeURIComponent(string.replace(/\\x/g, '%'));
}

export function translateIdp(name: string): string {
  switch (name) {
    case 'https://idp.upce.cz/idp/shibboleth':
      return 'University in Pardubice';
    case 'https://idp.slu.cz/idp/shibboleth':
      return 'University in Opava';
    case 'https://login.feld.cvut.cz/idp/shibboleth':
      return 'Faculty of Electrical Engineering, Czech Technical University In Prague';
    case 'https://www.vutbr.cz/SSO/saml2/idp':
      return 'Brno University of Technology';
    case 'https://shibboleth.nkp.cz/idp/shibboleth':
      return 'The National Library of the Czech Republic';
    case 'https://idp2.civ.cvut.cz/idp/shibboleth':
      return 'Czech Technical University In Prague';
    case 'https://shibbo.tul.cz/idp/shibboleth':
      return 'Technical University of Liberec';
    case 'https://idp.mendelu.cz/idp/shibboleth':
      return 'Mendel University in Brno';
    case 'https://cas.cuni.cz/idp/shibboleth':
      return 'Charles University in Prague';
    case 'https://wsso.vscht.cz/idp/shibboleth':
      return 'Institute of Chemical Technology Prague';
    case 'https://idp.vsb.cz/idp/shibboleth':
      return 'VSB – Technical University of Ostrava';
    case 'https://whoami.cesnet.cz/idp/shibboleth':
      return 'CESNET';
    case 'https://helium.jcu.cz/idp/shibboleth':
      return 'University of South Bohemia';
    case 'https://idp.ujep.cz/idp/shibboleth':
      return 'Jan Evangelista Purkyne University in Usti nad Labem';
    case 'https://idp.amu.cz/idp/shibboleth':
      return 'Academy of Performing Arts in Prague';
    case 'https://idp.lib.cas.cz/idp/shibboleth':
      return 'Academy of Sciences Library';
    case 'https://shibboleth.mzk.cz/simplesaml/metadata.xml':
      return 'Moravian  Library';
    case 'https://idp2.ics.muni.cz/idp/shibboleth':
      return 'Masaryk University';
    case 'https://idp.upol.cz/idp/shibboleth':
      return 'Palacky University, Olomouc';
    case 'https://idp.fnplzen.cz/idp/shibboleth':
      return 'FN Plzen';
    case 'https://id.vse.cz/idp/shibboleth':
      return 'University of Economics, Prague';
    case 'https://shib.zcu.cz/idp/shibboleth':
      return 'University of West Bohemia';
    case 'https://idptoo.osu.cz/simplesaml/saml2/idp/metadata.php':
      return 'University of Ostrava';
    case 'https://login.ics.muni.cz/idp/shibboleth':
      return 'MetaCentrum';
    case 'https://idp.hostel.eduid.cz/idp/shibboleth':
      return 'eduID.cz Hostel';
    case 'https://shibboleth.techlib.cz/idp/shibboleth':
      return 'National Library of Technology';
    case 'https://eduid.jamu.cz/idp/shibboleth':
      return 'Janacek Academy of Music and Performing Arts in Brno';
    case 'https://marisa.uochb.cas.cz/simplesaml/saml2/idp/metadata.php':
      return 'Institute of Organic Chemistry and Biochemistry AS CR';
    case 'https://shibboleth.utb.cz/idp/shibboleth':
      return 'Tomas Bata University in Zlin';
    case 'https://engine.elixir-czech.org/authentication/idp/metadata':
      return 'Elixir Europe';
    case 'https://login.elixir-czech.org/idp':
      return 'Elixir Czech';
    case 'https://mojeid.cz/saml/idp.xml':
      return 'MojeID';
    case 'https://www.egi.eu/idp/shibboleth':
      return 'EGI SSO';

    case '@google.extidp.cesnet.cz':
      return 'Google';
    case '@facebook.extidp.cesnet.cz':
      return 'Facebook';
    case '@mojeid.extidp.cesnet.cz':
      return 'MojeID';
    case '@linkedin.extidp.cesnet.cz':
      return 'LinkedIn';
    case '@twitter.extidp.cesnet.cz':
      return 'Twitter';
    case '@seznam.extidp.cesnet.cz':
      return 'Seznam';
    case '@elixir-europe.org':
      return 'Elixir Europe';
    case '@github.extidp.cesnet.cz':
      return 'GitHub';
    case '@orcid.extidp.cesnet.cz':
      return 'OrcID';

    default:
      return name;
  }
}

export function createNewApplicationMail(langs = ['en', 'cs']): ApplicationMail {
  const mail: ApplicationMail = {
    appType: 'INITIAL',
    formId: 0,
    mailType: 'APP_CREATED_USER',
    send: true,
    message: {},
    htmlMessage: {},
  };
  langs.forEach((lang) => {
    mail.message[lang] = { locale: lang, htmlFormat: false, subject: '', text: '' };
    mail.htmlMessage[lang] = { locale: lang, htmlFormat: true, subject: '', text: '' };
  });
  return mail;
}

export function getDefaultDialogConfig(): MatDialogConfig {
  const config = new MatDialogConfig();
  config.disableClose = true;
  config.autoFocus = false;
  return config;
}

export function createNewApplicationFormItem(languages: string[]): ApplicationFormItem {
  const newItem: ApplicationFormItem = {
    applicationTypes: ['INITIAL', 'EXTENSION'],
    federationAttribute: '',
    i18n: {},
    id: 0,
    ordnum: 0,
    perunDestinationAttribute: null,
    perunSourceAttribute: null,
    regex: '',
    required: false,
    updatable: true,
    disabled: 'NEVER',
    hidden: 'NEVER',
    disabledDependencyItemId: null,
    hiddenDependencyItemId: null,
    shortname: '',
    type: null,
  };
  for (const lang of languages) {
    newItem.i18n[lang] = { locale: lang, errorMessage: '', help: '', label: '', options: '' };
  }
  return newItem;
}

export function isVirtualAttribute(attribute: Attribute): boolean {
  return attribute.namespace.split(':')[4] === 'virt';
}

export function parseMemberStatus(memberStatus: string, memberGroupStatus?: string): string {
  if (
    memberStatus.toLowerCase() === 'valid' &&
    (!memberGroupStatus || memberStatus.toLowerCase() === 'valid')
  ) {
    return 'ACTIVE';
  }
  return memberStatus;
}

/**
 * Gets organization of given member. The Organization (for VO) has top priority, the Organization, provided by IDP
 * has lower priority. If there are no organizations, an empty string is returned.
 *
 * @param richMember RichMember
 */
export function parseOrganization(richMember: RichMember): string {
  let organization = '';

  richMember?.memberAttributes.forEach((attr) => {
    if (attr.friendlyName === 'organization' && attr.value !== null) {
      organization = attr.value as string;
    }
  });

  if (organization.length === 0) {
    richMember?.userAttributes.forEach((attr) => {
      if (attr.friendlyName === 'organization') {
        organization = attr.value as string;
      }
    });
  }
  return organization;
}

export function getGroupExpiration(group: RichGroup): string {
  const attribute = group.attributes.find(
    (att) => att.baseFriendlyName === 'groupMembershipExpiration'
  );

  return (attribute?.value as string) ?? 'Never';
}

export function parseDate(value: string): string {
  if (!value || value.toLowerCase() === 'never') {
    return value;
  }
  return formatDate(value, 'd.M.yyyy', 'en');
}

const collator = new Intl.Collator('cs', { numeric: true });
export function customDataSourceSort<T>(
  data: T[],
  sort: MatSort,
  getDataForColumn: (data: T, column: string) => string
): T[] {
  const active = sort.active;
  const direction = sort.direction;
  if (!active || direction === '') {
    return data;
  }
  return data.sort((a, b) => {
    const dataStrA = getDataForColumn(a, active);
    const dataStrB = getDataForColumn(b, active);
    return collator.compare(dataStrA, dataStrB) * (direction === 'asc' ? 1 : -1);
  });
}

export function customDataSourceFilterPredicate<T>(
  data: T,
  filter: string,
  columns: string[],
  getDataForColumn: (data: T, column: string) => string,
  filterByUUID?: boolean
): boolean {
  filter = filter.toLowerCase();
  let dataStr = '';
  columns.forEach((col) => {
    dataStr += ';' + getDataForColumn(data, col);
  });
  if (filterByUUID) {
    dataStr += ';' + getDataForColumn(data, 'uuid');
  }
  return dataStr.toLowerCase().includes(filter);
}

export function parseAttribute(data: Author, nameOfAttribute: string): string {
  let attribute = '';
  if (data.attributes) {
    data.attributes.forEach((attr) => {
      if (attr.friendlyName === nameOfAttribute) {
        attribute = attr.value as string;
      }
    });
  }
  return attribute;
}

export function getDataForExport<T>(
  data: T[],
  columns: string[],
  getDataForColumn: (data: T, column: string) => string
): T[] {
  const result: T[] = [];
  const skippedColumns = ['checkbox', 'select', 'edit', 'menu', 'cite', 'extend', 'recent'];
  columns = columns.filter((c) => !skippedColumns.includes(c));
  data.forEach((row) => {
    const resultRow: T = {} as T;
    columns.forEach((col) => {
      resultRow[col] = (getDataForColumn(row, col) ?? '').split('"').join("''").trim();
    });
    result.push(resultRow);
  });
  return result;
}

export function downloadData<T>(data: T[], format = 'csv', filename = 'export'): void {
  switch (format) {
    case 'csv': {
      const replacer = (key, value): string => (value === null ? '' : (value as string));
      const header = Object.keys(data[0]);
      const csv = data.map((row) =>
        header.map((fieldName) => JSON.stringify(row[fieldName], replacer)).join(',')
      );
      csv.unshift(header.join(',').split(' ').join('_').split('"').join("''"));
      const csvArray = csv.join('\r\n');

      const blob: Blob = new Blob([csvArray], { type: 'text/csv' });
      saveAs(blob, `${filename}.${format}`);
    }
  }
}

type ComparableEntity = Facility | Resource | Group;
export function compareFnName(a: ComparableEntity, b: ComparableEntity): 1 | 0 | -1 {
  return a.name.toLowerCase() > b.name.toLowerCase()
    ? 1
    : a.name.toLowerCase() === b.name.toLowerCase()
    ? 0
    : -1;
}

export function compareFnDisplayName(a: AttributeDefinition, b: AttributeDefinition): number {
  return a.displayName.toLowerCase() > b.displayName.toLowerCase()
    ? 1
    : a.displayName.toLowerCase() === b.displayName.toLowerCase()
    ? 0
    : -1;
}

type ComparablePerson = User & RichMember;
export function compareFnUser(a: ComparablePerson, b: ComparablePerson): number {
  let first, second;
  if (a.user) {
    first = a.user.lastName ? a.user.lastName : a.user.firstName ?? '';
    second = b.user.lastName ? b.user.lastName : b.user.firstName ?? '';
  } else {
    first = a.lastName ? a.lastName : a.firstName ?? '';
    second = b.lastName ? b.lastName : b.firstName ?? '';
  }
  return first > second ? 1 : first === second ? 0 : -1;
}

export function enableFormControl(
  control: AbstractControl,
  validators: ValidatorFn[],
  asyncValidators: AsyncValidatorFn[] = []
): void {
  control.enable();
  control.clearValidators();
  control.clearAsyncValidators();
  control.setValidators(validators);
  control.setAsyncValidators(asyncValidators);
  control.updateValueAndValidity();
}

export function hasBooleanAttributeEnabled(
  attributes: Attribute[],
  attributeName: string
): boolean {
  if (attributes) {
    return attributes.some(
      (attribute) =>
        attribute.namespace + ':' + attribute.friendlyName === attributeName &&
        attribute.value !== null &&
        String(attribute.value) === 'true'
    );
  }
  return false;
}

export function isGroupSynchronized(group: RichGroup): boolean {
  return (
    hasBooleanAttributeEnabled(group.attributes, Urns.GROUP_SYNC_ENABLED) ||
    hasBooleanAttributeEnabled(group.attributes, Urns.GROUP_STRUCTURE_SYNC_ENABLED)
  );
}

export function parseQueryParams(paramName: string, queryParams: string): string {
  const parameters = queryParams.split('&');
  for (const param of parameters) {
    const [name, value] = param.split('=');
    if (name.includes(paramName)) {
      return value;
    }
  }
  return '';
}
