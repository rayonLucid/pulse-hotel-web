import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterRooms',
  standalone: true // Remove this line if you are using NgModule declaration instead
})
export class FilterRoomsPipe implements PipeTransform {
  transform(rooms: any[], searchTerm: string): any[] {
    if (!rooms) return [];
    if (!searchTerm || !searchTerm.trim()) return rooms;

    const cleanSearch = searchTerm.toLowerCase().trim();

    return rooms.filter(room => {
      const matchType = room.roomType?.toLowerCase().includes(cleanSearch);
      const matchNumber = room.roomNumber?.toString().toLowerCase().includes(cleanSearch);
      return matchType || matchNumber;
    });
  }
}
