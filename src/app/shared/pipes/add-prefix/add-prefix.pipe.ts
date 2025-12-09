import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addPrefix',
  standalone: true,
})
export class AddPrefixPipe implements PipeTransform {
  transform(value: string, prefix = 'to'): string {
    if (!value) return value;
    return value.trim().toLowerCase().startsWith(`${prefix} `)
      ? value
      : `${prefix} ${value}`;
  }
}
