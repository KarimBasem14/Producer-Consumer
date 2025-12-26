import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Machine } from '../../models/Machine.model';


@Injectable({
  providedIn: 'root',
})
export class LayoutService {
  private readonly API = 'http://localhost:8080/layout';
  
  constructor(private http: HttpClient) {}

  addMachine(x: number, y: number): Observable<Machine> {
    return this.http.post<Machine>(`${this.API}/machines/add`, {x, y});
  }



}
