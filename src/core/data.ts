// Oyun verileri. Para sabit değerlidir: yıllar geçse de 1 ₺ aynı alım gücünü gösterir.
export const M2_PRICE=1400;
export const priceMul=(mul:number)=>.7+.3*mul;
export const landShare=(mul:number)=>.27+.2*mul;
export const MATS:Record<string,{n:string;u:string;p:number}>={
 demir:{n:'Demir',u:'ton',p:900},cimento:{n:'Çimento',u:'ton',p:110},kum:{n:'Kum',u:'m³',p:20},cakil:{n:'Çakıl',u:'m³',p:18},tugla:{n:'Tuğla',u:'adet',p:.6},kereste:{n:'Kereste',u:'m³',p:400},
 yalitim:{n:'Yalıtım',u:'m²',p:15},kiremit:{n:'Kiremit',u:'m²',p:3},dograma:{n:'Kapı ve pencere',u:'adet',p:60},elektrik:{n:'Elektrik malzemesi',u:'takım',p:20},tesisat:{n:'Tesisat malzemesi',u:'takım',p:30},seramik:{n:'Seramik',u:'m²',p:12},parke:{n:'Parke',u:'m²',p:18},boya:{n:'Boya',u:'kg',p:3}};
export const CREWS:Record<string,{n:string;y:number;sk:string}>={
 isci:{n:'Düz işçi',y:32,sk:'duvar'},hafriyat:{n:'Kepçe operatörü',y:70,sk:'beton'},kalipci:{n:'Kalıpçı',y:62,sk:'kalip'},demirci:{n:'Demirci',y:62,sk:'demir'},betoncu:{n:'Betoncu',y:52,sk:'beton'},duvarci:{n:'Duvarcı',y:58,sk:'duvar'},
 sivaci:{n:'Sıvacı',y:58,sk:'ince'},tesisatci:{n:'Tesisatçı',y:72,sk:'ince'},elektrikci:{n:'Elektrikçi',y:74,sk:'ince'},seramikci:{n:'Seramikçi',y:70,sk:'ince'},boyaci:{n:'Boyacı',y:52,sk:'ince'},marangoz:{n:'Marangoz',y:68,sk:'ince'}};
export interface ItemDef{id:string;n:string;ph:string;tr:string;md:number;mats:Record<string,number>;fee:number;wait:number;st?:number;gate?:(s:Stage)=>boolean;}
const I=(id:string,n:string,ph:string,tr:string,md:number,mats:Record<string,number>={},fee=0,wait=0,st=0,gate?:(s:Stage)=>boolean):ItemDef=>({id,n,ph,tr,md,mats,fee,wait,st,gate});
export const PHASES:Record<string,string>={haz:'Hazırlık',kaba:'Kaba inşaat',dis:'Dış kabuk',tes:'Tesisat',ince:'İnce iş',tes2:'Teslim'};
export const ITEMS:ItemDef[]=[
 I('etut','Zemin etüdü','haz','',0,{},2,.5,1),I('proje','Mimari ve statik proje','haz','',0,{},5,.8),I('ruhsat','Yapı ruhsatı','haz','',0,{},3,1.2),I('kurulum','Şantiye kurulumu','haz','isci',.05,{kereste:.004}),I('hafriyat','Hafriyat','haz','hafriyat',.08,{},4),
 I('temel','Temel betonu','kaba','betoncu',.08,{cimento:.06,kum:.05,cakil:.08,demir:.006},0,0,3),I('yalitim','Temel su yalıtımı','kaba','isci',.03,{yalitim:.15},0,0,1),I('kalip','Kolon ve döşeme kalıbı','kaba','kalipci',.35,{kereste:.012},0,0,1),I('demir','Demir bağlama','kaba','demirci',.3,{demir:.04},0,0,4),I('beton','Beton dökümü','kaba','betoncu',.12,{cimento:.12,kum:.1,cakil:.15},0,0,4),I('merdiven','Merdiven','kaba','kalipci',.05,{demir:.002,cimento:.01}),
 I('duvar','Duvar örme','dis','duvarci',.3,{tugla:40,cimento:.02,kum:.03},0,0,1),I('cati','Çatı','dis','marangoz',.06,{kereste:.006,kiremit:.25}),I('pencere','Pencere montajı','dis','marangoz',.05,{dograma:.12}),I('cephe','Dış cephe ve mantolama','dis','sivaci',.1,{yalitim:.2,cimento:.015}),I('korkuluk','Balkon korkuluğu','dis','demirci',.02,{demir:.002}),
 I('elektrik','Elektrik tesisatı','tes','elektrikci',.08,{elektrik:.25}),I('su','Su tesisatı','tes','tesisatci',.07,{tesisat:.2}),I('gaz','Doğal gaz','tes','tesisatci',.03,{tesisat:.08}),I('kalorifer','Kalorifer','tes','tesisatci',.05,{tesisat:.15}),I('asansor','Asansör','tes','',0,{},6,.8,0,s=>s.flats>=8),I('yangin','Yangın tesisatı','tes','tesisatci',.02,{tesisat:.05},0,0,0,s=>s.m2>=1200),
 I('siva','İç sıva','ince','sivaci',.2,{cimento:.02,kum:.04}),I('sap','Şap','ince','sivaci',.06,{cimento:.015,kum:.03}),I('seramik','Seramik','ince','seramikci',.1,{seramik:.5}),I('parke','Parke','ince','marangoz',.04,{parke:.6}),I('boya','Boya','ince','boyaci',.07,{boya:.25}),I('mutfak','Mutfak ve banyo','ince','marangoz',.04,{dograma:.05}),I('kapi','İç kapılar','ince','marangoz',.03,{dograma:.06}),
 I('cevre','Çevre düzeni','tes2','isci',.03,{},1),I('denetim','Yapı denetim','tes2','',0,{},2,.6),I('iskan','İskân','tes2','',0,{},2,1)];
