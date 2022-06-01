import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { openClose } from '@perun-web-apps/perun/animations';
import { Attribute } from '@perun-web-apps/perun/openapi';

export class ExpirationAttrValue {
  period: string;
  doNotExtendLoa?: string;
  doNotAllowLoa?: string;
  gracePeriod?: string;
  periodLoa?: string;
}

export interface ExpirationConfiguration {
  enabled: boolean;
  periodType: 'static' | 'dynamic';
  periodStatic: string;
  periodDynamic: string;
  periodDynamicUnit: 'y' | 'd' | 'm';
  doNotAllowLoasEnabled: boolean;
  doNotAllowLoas: number[];
  doNotExtendLoasEnabled: boolean;
  doNotExtendLoas: number[];
  gracePeriodEnabled: boolean;
  gracePeriod: string;
  gracePeriodUnit: 'y' | 'd' | 'm';
  specialLoaPeriodEnabled: boolean;
  specialLoa: number;
  specialLoaPeriod: string;
  specialLoaPeriodType: 'static' | 'dynamic';
  specialLoaPeriodStatic: string;
  specialLoaPeriodDynamic: string;
  specialLoaPeriodDynamicUnit: 'y' | 'd' | 'm';
  specialLoaPeriodExtendExpiredMembers: boolean;
}

@Component({
  selector: 'app-expiration-settings',
  templateUrl: './expiration-settings.component.html',
  styleUrls: ['./expiration-settings.component.scss'],
  animations: [openClose],
})
export class ExpirationSettingsComponent implements OnInit, OnChanges {
  @Input()
  expirationAttribute: Attribute;
  @Output()
  saveAttribute = new EventEmitter<Attribute>();
  initialConfiguration: ExpirationConfiguration;
  currentConfiguration: ExpirationConfiguration;
  loas = [0, 1, 2];
  datePattern = '^(3[01]|[12][0-9]|0?[1-9])\\.(1[012]|0?[1-9])\\.$';
  dynamicAmountPattern = '^[1-9]+$';
  // TODO translation
  amountOptions = [
    {
      value: 'd',
      text: 'Days',
    },
    {
      value: 'm',
      text: 'Months',
    },
    {
      value: 'y',
      text: 'Years',
    },
  ];
  voId: number;

  ngOnInit(): void {
    const loaPeriods = new Map();
    this.loas.forEach((loa) => loaPeriods.set(loa, ''));

    this.initialConfiguration = this.unParseAttrValue(
      this.expirationAttribute.value as ExpirationAttrValue
    );
    this.currentConfiguration = this.unParseAttrValue(
      this.expirationAttribute.value as ExpirationAttrValue
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.expirationAttribute) {
      this.initialConfiguration = this.unParseAttrValue(
        this.expirationAttribute.value as ExpirationAttrValue
      );
    }
  }

  saveChanges(): void {
    this.saveAttribute.emit(this.parseExpirationRulesAttribute());
  }

  areChangesMade(): boolean {
    const currentValue = this.parseAttributeValueFromConfig(this.currentConfiguration);
    const initValue = this.parseAttributeValueFromConfig(this.initialConfiguration);

    if (initValue === null) {
      return currentValue !== null;
    }

    if (currentValue === null) {
      return true;
    }

    return (
      currentValue.period !== initValue.period ||
      currentValue.gracePeriod !== initValue.gracePeriod ||
      currentValue.doNotExtendLoa !== initValue.doNotExtendLoa ||
      currentValue.doNotAllowLoa !== initValue.doNotAllowLoa ||
      currentValue.periodLoa !== initValue.periodLoa
    );
  }

  parseExpirationRulesAttribute(): Attribute {
    this.expirationAttribute.value = this.parseAttributeValueFromConfig(this.currentConfiguration);

    return this.expirationAttribute;
  }

  parsePeriod(config: ExpirationConfiguration): string {
    switch (config.periodType) {
      case 'dynamic':
        return this.parseDynamicPeriod(config);
      case 'static':
        return this.parseStaticPeriod(config);
      default:
      // TODO show error
    }
  }

