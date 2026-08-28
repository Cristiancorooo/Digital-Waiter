import {AppState} from '../models/app.models';
export const SEED_STATE:AppState={session:null,tables:Array.from({length:12},(_,i)=>({id:i+1,number:i+1,seats:i%3===0?6:4,status:'available',orderId:null})),menu:[
{id:1,name:'Locro de papa',category:'Entradas',price:4.5,emoji:'🍲',description:'Aguacate, queso y ají de la casa',active:true,ingredient:'Papa chola',use:.35},
{id:2,name:'Seco de pollo',category:'Platos fuertes',price:6.25,emoji:'🍗',description:'Arroz, maduro y ensalada',active:true,ingredient:'Pechuga de pollo',use:.25},
{id:3,name:'Fritada completa',category:'Platos fuertes',price:7.5,emoji:'🥩',description:'Mote, tostado y maduro',active:true,ingredient:'Carne de cerdo',use:.3},
{id:4,name:'Menestra con carne',category:'Platos fuertes',price:6.75,emoji:'🍛',description:'Arroz y ensalada fresca',active:true,ingredient:'Arroz',use:.2},
{id:5,name:'Jugo de mora',category:'Bebidas',price:2,emoji:'🥤',description:'Natural, 400 ml',active:true,ingredient:'Mora',use:.15},
{id:6,name:'Flan de la casa',category:'Postres',price:2.75,emoji:'🍮',description:'Caramelo artesanal',active:true,ingredient:'Huevos',use:2}],inventory:[
{id:1,name:'Arroz',category:'Granos',unit:'kg',stock:18,min:10},{id:2,name:'Pechuga de pollo',category:'Carnes',unit:'kg',stock:4,min:5},{id:3,name:'Papa chola',category:'Vegetales',unit:'kg',stock:12,min:8},{id:4,name:'Carne de cerdo',category:'Carnes',unit:'kg',stock:8,min:4},{id:5,name:'Aceite vegetal',category:'Despensa',unit:'L',stock:2,min:4},{id:6,name:'Mora',category:'Frutas',unit:'kg',stock:1,min:3},{id:7,name:'Huevos',category:'Lácteos',unit:'u',stock:24,min:12}],orders:[],payments:[],nextOrder:1,nextMenu:7,nextInventory:8};