export const ITEM:Record<string,ItemDef>=Object.fromEntries(ITEMS.map(i=>[i.id,i]));
const SETS:Record<string,string[]>={full:ITEMS.map(i=>i.id),tad:['siva','seramik','boya'],kat:['kurulum','kalip','demir','beton','duvar','cati','pencere','cephe','elektrik','su','siva','sap','seramik','boya','kapi'],kaba:['kurulum','hafriyat','temel','yalitim','kalip','demir','beton','merdiven','cevre','denetim'],kurum:[]};
export const setItems=(s:Stage)=>SETS[s.set].filter(id=>!ITEM[id].gate||ITEM[id].gate!(s));
export function unitCost(ids:string[]){let c=0;for(const id of ids){const d=ITEM[id];c+=d.fee;c+=d.md*(d.tr?CREWS[d.tr].y*1.15:0);for(const m in d.mats)c+=d.mats[m]*MATS[m].p;}return c;}
export interface Stage{yd?:boolean;n:string;d:string;tier:number;mo:number;cost:number;net:number;kind:'sat'|'ihale'|'kurum';rep:number;cert:number;req:number;floors:number;flats:number;m2:number;qm:number;mm:number;set:string;shops:number;}
const S=(n:string,d:string,tier:number,mo:number,kind:Stage['kind'],m2:number,flats:number,floors:number,rep:number,req:number,set='full',qm=1,mm=1,shops=0,kcost=0):Stage=>{const o:Stage={n,d,tier,mo,cost:kcost,net:0,kind,rep,cert:0,req,floors,flats,m2,qm,mm,set,shops};if(kind!=='kurum'){o.cost=m2*unitCost(setItems(o))*qm;o.net=kind==='sat'?m2*M2_PRICE*.82*mm*.5:o.cost*1.3;}return o;};
export const TIERS=['Mahalle','İlçe','Şehir','Büyük Oyuncu','Zirve','Dünya'];
export const STAGES:Stage[]=[
S('Sıva, boya, tadilat','Komşunun duvarıyla başlar her şey.',0,2,'ihale',160,0,0,0,3,'tad'),
S('Gecekondu üstüne kat','Ruhsat soran olursa dua et.',0,5,'ihale',140,0,2,8,2,'kat'),
S('3-4 daireli ilk bina','Mahalle arasında kat karşılığı, adını taşıyan ilk bina.',0,8,'sat',380,4,4,14,2),
S('6 daireli apartman','Aynı sokakta ikinci iş, kendi usta ekibin.',0,10,'sat',640,6,5,20,2),
S('Köşe başı apartmanı','Altta dükkânlar. Kira da getirir, kavga da.',0,12,'sat',1000,8,6,25,1,'full',1,1.04,4),
S('İlk ofis ve tabela','Muhasebeci, vergi düzeni, kapıda adın.',0,3,'kurum',0,0,0,28,1,'kurum',1,1,0,3e4),
S('10-12 daireli apartman','Kiralık vinç ilk kez senin için dönüyor.',1,14,'sat',1300,12,7,32,2),
S('Yan yana iki blok','İki bina aynı anda, iki kat bela.',1,18,'sat',2600,24,8,36,2),
S('Belediye işleri','Kaldırım, istinat duvarı, okul onarımı.',1,10,'ihale',1600,0,0,38,2,'kaba'),
S('Kooperatif evleri','Üyeler, aidatlar, bitmeyen toplantılar.',1,24,'ihale',4400,40,6,42,1),
S('30 dairelik küçük site','İlk kez bahçe duvarının içi senin.',1,26,'sat',3400,30,6,45,1,'full',1.04,1.08),
S('Kendi kamyon ve kepçelerin','Kiradan kurtuluş, bakımın başlangıcı.',1,6,'kurum',0,0,0,46,1,'kurum',1,1,0,4e5),
S('60-100 daireli havuzlu site','Broşürü olan ilk işin.',2,30,'sat',11000,90,10,50,2,'full',1.1,1.2),
S('Satış ofisi ve reklam','Maketten satış, televizyonda yüzün.',2,4,'kurum',0,0,0,52,1,'kurum',1,1,0,5e5),
S('Devlet okulu ve sağlık ocağı','Hakediş geç gelir ama gelir.',2,20,'ihale',6000,0,4,55,1),
S('Küçük otel','İnşaat bitince işletme derdi başlar.',2,26,'sat',9000,60,9,57,1,'full',1.25,1.4),
S('İlk kentsel dönüşüm','On iki malik, on iki ayrı dert.',2,30,'sat',14000,120,12,60,1),
S('Kendi hazır beton santralin','Betonuna artık kimseye sormadan güvenirsin.',2,18,'kurum',0,0,0,62,1,'kurum',1,1,0,5e6),
S('İş hanı ya da küçük AVM','Kiracı bulmak binayı dikmekten zor.',2,30,'sat',30000,0,10,64,1,'full',1.3,1.5,80),
S('Devlet arazisi ihalesi','Kârı devletle paylaşırsın, sırtın yere gelmez.',3,36,'sat',36000,300,14,66,1,'full',1.1,1.15),
S('500-1000 konutluk toplu konut','Binlerce aile, binlerce şikâyet.',3,44,'sat',90000,800,12,68,1),
S('Hastane ya da kampüs','Şartnamesi kitap gibi, denetimi sert.',3,44,'ihale',50000,0,8,70,1,'full',1.5),
S('Büyük konut projesi','Okuluyla çarşısıyla bir mahalle.',3,54,'sat',150000,1200,18,73,1,'full',1.2,1.25),
S('İlk rezidans','Lobide kahve, asansörde parfüm kokusu.',3,48,'sat',45000,300,28,75,1,'full',2.2,2.6),
S('Yol, viyadük, köprü','Ayakların yere değmeyen işler.',3,44,'ihale',120000,0,0,77,1,'kaba',2),
S('Holdingleşme, halka arz','Artık bir şirket değil, borsada bir kod.',4,12,'kurum',0,0,0,80,1,'kurum',1,1,0,6e7),
S('Yurt dışı ihaleleri','Başka ülke, başka kur, başka bela.',4,48,'ihale',180000,0,14,82,1,'full',1.3),
S('Havalimanı ya da liman ortaklığı','Ortak bulamayan ayakta kalamaz.',4,72,'ihale',400000,0,6,84,1,'full',1.4),
S('Şehrin en yüksek kulesi','Dedenin sözü burada tutulur.',4,90,'sat',120000,500,64,86,1,'full',3,3.4),
S('Sıfırdan yeni bir şehir','Bir hanedanın son imzası sandın. Değilmiş.',4,120,'sat',300000,2800,30,90,1,'full',1.3,1.3),
S('Kafkasya\'da toplu konut','Başka dil, başka kur, aynı beton.',5,40,'sat',120000,1000,16,91,1,'full',1.2,1.3),
S('Afrika\'da hastane ve okullar','Malzeme gemiyle gelir, sıtma uçakla.',5,36,'ihale',60000,0,4,92,1,'full',1.3),
S('Körfez\'de otel kulesi','Kum fırtınası, 50 derece, cezalı teslim tarihi.',5,54,'ihale',90000,0,55,93,1,'full',2.6),
S('Şehir hastanesi','Kamu-özel ortaklığı: yirmi beş yıl kira garantisi, yirmi beş yıl tartışma.',5,50,'ihale',250000,0,10,94,1,'full',1.6),
S('Stadyum','Çatısı açılır, tribünü kapanmaz.',5,42,'ihale',80000,0,6,95,1,'full',1.8),
S('Otoyol ve tünel','Dağın içinden geçen yol, bütçenin içinden de geçer.',5,60,'ihale',400000,0,0,96,1,'kaba',1.5),
S('Metro hattı','Şehrin altında, herkesin gözünün önünde.',5,72,'ihale',300000,0,0,97,1,'kaba',2.4),
S('Asma köprü','İki yakayı bağlarsın. Adın kazığa kazınır.',5,84,'ihale',200000,0,0,98,1,'kaba',4),
S('Ülkenin en büyük havalimanı','Konsorsiyumsuz düşünülemez, siyasetsiz hiç.',5,96,'ihale',900000,0,5,99,1,'full',1.8),
S('Hanedan kuleleri','Şehrin siluetinde soyadın. Bu kez gerçekten son imza.',5,120,'sat',500000,3500,80,100,1,'full',3,3.6),
];
for(const i of[26,30,31,32])STAGES[i].yd=true;
export const LAST=STAGES.length-1;
STAGES[0].net=STAGES[0].cost*1.8;STAGES[1].net=STAGES[1].cost*1.7;
for(const[i,r]of[[3,3],[6,3],[7,3],[10,2],[12,3],[16,2],[19,2],[20,2],[22,2]])STAGES[i].req=r;
export const CERT=['H','G','F','E','D','C','B','A'];
export const CERT_EXP=[0,4e5,2e6,8e6,3e7,12e7,3e8,12e8];
export const CERT_M2=[800,2500,6000,15000,45000,170000,400000,1e12];
export const SUPPLIERS=[{n:'Ucuzcu Hasan',d:'%12 ucuz, faturası ve kalitesi şüpheli',mul:.88,due:0},{n:'Güven Yapı Market',d:'Piyasa fiyatı, peşin, sağlam',mul:1,due:0},{n:'Vadeci Kemal',d:'%6 pahalı, ödeme 4 ay sonra',mul:1.06,due:4}];
export const RANKS=['Amele','Kalfa','Usta','Ustabaşı'];
export const WAGE=[800,1200,1900,2800];
export const TRADES:Record<string,string>={demir:'Demir',beton:'Beton',kalip:'Kalıp',duvar:'Duvar',ince:'İnce iş'};
export const DEFECTS:Record<string,string[]>={
 demir:['Etriye aralıkları açılmış','Paslı demir kolona girmiş','Filiz boyu kısa kesilmiş','Kirişte demir eksik bağlanmış'],
 beton:['Betona su katılmış','Vibratör vurulmadan döküm yapılmış','Kür yapılmadan kalıp sökülmüş','Kolon dibinde boşluk kalmış'],
 kalip:['Kalıp şişmiş, kolon kaçık','Payanda erken alınmış','Döşeme eğri çıkmış'],
 duvar:['Duvar bağı atlanmış','Yangın merdiveni duvarı eksik','Tuğlalar suya batırılmadan örülmüş'],
 ince:['Su yalıtımı atlanmış','Tesisat betona gömülü bırakılmış','Elektrik kablosu ince seçilmiş'],
};
export const EVENINGS:Record<string,{n:string;d:string}>={
 ek:{n:'Ek iş',d:'Para gelir, beden öder.'},okul:{n:'Akşam okulu',d:'Bilgi ve yükselme hızı.'},kahve:{n:'Kahvehane',d:'Hatır ve iş haberleri.'},
 aile:{n:'Aile',d:'Evdekiler seni unutmaz.'},dinlen:{n:'Dinlenme',d:'Sağlık ve sinir toparlar.'}};