  createInitConfiguration(): ExpirationConfiguration {
    const loaPeriods = new Map();
    this.loas.forEach((loa) => loaPeriods.set(loa, ''));

    return {
      enabled: false,
      periodType: null,
      periodStatic: '',
      periodDynamic: '',
      periodDynamicUnit: 'm',
      doNotAllowLoas: [],
      doNotAllowLoasEnabled: false,
      doNotExtendLoas: [],
      doNotExtendLoasEnabled: false,
      gracePeriodEnabled: false,
      gracePeriod: null,
      gracePeriodUnit: null,
      specialLoaPeriodEnabled: false,
      specialLoaPeriod: '',
      specialLoa: null,
      specialLoaPeriodType: null,
      specialLoaPeriodDynamic: '',
      specialLoaPeriodDynamicUnit: 'm',
      specialLoaPeriodStatic: '',
      specialLoaPeriodExtendExpiredMembers: false,
    };
  }

  unParseAttrValue(value: ExpirationAttrValue): ExpirationConfiguration {
    let config = this.createInitConfiguration();

    if (value == null) {
      return config;
    }

    if (value.period !== undefined && value.period.length > 0) {
      config = this.setPeriodValues(value, config);
    }

    if (value.doNotAllowLoa !== undefined && value.doNotAllowLoa.length > 0) {
      config = this.setDoNotAllowLoasValues(value, config);
    }

    if (value.doNotExtendLoa !== undefined && value.doNotExtendLoa.length > 0) {
      config = this.setDoNotExtendLoasValues(value, config);
    }

    if (value.gracePeriod !== undefined && value.gracePeriod.length > 0) {
      config = this.setGracePeriodValues(value, config);
    }

    if (value.periodLoa !== undefined && value.periodLoa.length > 0) {
      config = this.setSpecialLoaPeriodValues(value, config);
    }

    return config;
  }

  private setPeriodValues(
    value: ExpirationAttrValue,
    config: ExpirationConfiguration
  ): ExpirationConfiguration {
    config.enabled = true;
    if (value.period.startsWith('+')) {
      config.periodType = 'dynamic';

      const unit = value.period.charAt(value.period.length - 1);
      config.periodDynamic = value.period.substring(1, value.period.length - 1);
      config.periodDynamicUnit = unit as 'm' | 'd' | 'y';
    } else {
      config.periodType = 'static';

      config.periodStatic = value.period;
    }
    return config;
  }

  private setDoNotAllowLoasValues(
    value: ExpirationAttrValue,
    config: ExpirationConfiguration
  ): ExpirationConfiguration {
    const loas: number[] = [];
    value.doNotAllowLoa.split(',').forEach((l) => loas.push(parseInt(l.trim(), 10)));
    config.doNotAllowLoas = loas;
    if (loas.length > 0) {
      config.doNotAllowLoasEnabled = true;
    }
    return config;
  }

  private setDoNotExtendLoasValues(
    value: ExpirationAttrValue,
    config: ExpirationConfiguration
  ): ExpirationConfiguration {
    const loas: number[] = [];
    value.doNotExtendLoa.split(',').forEach((l) => loas.push(parseInt(l.trim(), 10)));
    config.doNotExtendLoas = loas;
    if (loas.length > 0) {
      config.doNotExtendLoasEnabled = true;
    }
    return config;
  }

  private setGracePeriodValues(
    value: ExpirationAttrValue,
    config: ExpirationConfiguration
  ): ExpirationConfiguration {
    config.gracePeriodEnabled = true;
    const unit = value.gracePeriod.charAt(value.gracePeriod.length - 1);
    config.gracePeriod = value.gracePeriod.substring(0, value.gracePeriod.length - 1);
    config.gracePeriodUnit = unit as 'm' | 'd' | 'y';
    return config;
  }

