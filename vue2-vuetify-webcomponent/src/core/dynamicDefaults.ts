import dayjs from 'dayjs';
import customParsingPlugin from 'dayjs/plugin/customParseFormat';
import utcPlugin from 'dayjs/plugin/utc';
import timezonePlugin from 'dayjs/plugin/timezone'; // dependent on utc plugin
import durationPlugin from 'dayjs/plugin/duration';

// required for the custom save formats in the date, time and date-time pickers
dayjs.extend(customParsingPlugin);
dayjs.extend(utcPlugin);
dayjs.extend(timezonePlugin);
dayjs.extend(durationPlugin);

export const searchParams = (args: any) => {
  let paramName: string | undefined = undefined;
  if (args?.param && typeof args.param === 'string') {
    paramName = args?.param;
  }

  const url: URL = new URL(window.location.href);
  const params: URLSearchParams = url.searchParams;

  let result: string | undefined = undefined;
  if (paramName) {
    if (params.has(paramName)) {
      result = params.get(paramName)!;
    } else {
      // try from the hash #
      const hash = url.hash;
      const index = hash.indexOf('?');
      if (index > 0 && index < hash.length - 1) {
        const hashSearchParams = new URLSearchParams(hash.substring(index + 1));
        if (hashSearchParams.has(paramName)) {
          result = hashSearchParams.get(paramName)!;
        }
      }
    }
  }

  return () => result;
};

export const datetimeOffset = (args: any) => {
  const dateTime = nowOffset(args);
  let result: string | undefined = undefined;

  if (dateTime.isValid()) {
    const datetimeLocalFormat = 'YYYY-MM-DDTHH:mm:ss.SSS';

    result = dateTime.local().format(datetimeLocalFormat);
  }

  return () => result;
};

export const timeOffset = (args: any) => {
  const dateTime = nowOffset(args);
  let result: string | undefined = undefined;

  if (dateTime.isValid()) {
    const datetimeLocalFormat = 'HH:mm:ss.SSS';

    result = dateTime.local().format(datetimeLocalFormat);
  }

  return () => result;
};

export const dateOffset = (args: any) => {
  const date = nowOffset(args);
  let result: string | undefined = undefined;

  if (date.isValid()) {
    result = date.local().format('YYYY-MM-DD');
  }

  return () => result;
};

const nowOffset = (args: any) => {
  let duration: string | undefined = undefined;
  if (args?.duration && typeof args.duration === 'string') {
    duration = args?.duration;
  }
  let date: string | Date | undefined = new Date();
  if (args?.date && typeof args.date === 'string') {
    if (args.date !== 'now') {
      // only assign if not the string now
      date = args?.date;
    }
  }
  let operation: 'add' | 'substract' = 'add';
  if (args?.op && args.op === 'substract') {
    operation = 'substract';
  }

  let dateObj = dayjs(date);

  if (dateObj.isValid() && duration) {
    const offset = dayjs.duration(duration);

    dateObj =
      operation == 'add' ? dateObj.add(offset) : dateObj.subtract(offset);
  }

  return dateObj;
};