export const HOMES=[
 {n:'Şantiye koğuşu',p:0,r:0,c:0},{n:'Kiralık bodrum',p:0,r:180,c:1},{n:'Gecekondu',p:6e3,r:40,c:2},{n:'Kiralık daire',p:0,r:450,c:3},
 {n:'Tapulu daire',p:8e4,r:150,c:4},{n:'Kendi apartmanında kat',p:16e4,r:300,c:5},{n:'Bahçeli villa',p:9e5,r:2e3,c:6},{n:'Köşk',p:5e6,r:1e4,c:7},{n:'Deniz kıyısında yalı',p:25e6,r:4e4,c:8}];
export const CARS=[
 {n:'Yok, dolmuş',p:0,u:0,s:0},{n:'Eski kamyonet',p:5e3,u:120,s:1},{n:'İkinci el sedan',p:12e3,u:220,s:2},{n:'Aile arabası',p:35e3,u:400,s:3},
 {n:'Alman sedanı',p:12e4,u:1200,s:5},{n:'Büyük SUV',p:3e5,u:2500,s:6},{n:'Makam aracı, şoförlü',p:8e5,u:9e3,s:8},{n:'İtalyan spor araba',p:3e6,u:25e3,s:10}];
export const INV:Record<string,{n:string;d:string;min:number}>={
 altin:{n:'Altın',d:'Krizde sığınak, patlamada uyur.',min:1e3},doviz:{n:'Döviz',d:'Kur fırlarsa kazandırır.',min:1e3},borsa:{n:'Borsa',d:'Patlamada uçar, krizde çakılır.',min:2e3},
 tarla:{n:'Şehir dışı tarla',d:'Yavaş değerlenir, imar gelirse katlanır.',min:1e4},kira:{n:'Kiralık daireler',d:'Düzenli kira, düşük risk.',min:5e4}};
