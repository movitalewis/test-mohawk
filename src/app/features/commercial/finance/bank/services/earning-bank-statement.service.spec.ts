import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ApiService } from 'src/app/features/http-services/api.service';


@Injectable({

  providedIn: 'root'

})

export class EarningBankStatementService {


  constructor(

    private apiService: ApiService

  ) { }


  getEarningStatement(payload: any): Observable<any> {

    return this.apiService.getEarningStatement(payload);

  }

}
