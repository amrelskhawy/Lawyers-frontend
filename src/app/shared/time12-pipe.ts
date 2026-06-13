import { Pipe, PipeTransform } from '@angular/core';
import { format12h } from '../core/utils/time-format';

/**
 * Display a 24-hour "HH:mm" time-of-day in 12-hour "h:mm AM/PM" form.
 * Used for the raw session/booking time strings shown across the app.
 */
@Pipe({
  name: 'time12',
  standalone: false,
})
export class Time12Pipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return format12h(value);
  }
}