export const BIZ:Record<string,{n:string;d:string;p:number;inc:number;st:number}>={
 oto:{n:'Oto yıkama ve lastik',d:'Küçük ama hep çalışır.',p:8e4,inc:1200,st:3},
 otel:{n:'Sahil oteli',d:'Yazın kazandırır, kışın sıkar.',p:3e6,inc:3e4,st:12},
 ocak:{n:'Taş ocağı',d:'Malzeme fiyatın %5 düşer, çevreci mahkemesi gelir.',p:1e7,inc:8e4,st:17},
 tv:{n:'Yerel gazete ve TV',d:'İtibarın daha yavaş erir.',p:4e7,inc:2e5,st:21},
};
// terrain: sahil=deniz kıyısı, ic=ova, dag=dağ eteği. x,y: haritadaki yer. Deprem riski oyun içindir, kaba değerdir.
export interface CityDef{yd?:boolean;n:string;terrain:string;mul:number;dem:number;quake:number;winter:number;labor:number;x:number;y:number;hoods:string[];d:string;}
const Ct=(n:string,terrain:string,mul:number,dem:number,quake:number,winter:number,labor:number,lon:number,lat:number,hoods:string[],d:string):CityDef=>({n,terrain,mul,dem,quake,winter,labor,x:(lon-26)*100/19,y:(42-lat)*100/19,hoods,d});
export const CITIES:Record<string,CityDef>={
 istanbul:Ct('İstanbul','sahil',1.7,1.25,1.2,.2,1.1,29,41,['Fikirtepe','Bağcılar','Kartal','Ümraniye','Avcılar','Esenler','Maltepe','Pendik','Beylikdüzü','Şişli','Gaziosmanpaşa','Kağıthane'],'Arsa çok pahalı, talep hiç bitmez, deprem riski yüksek.'),
 ankara:Ct('Ankara','ic',1.2,1.05,.45,.6,1,32.85,39.93,['Keçiören','Mamak','Etimesgut','Sincan','Dikmen','Batıkent','Demetevler','Çayyolu','Altındağ','Pursaklar'],'Memur şehri. Devlet ihaleleri yakın, kışı sert.'),
 izmir:Ct('İzmir','sahil',1.4,1.12,1.15,.1,1,27.14,38.42,['Bornova','Karşıyaka','Buca','Çiğli','Bayraklı','Gaziemir','Konak','Balçova','Narlıdere'],'Deniz manzarası değerli, fay hatları da yakın.'),
 bursa:Ct('Bursa','dag',1.1,1.05,1,.35,1,29.06,40.19,['Nilüfer','Osmangazi','Yıldırım','Görükle','Demirtaş','Hamitler','Çekirge'],'Sanayi ve göç birlikte büyütüyor.'),
 antalya:Ct('Antalya','sahil',1.25,1.1,.7,.02,.9,30.71,36.89,['Muratpaşa','Kepez','Konyaaltı','Lara','Döşemealtı','Aksu'],'Yabancı alıcı ve otel işi var, yazlar uzun.'),
 kocaeli:Ct('Kocaeli','sahil',1.05,1.02,1.35,.3,1,29.92,40.77,['İzmit','Gebze','Darıca','Körfez','Başiskele','Gölcük'],'Fabrikalar, işçi konutları ve çok ciddi fay riski.'),
 adana:Ct('Adana','ic',.85,.95,.8,.02,.9,35.32,37,['Seyhan','Çukurova','Yüreğir','Sarıçam','Karataş Yolu'],'Ucuz arsa, sıcak yaz, kalabalık aile evleri.'),
 mersin:Ct('Mersin','sahil',.9,.98,.5,.02,.9,34.63,36.8,['Yenişehir','Mezitli','Toroslar','Akdeniz','Tarsus'],'Liman ve yazlık birlikte. Sakin bir pazar.'),
 konya:Ct('Konya','ic',.85,.97,.3,.65,.95,32.49,37.87,['Selçuklu','Meram','Karatay','Bosna Hersek','Sille'],'Düz arazi, sağlam talep, deprem riski görece düşük.'),
 kayseri:Ct('Kayseri','dag',.85,1,.45,.8,.95,35.49,38.73,['Melikgazi','Kocasinan','Talas','Hacılar','İldem'],'Tüccar şehri. Parayı sayarlar, kış uzundur.'),
 eskisehir:Ct('Eskişehir','ic',.9,.95,.65,.55,1,30.52,39.78,['Tepebaşı','Odunpazarı','Batıkent','Bağlar','Vişnelik'],'Öğrenci evleri ve kiralık daire işi canlı.'),
 gaziantep:Ct('Gaziantep','ic',.85,1.02,1.1,.3,.85,37.38,37.07,['Şahinbey','Şehitkamil','İbrahimli','Karataş','Oğuzeli'],'Sanayi hızlı büyüyor, usta bulmak kolay.'),
 samsun:Ct('Samsun','sahil',.75,.9,.6,.3,.95,36.33,41.29,['Atakum','İlkadım','Canik','Tekkeköy','Kurupelit'],'Karadeniz sahili. Yağmur işi çok yavaşlatır.'),
 trabzon:Ct('Trabzon','sahil',.85,.92,.6,.4,1,39.72,41,['Ortahisar','Akçaabat','Yomra','Boztepe','Beşikdüzü'],'Düz arsa az, yokuş çok, gurbet parası var.'),
 erzurum:Ct('Erzurum','dag',.6,.78,1.05,1,1.1,41.27,39.9,['Yakutiye','Palandöken','Aziziye','Dadaşkent','Şükrüpaşa'],'Kışın beton donar, şantiye aylarca yavaşlar. Ucuz başlangıç.'),
 van:Ct('Van','dag',.55,.76,1.2,.9,1.05,43.38,38.5,['İpekyolu','Tuşba','Edremit','Bostaniçi','Erciş Yolu'],'Göl kıyısı, sert kış, fay riski yüksek.'),
 diyarbakir:Ct('Diyarbakır','ic',.6,.82,.85,.45,.85,40.21,37.92,['Kayapınar','Yenişehir','Bağlar','Sur Dışı','Kayaönü'],'Kalabalık aileler, büyük daireler, ucuz işçilik.'),
 denizli:Ct('Denizli','dag',.8,.92,1.1,.25,.95,29.09,37.77,['Pamukkale','Merkezefendi','Bağbaşı','Kınıklı','Servergazi'],'Tekstil parası ve aktif faylar.'),
 baku:{...Ct('Bakü','sahil',1.3,1.05,.9,.4,1.15,49.87,40.41,['Nesimi','Yasamal','Hatai','Binegedi','Sabunçu'],'Petrol parası, kardeş dil, sıkı bürokrasi.'),yd:true},
 askabat:{...Ct('Aşkabat','ic',1.2,.9,.8,.3,1.1,58.38,37.95,['Köşi','Bekrewe','Arçabil','Bagtyýarlyk'],'Mermer kaplama sevdası, ödemeler devletin keyfine bağlı.'),yd:true},
 erbil:{...Ct('Erbil','ic',1,.95,.6,.35,1.05,44.01,36.19,['Ankawa','Dream City','Şaklava','Gulan'],'Hızlı büyüyen şehir, sınırda belirsizlik.'),yd:true},
 doha:{...Ct('Doha','sahil',2,1.1,.1,0,1.35,51.53,25.29,['West Bay','Lusail','Al Sadd','The Pearl'],'Para bol, sıcak acımasız, ceza maddeleri daha acımasız.'),yd:true},
 dakar:{...Ct('Dakar','sahil',.8,.85,.1,0,1.2,-17.44,14.69,['Plateau','Almadies','Ouakam','Médina'],'Türk müteahhidinin yeni durağı: liman, hastane, okul.'),yd:true}};
