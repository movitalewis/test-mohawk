import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ApiService } from "src/app/features/http-services/api.service";
import { environment } from "src/environments/environment";
import { API_CONSTANTS } from "src/app/features/shared/constants/API-CONSTANTS";
@Injectable({
    providedIn: "root",
  })
export class XchangeSearchControlService {

    constructor(private apiService: ApiService,private http$: HttpClient) {}

    searchResults(searchPageNumber: any,searchResultFields:any,searchResultsPageSize:any,searchResultQuery:any): Observable<any> {
    const url = API_CONSTANTS.productSearch;
    let formatedURl:  string = url+"currentPage="+searchPageNumber+"&fields="+searchResultFields+"&pageSize="+searchResultsPageSize+"&query="+searchResultQuery+":relevance:";

      return this.apiService.getSearchResults(formatedURl);     
    }
    searchSuggestions(suggestionsFields: any,suggestionMaxSize:any,suggestionTerm:any): Observable<any> {
      const url = API_CONSTANTS.productSuggestions;
      let formatedURl:  string = url+"&fields=FULL"+suggestionsFields+"&max="+suggestionMaxSize+"&term="+suggestionTerm;
      return this.apiService.getSearchSugestions(formatedURl); 
    }

    advancedSearchResults(payload:any){
      let url = API_CONSTANTS.advancedProductsSearch;
      return this.apiService.post(url,payload);
    }

}
