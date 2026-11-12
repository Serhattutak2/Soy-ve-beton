// Uzun oyun paketi arayüzü: arsa bankası, holding, şubeler, kadro, vasiyet, emeklilik, yıl sonu raporu, zorluk.
import type {World} from '../core/types';
import {STAGES,CITIES,TR_KEYS,SUBS,ROLES,DIFF} from '../core/data';
import {money,age,alive,family,pl,year} from '../core/util';
import * as V4 from '../core/v4';
import * as S from '../core/sim';
const e=(s:string)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const num=(n:number)=>Math.round(n).toLocaleString('tr-TR');
export let confirmR='';

/** Arsa sekmesi: kendi arsaların ve piyasadaki arsalar */
export function landSec(w:World){if(!w.firm)return'';const own=w.lands||[];const mk=w.landMkt||[];
 const row=(l:any,mine:boolean)=>{const s=V4.landStage(w,l);const gain=l.val-l.paid;return`<div class="item"><div class="row"><span class="nm">${e(l.name)}</span><span class="tag">${CITIES[l.city].n}</span></div>
 <p class="m">${num(l.m2)} m² · ${l.village?'Köy arazisi':l.zone===0?'<b style="color:#ffb39a">Yapılaşmaya kapalı</b>':l.zone>1?'Kat artışlı imar':'Konut imarlı'}${l.share?` · <b style="color:#ffb39a">Hisseli tapu: ${l.share} hissedar</b>`:''}${l.tags.includes('yol')?' · Önünden yol geçiyor':''}${l.tags.includes('metro')?' · Metro durağı':''}</p>
 <p class="m">Değeri ${money(l.val)}${mine?` · Aldığın ${money(l.paid)} <b style="color:${gain>=0?'#b4dfa9':'#ffb39a'}">${gain>=0?'+':''}${money(gain)}</b>`:''}${mine&&s>=0&&!l.share?` · Sığan iş: ${e(STAGES[s].n)}`:''}</p>
 <div class="btns">${mine?`${!l.share&&(l.zone>0||l.village)&&s>=0?`<button class="s y" data-a="lbuild" data-v="${l.id}">Projeye çevir</button>`:''}${l.share?`<button class="s" data-a="lshare" data-v="${l.id}">Hissedarları ikna et (${money(l.val*.12)})</button>`:''}<button class="s" data-a="lsell" data-v="${l.id}">Sat (${money(l.val*.96)})</button>`:`<button class="s ${w.cash>=l.val?'y':''}" data-a="lbuy" data-v="${l.id}" ${w.cash>=l.val?'':'disabled'}>Satın al</button>`}</div></div>`;};
 return`<div class="sec"><h3>Arsa bankan</h3><p class="m">Ucuzken al, bekle. Yol, metro ya da imar değişikliği gelirse değeri katlanır. Kendi arsana bina yaparsan arsa sahibine daire vermezsin: hepsi senin.</p>
 ${own.length?own.map(l=>row(l,true)).join(''):'<p class="m">Henüz arsan yok.</p>'}
 <h4 style="margin:12px 0 4px">Piyasadaki arsalar</h4>${mk.length?mk.map(l=>row(l,false)).join(''):'<p class="m">Emlakçılar yeni yıl başında yeni arsa getirir.</p>'}</div>`;}