export const TR_KEYS=Object.keys(CITIES).filter(k=>!CITIES[k].yd);export const YD_KEYS=Object.keys(CITIES).filter(k=>CITIES[k].yd);
export const SCENS:Record<string,{n:string;d:string;y:number;age:number;sex:'e'|'k';rank:number;cash:number;debt:number}>={
 koy:{n:'Köyden Gelen',d:'18 yaşındasın, cebinde otobüs biletinin parası kaldı. Şantiyede amelesin.',y:1986,age:18,sex:'e',rank:0,cash:300,debt:0},
 batik:{n:'Batmış Müteahhidin Oğlu',d:'Baban batıp öldü. Soyadın borçla anılıyor, ama beton kokusunu bilirsin.',y:1979,age:22,sex:'e',rank:1,cash:800,debt:8000},
 kalfa:{n:'Enkazdan Çıkan Kalfa',d:'Depremde evini kaybettin. Bir daha kötü bina dikilmesin diye yemin ettin.',y:1992,age:27,sex:'e',rank:1,cash:500,debt:0},
 dul:{n:'Kocasının Şantiyesi',d:'Kocan kalıptan düştü. İki çocuk, yarım bir bina ve sana güvenmeyen ustalar kaldı.',y:1984,age:31,sex:'k',rank:2,cash:40000,debt:12000}};
