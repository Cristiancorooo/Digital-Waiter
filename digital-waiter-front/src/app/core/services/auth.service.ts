import {Injectable} from '@angular/core';import {Router} from '@angular/router';import {StoreService} from './store.service';import {ApiService} from './api.service';
@Injectable({providedIn:'root'})
export class AuthService{
 constructor(private store:StoreService,private router:Router,private api:ApiService){}
 private async start(response:any){localStorage.setItem('digitalWaiterToken',response.accessToken);this.store.setSession(response.user);await this.store.loadAll(true);if(this.store.error())throw new Error(this.store.error());await this.router.navigateByUrl(response.user.role==='Cocina'?'/cocina':'/inicio');return true}
 async login(name:string,password:string){if(!name||!password)return false;try{return await this.start(await this.api.login(name,password))}catch{localStorage.removeItem('digitalWaiterToken');this.store.setSession(null);return false}}
 async register(body:unknown){try{return await this.start(await this.api.registrarRestaurante(body))}catch{localStorage.removeItem('digitalWaiterToken');this.store.setSession(null);return false}}
 logout(){localStorage.removeItem('digitalWaiterToken');this.store.setSession(null);this.store.clear();this.router.navigateByUrl('/establecimiento')}
 isLogged(){return !!this.store.session()&&!!localStorage.getItem('digitalWaiterToken')}
}
