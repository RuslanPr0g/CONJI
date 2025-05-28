import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addToPrefix',
  standalone: true,
})
export class AddToPrefixPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    return value.trim().toLowerCase().startsWith('to ') ? value : `to ${value}`;
  }
}