  private setSpecialLoaPeriodValues(
    value: ExpirationAttrValue,
    config: ExpirationConfiguration
  ): ExpirationConfiguration {
    config.specialLoa = parseInt(value.periodLoa.substring(0, value.periodLoa.indexOf('|')), 10);
    config.specialLoaPeriodEnabled = true;

    let specialPeriodValue = value.periodLoa.substring(
      value.periodLoa.indexOf('|') + 1,
      value.periodLoa.length
    );

    if (specialPeriodValue.startsWith('+')) {
      if (specialPeriodValue.endsWith('.')) {
        config.specialLoaPeriodExtendExpiredMembers = true;
        specialPeriodValue = specialPeriodValue.substring(0, specialPeriodValue.length - 1);
      }

      config.specialLoaPeriodType = 'dynamic';

      const unit = specialPeriodValue.charAt(specialPeriodValue.length - 1);
      config.specialLoaPeriodDynamic = specialPeriodValue.substring(
        1,
        specialPeriodValue.length - 1
      );
      config.specialLoaPeriodDynamicUnit = unit as 'm' | 'd' | 'y';
    } else {
      if (specialPeriodValue.endsWith('..')) {
        config.specialLoaPeriodExtendExpiredMembers = true;
        specialPeriodValue = specialPeriodValue.substring(0, specialPeriodValue.length - 1);
      }

      config.specialLoaPeriodType = 'static';

      config.specialLoaPeriodStatic = specialPeriodValue;
    }

    return config;
  }

  private parseDynamicPeriod(config: ExpirationConfiguration): string {
    return '+' + config.periodDynamic + config.periodDynamicUnit;
  }

  private parseStaticPeriod(config: ExpirationConfiguration): string {
    return config.periodStatic;
  }

  private parseDontAllowLoas(config: ExpirationConfiguration): string {
    if (!config.doNotAllowLoasEnabled) {
      return null;
    }

    let dontAllowLoas = '';
    config.doNotAllowLoas.forEach((loa) => (dontAllowLoas += loa.toString() + ','));

    if (dontAllowLoas.length > 0) {
      dontAllowLoas = dontAllowLoas.substring(0, dontAllowLoas.length - 1);
    }

    return dontAllowLoas.length > 0 ? dontAllowLoas : null;
  }

  private parseDontExtendLoas(config: ExpirationConfiguration): string {
    if (!config.doNotExtendLoasEnabled) {
      return null;
    }

    let dontExtendLoas = '';
    config.doNotExtendLoas.forEach((loa) => (dontExtendLoas += loa.toString() + ','));

    if (dontExtendLoas.length > 0) {
      dontExtendLoas = dontExtendLoas.substring(0, dontExtendLoas.length - 1);
    }

    return dontExtendLoas.length > 0 ? dontExtendLoas : null;
  }

  private parseGracePeriod(config: ExpirationConfiguration): string {
    if (!config.gracePeriodEnabled) {
      return null;
    }

    return config.gracePeriod + config.gracePeriodUnit;
  }

  private parseSpecialLoaPeriod(config: ExpirationConfiguration): string {
    if (!config.specialLoaPeriodEnabled || !config.specialLoa) {
      return null;
    }

    let period = config.specialLoa.toString() + '|';

    switch (config.specialLoaPeriodType) {
      case 'static':
        period += this.parseSpecialLoaPeriodStatic(config);
        break;
      case 'dynamic':
        period += this.parseSpecialLoaPeriodDynamic(config);
        break;
      default:
      // TODO show error
    }

    if (period != null && config.specialLoaPeriodExtendExpiredMembers) {
      period += '.';
    }

    return period;
  }

  private parseSpecialLoaPeriodStatic(config: ExpirationConfiguration): string {
    return config.specialLoaPeriodStatic;
  }

  private parseSpecialLoaPeriodDynamic(config: ExpirationConfiguration): string {
    return '+' + config.specialLoaPeriodDynamic + config.specialLoaPeriodDynamicUnit;
  }

  private parseAttributeValueFromConfig(config: ExpirationConfiguration): ExpirationAttrValue {
    if (!config.enabled) {
      return null;
    }
    const period = this.parsePeriod(config);
    const dontAllowLoas = this.parseDontAllowLoas(config);
    const dontExtendLoad = this.parseDontExtendLoas(config);
    const gracePeriod = this.parseGracePeriod(config);
    const specialLoaPeriod = this.parseSpecialLoaPeriod(config);

    const value: ExpirationAttrValue = {
      period: period,
    };

    if (dontExtendLoad !== null) {
      value.doNotExtendLoa = dontExtendLoad;
    }
    if (dontAllowLoas !== null) {
      value.doNotAllowLoa = dontAllowLoas;
    }
    if (gracePeriod !== null) {
      value.gracePeriod = gracePeriod;
    }
    if (specialLoaPeriod !== null) {
      value.periodLoa = specialLoaPeriod;
    }

    return value;
  }
}