/** Ekip sekmesi: isimli kadro, holding şirketleri, şubeler */
export function corpSec(w:World){const f=w.firm;if(!f)return'';const fam=family(w).filter(p=>p.id!==w.playerId&&age(w,p)>=20);
 const staff=(w.staff||[]).map(s=>`<div class="item"><div class="row"><span class="nm">${e(s.name)} <span class="m">${ROLES[s.role].n}</span></span><button class="s" data-a="sfire" data-v="${s.id}">Çıkar</button></div><p class="m">Beceri ${Math.round(s.sk)} · Bağlılık ${Math.round(s.loy)} · ${Math.floor((w.m-s.by)/12)} yaşında · Maaş ${money(V4.staffWage(w,s))}/ay</p></div>`).join('');
 const roles=Object.entries(ROLES).map(([k,r])=>`<div class="row"><span><b>${r.n}</b> <span class="m">${r.d}</span></span><button class="s" data-a="shire" data-v="${k}" ${f.stage>=r.st?'':'disabled'}>${f.stage>=r.st?'İşe al':`${r.st+1}. aşamada`}</button></div>`).join('');
 const subs=Object.entries(SUBS).map(([k,s])=>{const own=w.subs?.[k];const p=V4.subPrice(k);const m=own?.mgr!==undefined?w.people[own.mgr]:undefined;return`<div class="item"><div class="row"><span class="nm">${s.n}</span>${own?'<span class="tag ok">Senin</span>':''}</div><p class="m">${s.d} Yıllık getiri yaklaşık %${Math.round(s.r*100)}.</p>
  ${own?`<label class="m">Müdür <select data-mgr="${k}"><option value="0">Dışarıdan müdür (riskli)</option>${fam.map(p=>`<option value="${p.id}" ${m&&m.id===p.id?'selected':''}>${e(p.name)} (${age(w,p)})</option>`).join('')}</select></label><div class="btns"><button class="s" data-a="subsell" data-v="${k}">Sat (${money(p*.75)})</button></div>`:`<button class="s ${f.stage>=s.st&&w.cash>=p?'y':''}" data-a="subbuy" data-v="${k}" ${f.stage>=s.st&&w.cash>=p?'':'disabled'}>${f.stage>=s.st?`Kur (${money(p)})`:`${s.st+1}. aşamada açılır`}</button>`}</div>`;}).join('');
 const br=Object.keys(w.branches||{});const can=TR_KEYS.filter(c=>c!==w.city&&!br.includes(c));
 return`<div class="sec"><h3>Kadro</h3><p class="m">İsimli uzmanlar. İyisi şirketi büyütür, küsen rakibe gider.</p>${staff}${roles}</div>
 <div class="sec"><h3>Holding</h3><p class="m">Yan şirketler hem para getirir hem şantiyeni ucuzlatır. Başına aileden birini koyarsan daha çok kazandırır, dışarıdan müdür bazen kasayı boşaltır.</p>${subs}</div>
 <div class="sec"><h3>Şubeler</h3><p class="m">Şube açtığın şehirde işçilik pahalı değildir ve oradan daha çok arsa teklifi gelir. ${f.stage<8?'Şube 9. aşamadan sonra açılır.':''}</p>
 ${br.map(c=>`<div class="row"><span><b>${CITIES[c].n}</b> <span class="m">açılış ${year(w)-Math.floor((w.m-w.branches![c].since)/12)}</span></span><button class="s" data-a="brclose" data-v="${c}">Kapat</button></div>`).join('')}
 ${f.stage>=8?`<div class="row"><select id="brsel">${can.map(c=>`<option value="${c}">${CITIES[c].n} (${money(V4.branchCost(w,c))})</option>`).join('')}</select><button class="s y" data-a="bropen">Şube aç</button></div>`:''}</div>`;}

/** Aile sekmesi: vasiyet ve emeklilik */
export function willSec(w:World){const v=w.will;const hist=w.wills||[];const me=pl(w);
 const cur=v?(()=>{const d=V4.WILLS[v.id];const left=Math.max(0,Math.round((v.dl-w.m)/12));const c=V4.willCost(w,v.id);return`<div class="item"><div class="row"><span class="nm">"${e(d.t)}"</span><span class="tag ${v.done?'ok':v.fail?'no':''}">${v.done?'Tutuldu':v.fail?'Tutulamadı':`${left} yıl kaldı`}</span></div><p class="m">${e(d.d)}${v.id==='asama'&&v.arg!==undefined?` Hedef: ${e(STAGES[v.arg].n)}.`:''}</p>${!v.done&&!v.fail&&d.act?`<button class="s ${w.cash>=c?'y':''}" data-a="willdo" ${w.cash>=c?'':'disabled'}>Yerine getir (${money(c)})</button>`:''}</div>`;})():'<p class="m">Firma kurunca bir vasiyet yüklenir.</p>';
 const ret=S.canRetire(w);const h=w.heirId>=0?w.people[w.heirId]:undefined;
 return`<div class="sec"><h3>Vasiyet</h3>${cur}${hist.length?`<p class="m">Önceki kuşaklar: ${hist.map(x=>`${x.gen}. kuşak ${x.ok?'tuttu':'tutamadı'}`).join(', ')}.</p>`:''}</div>
 ${w.firm?`<div class="sec"><h3>Emeklilik</h3><p class="m">${ret?`Koltuğu ${e(h!.name)}'e devredip danışman dede olabilirsin. Yaşadıkça akıl verirsin, sen de dinlenirsin.`:`50 yaşından sonra, 20 yaşını geçmiş bir varis yazılıysa emekli olabilirsin.${age(w,me)<50?` Sen ${age(w,me)} yaşındasın.`:''}`}</p>${ret?`<button class="s" data-a="retire">${confirmR==='r'?'Eminim, koltuğu devret':'Emekli ol'}</button>`:''}</div>`:''}`;}

