import { Injectable, signal } from '@angular/core';

export interface AppNotification { id:number; title:string; body:string; kind:'info'|'success'|'warning'; time:Date }
export type SoundProfile='cocina'|'mesero'|'cajero'|'administrador';

@Injectable({providedIn:'root'})
export class NotificationService {
  readonly messages=signal<AppNotification[]>([]);
  readonly enabled=signal(false);
  private audio?:AudioContext;
  async enable(){
    this.audio??=new AudioContext();
    await this.audio.resume();
    this.enabled.set(true);
    this.playSound('administrador');
    if(typeof Notification!=='undefined'&&Notification.permission==='default')await Notification.requestPermission();
    return true;
  }
  push(title:string,body:string,kind:AppNotification['kind']='info',sound:SoundProfile='administrador'){
    const item={id:Date.now()+Math.random(),title,body,kind,time:new Date()};
    this.messages.update(items=>[item,...items].slice(0,5));
    if(this.enabled())this.playSound(sound);
    if(typeof Notification!=='undefined'&&Notification.permission==='granted')new Notification(title,{body,icon:'/icon.svg',tag:`digital-waiter-${title}`,silent:true});
    window.setTimeout(()=>this.remove(item.id),7000);
  }
  private playSound(profile:SoundProfile){
    if(!this.audio)return;
    const patterns:Record<SoundProfile,number[]>={cocina:[659,880,659],mesero:[880,659],cajero:[523,659,784],administrador:[440,587]};
    const start=this.audio.currentTime+.03;
    patterns[profile].forEach((frequency,index)=>{
      const oscillator=this.audio!.createOscillator(),gain=this.audio!.createGain(),at=start+index*.17;
      oscillator.type=profile==='cocina'?'square':'sine';oscillator.frequency.value=frequency;
      gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.12,at+.02);gain.gain.exponentialRampToValueAtTime(.0001,at+.13);
      oscillator.connect(gain).connect(this.audio!.destination);oscillator.start(at);oscillator.stop(at+.15);
    });
  }
  remove(id:number){this.messages.update(items=>items.filter(x=>x.id!==id))}
}
