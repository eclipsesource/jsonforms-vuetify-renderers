import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone'; // dependent on utc plugin
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';

import type { MaskTokens, MaskType } from 'maska';

// required for the custom save formats in the date, time and date-time pickers
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localeData);
dayjs.extend(localizedFormat);

export const parseDateTime = (
  data: string | number | dayjs.Dayjs | Date | null | undefined,
  format: string | string[] | undefined,
): dayjs.Dayjs | null => {
  if (!data) {
    return null;
  }
  const dayjsData = dayjs(data, format);
  if (!dayjsData.isValid()) {
    return null;
  }
  return dayjsData;
};

function splitByTokens(str: string, tokens: string[]) {
  const regex = new RegExp(`(${tokens.join('|')})`);

  return str.split(regex).filter(Boolean);
}

export const convertDayjsToMaskaFormat = (
  dayjsFormat: string,
): { mask: MaskType; tokens: MaskTokens } => {
  function* nextKey(preservedKeys: string): Generator<string> {
    let currentCharCode = '0'.charCodeAt(0);

    while (currentCharCode <= 65535) {
      // Unicode character range
      const currentChar = String.fromCharCode(currentCharCode);
      if (!preservedKeys.includes(currentChar)) {
        yield currentChar;
      }
      currentCharCode++;
    }
  }

  function RegExpLiteral(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  class Tokens {
    private tokens: MaskTokens;
    private charGenerator;

    constructor(preservedKeys: string) {
      this.tokens = {};
      this.charGenerator = nextKey(preservedKeys);
    }

    public getTokens(): MaskTokens {
      return this.tokens;
    }

    public getTokenKey(token: MaskTokens[keyof MaskTokens]): string {
      const entry = Object.entries(this.tokens).find(
        (entry) =>
          entry[1].pattern.toString() === token.pattern.toString() &&
          entry[1].optional === token.optional,
      );
      if (entry) {
        return entry[0];
      }

      throw new Error(
        'Key for pattern ' + token.pattern.toString() + ' not found.',
      );
    }

    public registerToken(token: MaskTokens[keyof MaskTokens]): string {
      const entry = Object.entries(this.tokens).find(
        (entry) =>
          entry[1].pattern.toString() === token.pattern.toString() &&
          entry[1].optional === token.optional,
      );
      if (entry) {
        return entry[0];
      }

      const key = this.charGenerator.next().value;

      this.tokens[key] = token;
      return key;
    }
  }

  // var localeData = require('dayjs/plugin/localeData')
  // dayjs.extend(localeData)
  // dayjs.longDateFormat('L')

  const dayjsTokens = [
    'YYYY',
    'YY',
    'MMMM',
    'MMM',
    'MM',
    'M',
    'DD',
    'D',
    'HH',
    'H',
    'hh',
    'h',
    'mm',
    'm',
    'ss',
    's',
    'SSS',
    'ZZ',
    'Z',
    'A',
    'a',
  ];
  const parts = splitByTokens(dayjsFormat, dayjsTokens);
  const reservedChars = parts
    .filter((part) => !dayjsTokens.includes(part))
    .join('');
  const tokens = new Tokens(reservedChars);

  // need to prebuild all keys to tokens are are going to be used in tokenFunction
  tokens.registerToken({ pattern: /[0-9]/ });
  tokens.registerToken({ pattern: /1/ });
  tokens.registerToken({ pattern: /[0-2]/ });
  tokens.registerToken({ pattern: /[0-2]/, optional: true });
  tokens.registerToken({ pattern: /[0-1]/ });
  tokens.registerToken({ pattern: /[1-9]/ });

  let escapedMonths = dayjs.monthsShort().map((month) => RegExpLiteral(month));
  let regexPattern = `\\b(${escapedMonths.join('|')})\\b`;
  tokens.registerToken({ pattern: new RegExp(regexPattern, 'i') });

  escapedMonths = dayjs.months().map((month) => RegExpLiteral(month));
  regexPattern = `\\b(${escapedMonths.join('|')})\\b`;

  tokens.registerToken({ pattern: new RegExp(regexPattern, 'i') });
  tokens.registerToken({ pattern: /[1-3]/ });
  tokens.registerToken({ pattern: /[0-1]/, optional: true });
  tokens.registerToken({ pattern: /[0-9]/, optional: true });
  tokens.registerToken({ pattern: /[0-3]/ });
  tokens.registerToken({ pattern: /[0-3]/, optional: true });
  tokens.registerToken({ pattern: /[0-5]/ });
  tokens.registerToken({ pattern: /[a|p]/ });
  tokens.registerToken({ pattern: /m/ });
  tokens.registerToken({ pattern: /[A|P]/ });
  tokens.registerToken({ pattern: /M/ });
  tokens.registerToken({ pattern: /[+-]/ });
  tokens.registerToken({ pattern: /[0-4]/ });
  tokens.registerToken({ pattern: /:/ });

  const tokenFunction = (value: string): string => {
    let mask = '';
    let index = 0;
    for (const part of parts) {
      if (!part || part === '') {
        continue;
      }
      if (index > value.length) {
        break;
      }

      if (part === 'YYYY') {
        const key = tokens.getTokenKey({ pattern: /[0-9]/ });
        mask += key + key + key + key;
        index += 4;
      } else if (part === 'YY') {
        const key = tokens.getTokenKey({ pattern: /[0-9]/ });
        mask += key + key;
        index += 2;
      } else if (part === 'M') {
        mask += tokens.getTokenKey({ pattern: /1/ });
        if (value.charAt(index) === '1') {
          if (
            value.charAt(index + 1) === '0' ||
            value.charAt(index + 1) === '1' ||
            value.charAt(index + 1) === '2'
          ) {
            mask += tokens.getTokenKey({ pattern: /[0-2]/ });
            index += 1;
          } else if (value.charAt(index + 1) === '') {
            mask += tokens.getTokenKey({ pattern: /[0-2]/, optional: true });
          }
        }
        index += 1;
      } else if (part === 'MM' || part == 'hh') {
        mask += tokens.getTokenKey({ pattern: /[0-1]/ });
        mask +=
          value.charAt(index) === '0'
            ? tokens.getTokenKey({ pattern: /[1-9]/ })
            : tokens.getTokenKey({ pattern: /[0-2]/ });
        index += 2;
      } else if (part === 'MMM') {
        const escapedMonths = dayjs
          .monthsShort()
          .map((month) => RegExpLiteral(month));
        const regexPattern = `\\b(${escapedMonths.join('|')})\\b`;

        mask += tokens.getTokenKey({ pattern: new RegExp(regexPattern, 'i') });
        let monthSpecified = false;

        for (const month of dayjs.monthsShort()) {
          if (
            index < value.length &&
            value.substring(index).startsWith(month)
          ) {
            index += month.length;
            monthSpecified = true;
            break;
          }
        }
        if (!monthSpecified) {
          // can't continue until the months is not matched
          break;
        }
      } else if (part === 'MMMM') {
        const escapedMonths = dayjs
          .months()
          .map((month) => RegExpLiteral(month));
        const regexPattern = `\\b(${escapedMonths.join('|')})\\b`;

        mask += tokens.getTokenKey({ pattern: new RegExp(regexPattern, 'i') });
        let monthSpecified = false;

        for (const month of dayjs.months()) {
          if (
            index < value.length &&
            value.substring(index).startsWith(month)
          ) {
            index += month.length;
            monthSpecified = true;
            break;
          }
        }
        if (!monthSpecified) {
          // can't continue until the months is not matched
          break;
        }
      } else if (part === 'D') {
        mask += tokens.getTokenKey({ pattern: /[1-3]/ });
        if (
          value.charAt(index) === '1' ||
          value.charAt(index) === '2' ||
          value.charAt(index) === '3'
        ) {
          if (value.charAt(index) === '3') {
            if (
              value.charAt(index + 1) === '0' ||
              value.charAt(index + 1) === '1'
            ) {
              mask += tokens.getTokenKey({ pattern: /[0-1]/ });
              index += 1;
            } else if (value.charAt(index + 1) === '') {
              mask += tokens.getTokenKey({ pattern: /[0-1]/, optional: true });
            }
          } else {
            if (
              value.charAt(index + 1) === '0' ||
              value.charAt(index + 1) === '1' ||
              value.charAt(index + 1) === '2' ||
              value.charAt(index + 1) === '3' ||
              value.charAt(index + 1) === '4' ||
              value.charAt(index + 1) === '5' ||
              value.charAt(index + 1) === '6' ||
              value.charAt(index + 1) === '7' ||
              value.charAt(index + 1) === '8' ||
              value.charAt(index + 1) === '9'
            ) {
              mask += tokens.getTokenKey({ pattern: /[0-9]/ });
              index += 1;
            } else if (value.charAt(index + 1) === '') {
              mask += tokens.getTokenKey({ pattern: /[0-9]/, optional: true });
            }
          }
        }
        index += 1;
      } else if (part === 'DD') {
        mask += tokens.getTokenKey({ pattern: /[0-3]/ });
        mask +=
          value.charAt(index) === '3'
            ? tokens.getTokenKey({ pattern: /[0-1]/ })
            : value.charAt(index) === '0'
              ? tokens.getTokenKey({ pattern: /[1-9]/ })
              : tokens.getTokenKey({ pattern: /[0-9]/ });
        index += 2;
      } else if (part == 'H') {
        mask += tokens.getTokenKey({ pattern: /[0-9]/ });
        if (value.charAt(index) === '2') {
          if (
            value.charAt(index + 1) === '0' ||
            value.charAt(index + 1) === '1' ||
            value.charAt(index + 1) === '2' ||
            value.charAt(index + 1) === '3'
          ) {
            mask += tokens.getTokenKey({ pattern: /[0-3]/ });
            index += 1;
          } else if (value.charAt(index + 1) === '') {
            mask += tokens.getTokenKey({ pattern: /[0-3]/, optional: true });
          }
        } else if (value.charAt(index) === '1') {
          if (
            value.charAt(index + 1) === '0' ||
            value.charAt(index + 1) === '1' ||
            value.charAt(index + 1) === '2' ||
            value.charAt(index + 1) === '3' ||
            value.charAt(index + 1) === '4' ||
            value.charAt(index + 1) === '5' ||
            value.charAt(index + 1) === '6' ||
            value.charAt(index + 1) === '7' ||
            value.charAt(index + 1) === '8' ||
            value.charAt(index + 1) === '9'
          ) {
            mask += tokens.getTokenKey({ pattern: /[0-9]/ });
            index += 1;
          } else if (value.charAt(index + 1) === '') {
            mask += tokens.getTokenKey({ pattern: /[0-9]/, optional: true });
          }
        }
        index += 1;
      } else if (part == 'HH') {
        mask += tokens.getTokenKey({ pattern: /[0-2]/ });
        if (value.charAt(index) === '0' || value.charAt(index) === '1') {
          mask += tokens.getTokenKey({ pattern: /[0-9]/ });
        } else if (value.charAt(index) === '2') {
          mask += tokens.getTokenKey({ pattern: /[0-3]/ });
        }
        index += 2;
      } else if (part == 'h') {
        mask += tokens.getTokenKey({ pattern: /[1-9]/ });
        if (value.charAt(index) === '1') {
          if (
            value.charAt(index + 1) == '0' ||
            value.charAt(index + 1) == '1' ||
            value.charAt(index + 1) == '2'
          ) {
            mask += tokens.getTokenKey({ pattern: /[0-2]/ });
            index += 1;
          } else if (value.charAt(index + 1) === '') {
            mask += tokens.getTokenKey({ pattern: /[0-2]/, optional: true });
          }
        }
        index += 1;
      } else if (part == 'm' || part == 's') {
        mask += tokens.getTokenKey({ pattern: /[0-9]/ });
        if (
          value.charAt(index) === '1' ||
          value.charAt(index) === '2' ||
          value.charAt(index) === '3' ||
          value.charAt(index) === '4' ||
          value.charAt(index) === '5'
        ) {
          if (
            value.charAt(index + 1) === '0' ||
            value.charAt(index + 1) === '1' ||
            value.charAt(index + 1) === '2' ||
            value.charAt(index + 1) === '3' ||
            value.charAt(index + 1) === '4' ||
            value.charAt(index + 1) === '5' ||
            value.charAt(index + 1) === '6' ||
            value.charAt(index + 1) === '7' ||
            value.charAt(index + 1) === '8' ||
            value.charAt(index + 1) === '9'
          ) {
            mask += tokens.getTokenKey({ pattern: /[0-9]/ });
            index += 1;
          } else if (value.charAt(index + 1) === '') {
            mask += tokens.getTokenKey({ pattern: /[0-9]/, optional: true });
          }
        }
        index += 1;
      } else if (part == 'mm' || part == 'ss') {
        mask += tokens.getTokenKey({ pattern: /[0-5]/ });
        mask += tokens.getTokenKey({ pattern: /[0-9]/ });
        index += 2;
      } else if (part == 'a') {
        mask += tokens.getTokenKey({ pattern: /[a|p]/ });
        mask += tokens.getTokenKey({ pattern: /m/ });
        index += 2;
      } else if (part == 'A') {
        mask += tokens.getTokenKey({ pattern: /[A|P]/ });
        mask += tokens.getTokenKey({ pattern: /M/ });
        index += 2;
      } else if (part == 'Z' || part == 'ZZ') {
        //GMT-12 to GMT+14
        mask += tokens.getTokenKey({ pattern: /[+-]/ });
        mask += tokens.getTokenKey({ pattern: /[0-1]/ });

        if (value.charAt(index + 1) === '0') {
          mask += tokens.getTokenKey({ pattern: /[0-9]/ });
        } else if (value.charAt(index + 1) === '1') {
          mask +=
            value.charAt(index) === '+'
              ? tokens.getTokenKey({ pattern: /[0-4]/ })
              : tokens.getTokenKey({ pattern: /[0-2]/ });
        }
        if (part === 'Z') {
          mask += tokens.getTokenKey({ pattern: /:/ });
        }
        mask += tokens.getTokenKey({ pattern: /[0-5]/ });
        mask += tokens.getTokenKey({ pattern: /[0-9]/ });
        index += part === 'Z' ? 6 : 5;
      } else if (part == 'SSS') {
        const key = tokens.getTokenKey({ pattern: /[0-9]/ });
        mask += key + key + key;
        index += 3;
      } else {
        mask += part;
        index += part.length;
      }
    }

    return mask;
  };

  return { mask: tokenFunction, tokens: tokens.getTokens() };
};
