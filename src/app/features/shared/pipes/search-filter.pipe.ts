import { Pipe, PipeTransform } from "@angular/core";
@Pipe({
    name: "searchFilterPipe",
    standalone: false
})
export class SearchFilterPipe implements PipeTransform {
  constructor() {}
  transform(
    item: any[],
    searchText: { search: string; searchKey: string }
  ): any[] {
    if (!item) return [];
    if (!searchText.search) return item;
    if (searchText.searchKey) {
      return item.filter((it) => {
        return it[searchText.searchKey]
          .toLowerCase()
          .includes(searchText.search.toLowerCase());
      });
    } else {
      return item.filter(function (data) {
        return JSON.stringify(data)
          .toLowerCase()
          .includes(searchText.search.toLowerCase());
      });
    }
  }
}