export const MNAMES=['Ali','Veli','Hasan','Hüseyin','Mustafa','Mehmet','Ahmet','İsmail','Yusuf','Kemal','Rıza','Cemal','Salih','Osman','Murat','Serkan','Emre','Burak','Tolga','Kerem','Arda','Can','Deniz','Barış','Eren','Yiğit','Sinan','Tahsin','Nuri','Hamza'];
export const FNAMES=['Ayşe','Fatma','Hatice','Zeynep','Emine','Elif','Meryem','Sultan','Gülay','Nurten','Songül','Esra','Derya','Pınar','Selin','Ece','Defne','Nazlı','Asiye','Hacer','Leyla','Sevgi','Ceren','Melis','Gamze','Nihal','Şule','Yasemin','Havva','Dilek'];
export const SURNAMES=['Yıldırım','Karaca','Demirtaş','Taşkın','Kalkan','Bozkurt','Çetin','Toprak','Akbulut','Sağlam','Korkmaz','Duman','Altıntaş','Güneş','Tekin','Kaplan','Ateş','Kılıç','Özdemir','Taşçı'];
export const RIVALS=['Kartal','Sarıkaya','Bayraktaroğlu','Hancıoğlu','Vural','Eroğlu','Tuncel','Gökalp'];
export const DREAMS:Record<string,string>={insaat:'inşaatçı olmak',doktor:'doktor olmak',ogretmen:'öğretmen olmak',muzik:'müzisyen olmak',mimar:'mimar olmak',avukat:'avukat olmak',gurbet:'uzaklara gitmek'};
export const TRAITS:Record<string,string>={hirsli:'Hırslı',durust:'Dürüst',savurgan:'Savurgan',sakin:'Sakin',kurnaz:'Kurnaz'};
// Pazarlık karakterleri
export const OWNERS:Record<string,{n:string;open:string;}>={inat:{n:'inatçı',open:'"Dedemin toprağı burası. Ucuza gitmez."'},para:{n:'paraya sıkışmış',open:'"Çocuğun düğünü var, nakit lazım. Ama hakkımı da yedirmem."'},kavga:{n:'mirasçılarla kavgalı',open:'"Kardeşlerimi ikna etmem lazım. En iyi katları görmek isterler."'},yasli:{n:'yaşlı ve temkinli',open:'"Oğlum, ben bu yaştan sonra kandırılmak istemem."'}};
// Ekipman: satın al ya da kirala
export const EQUIP:Record<string,{n:string;d:string;buy:number;rent:number;maint:number;st:number}>={
 vinc:{n:'Kule vinç',d:'5 kat ve üstünde şart. Yoksa her şantiye için aylık kira ödenir. Kendi vincin kaba işi %15 hızlandırır.',buy:9e4,rent:2200,maint:500,st:3},
 pompa:{n:'Beton pompası',d:'Beton dökümünü %25 hızlandırır, döküm hatasını azaltır.',buy:6e4,rent:0,maint:350,st:4},
 kamyon:{n:'Kamyon filosu',d:'Malzeme nakliyesi senden: malzeme %4 ucuzlar.',buy:7e4,rent:0,maint:450,st:4},
 tunel:{n:'Tünel kalıp',d:'30 daire üstü projelerde kalıp ve beton 1,6 kat hızlı. Pahalı ama toplu konutun anahtarı.',buy:5e5,rent:0,maint:2500,st:9}};
