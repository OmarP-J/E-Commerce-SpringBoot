import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserStorageService } from '../../services/storage/user-storage.service';

const BASIC_URL = "http://localhost:8080/";

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  addCategory(CategoryDTO: any): Observable<any>{
    return this.http.post(BASIC_URL + 'api/admin/category', CategoryDTO, {
      headers: this.createAuthorizationHeader(),
    })
  }

    getAllCategories(): Observable<any>{
    return this.http.get(BASIC_URL + 'api/admin/categories', {
      headers: this.createAuthorizationHeader(),
    })
  }

  addProduct(ProductDTO: any): Observable<any>{
    return this.http.post(BASIC_URL + 'api/admin/product', ProductDTO, {
      headers: this.createAuthorizationHeader(),
    })
  }

  private createAuthorizationHeader(): HttpHeaders{
    return new HttpHeaders().set(
      'Authorization', 'Bearer ' + UserStorageService.getToken()
    )
  }
}