/** Yıl sonu raporu: yeni yılın ilk ayında bir kez açılır */
export function reportView(w:World){const r=w.report;if(!r||r.seen)return'';const up=r.dnw>=0;
 return`<div class="veil"><div class="card rep"><p class="m" style="letter-spacing:.12em;text-transform:uppercase">Yıl sonu raporu</p><h2>${r.y}</h2>
 <div class="dzg"><span>Servet</span><b>${money(r.nw)}</b><span>Bu yıl</span><b style="color:${up?'#b4dfa9':'#ffb39a'}">${up?'+':''}${money(r.dnw)}</b><span>Biten iş</span><b>${r.proj}</b><span>Yeni bina</span><b>${r.bld}</b></div>
 ${r.news.length?`<h4>Gazete manşetleri</h4><ul class="news">${r.news.map(n=>`<li>${e(n)}</li>`).join('')}</ul>`:''}
 ${r.fam.length?`<h4>Aileden</h4><ul class="news">${r.fam.map(n=>`<li>${e(n)}</li>`).join('')}</ul>`:''}
 <button class="y" data-a="repok">Yeni yıla devam</button></div></div>`;}

/** Yeni oyun ekranında zorluk */
export function diffPick(cur:number){return`<h3>Zorluk</h3><div class="seg">${DIFF.map((d,i)=>`<button data-a="pickD" data-v="${i}" class="${cur===i?'on':''}">${d.n}</button>`).join('')}</div><p class="m">${DIFF[cur].d}</p>`;}

/** Eylemler. Dönüş: kullanıcıya gösterilecek kısa not (boşsa yok) */
export function v4Act(W:World,a:string,v:string):string|null{switch(a){
 case'lbuy':return V4.buyLand(W,+v)?'Tapu senin. Şimdi bekleme zamanı.':'Kasa yetmiyor.';
 case'lsell':V4.sellLand(W,+v);return'Arsa satıldı.';
 case'lshare':{const r=V4.resolveShare(W,+v);return r||null;}
 case'lbuild':{const r=V4.buildOnLand(W,+v);return r==='ok'?'Proje masada: Arsa sekmesindeki işlerde. Daireler tamamen senin.':r||null;}
 case'shire':return V4.hireStaff(W,v)?`${ROLES[v].n} işe başladı.`:'Kasa ya da aşama yetmiyor.';
 case'sfire':V4.fireStaff(W,+v);return'Tazminatı ödendi, yolu açık.';
 case'subbuy':return V4.buySub(W,v)?`${SUBS[v].n} kuruldu.`:'Kasa ya da aşama yetmiyor.';
 case'subsell':V4.sellSub(W,v);return`${SUBS[v].n} satıldı.`;
 case'bropen':{const c=(document.getElementById('brsel') as HTMLSelectElement|null)?.value||'';return V4.openBranch(W,c)?`${CITIES[c].n} şubesi açıldı.`:'Şube açılamadı: kasa yetmiyor.';}
 case'brclose':V4.closeBranch(W,v);return'Şube kapandı.';
 case'willdo':{const r=V4.fulfillWill(W);return r==='ok'?null:r||null;}
 case'retire':if(confirmR!=='r'){confirmR='r';return null;}confirmR='';return S.retire(W)?'Koltuk devredildi. Artık akşamları torunlarla çay var.':'Emeklilik şu an mümkün değil.';
 case'repok':if(W.report)W.report.seen=true;return null;}
 return null;}
export const V4_ACTS=['lbuy','lsell','lshare','lbuild','shire','sfire','subbuy','subsell','bropen','brclose','willdo','retire','repok'];
void alive;