export const FURN:Record<string,{n:string;lv:string[]}>={salon:{n:'Salon',lv:['Minder ve soba','Koltuk takımı ve büfe','Köşe takımı, büyük televizyon','Avize, ithal takım']},mutfak:{n:'Mutfak',lv:['Tüp ocak','Masa, sandalye','Buzdolabı, çamaşır makinesi','Ankastre mutfak']},yatak:{n:'Yatak odası',lv:['Yer yatağı','Karyola','Yatak odası takımı','Gömme dolap, şık takım']},cocuk:{n:'Çocuk odası',lv:['Yok','Ranza ve masa','Bilgisayarlı oda','Her çocuğa ayrı oda']}};
export const furnCost=(lv:number,home:number)=>[0,2500,9000,32000][lv]*(1+home*.55);
// Başarımlar
export const ACH:Record<string,{n:string;d:string}>={
 ilkbina:{n:'İlk tapu',d:'Adını taşıyan ilk binayı bitir.'},usta:{n:'Usta eli',d:'Bir mini oyunda kusursuza yakın iş çıkar.'},gozu:{n:'Usta gözü',d:'Denetimde bütün hataları bul.'},
 depremAyakta:{n:'Ayakta kalan',d:'Büyük depremde tek binan bile yıkılmasın.'},onbina:{n:'Mahallenin müteahhidi',d:'10 bina bitir.'},ellibina:{n:'Şehrin silüeti',d:'50 bina bitir.'},
 asama12:{n:'Havuzlu site',d:'12. aşamaya ulaş.'},asama20:{n:'Büyük oyuncu',d:'20. aşamaya ulaş.'},kule:{n:'Şehrin en yükseği',d:'Kuleyi bitir.'},
 kusak3:{n:'Üç kuşak',d:'Şirketi üçüncü kuşağa devret.'},batmadan:{n:'Sağlam kasa',d:'Hiç batmadan 30 yıl geçir.'},kazasiz:{n:'Sıfır kaza',d:'20 yıl iş kazası olmadan çalış.'},
 kiraci:{n:'Kira geliri',d:'Elinde 10 kiralık daire tut.'},meclis:{n:'Meclis üyesi',d:'Belediye meclisine gir.'},sampiyon:{n:'Rakibi geç',d:'Bütün rakip ailelerden yüksek aşamaya çık.'},yali:{n:'Gecekondudan yalıya',d:'Koğuşta başlayıp yalıya taşın.'}};
/** Zorluk: faiz, başlangıç parası, kötü olay sıklığı, talep, maliyet ve kriz aralığı çarpanları */
export const DIFF=[
 {n:'Kolay',d:'Kredi ucuz, kriz seyrek, alıcı bol. Hikâyeyi yaşamak isteyene.',rate:.8,cash:1.5,pain:.7,dem:1.08,cost:.95,crisis:1.4},
 {n:'Normal',d:'Türkiye işte: inişi de çıkışı da var.',rate:1,cash:1,pain:1,dem:1,cost:1,crisis:1},
 {n:'Zor',d:'Faiz yüksek, kriz sık, hata affedilmez.',rate:1.2,cash:.8,pain:1.25,dem:.94,cost:1.04,crisis:.8},
 {n:'Gerçekçi',d:'Pahalı kredi, nazlı alıcı, kapıdan eksik olmayan dert. Uzun ve sert bir oyun.',rate:1.35,cash:.6,pain:1.45,dem:.88,cost:1.08,crisis:.65}];
export const dif=(w:{diff?:number})=>DIFF[w.diff??1]||DIFF[1];
/** Holding şirketleri: st = gereken aşama, k = fiyatın o aşamanın maliyetine oranı, r = yıllık getiri */
export const SUBS:Record<string,{n:string;d:string;st:number;k:number;r:number}>={
 emlak:{n:'Emlak ofisi',d:'Daireler %12 daha hızlı satılır.',st:4,k:.12,r:.08},
 nakliye:{n:'Nakliye ve iş makinesi kiralama',d:'Boşta kalan makineler başkasına kiraya gider.',st:9,k:.18,r:.11},
 tugla:{n:'Tuğla ve briket fabrikası',d:'Tuğla %15 ucuz, fazlası piyasaya satılır.',st:7,k:.22,r:.09},
 mimarlik:{n:'Mimarlık ofisi',d:'Proje ücreti yarıya iner, daireler %3 değerli.',st:10,k:.1,r:.06},
 taseron:{n:'Kendi taşeron firman',d:'Taşeron işçilik %15 ucuz.',st:12,k:.15,r:.07},
 isletme:{n:'Otel ve AVM işletmesi',d:'Düzenli kira ve konaklama geliri; krizde düşer.',st:18,k:.3,r:.12}};
/** Kadro: isimli uzmanlar */
export const ROLES:Record<string,{n:string;d:string;st:number}>={
 mimar:{n:'Mimar',d:'Daireler daha değerli (en çok %4).',st:5},
 statik:{n:'Statik mühendisi',d:'Gizli hata azalır, bina daha sağlam.',st:6},
 muhasebe:{n:'Mali müşavir',d:'Vergi cezası seyrek, kredi faizi %5 düşük.',st:5},
 hukuk:{n:'Avukat',d:'Davalar ucuzlar, uzun davalarda elin güçlü.',st:8}};
