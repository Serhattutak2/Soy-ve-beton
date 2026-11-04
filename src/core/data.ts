export interface Stage{n:string;d:string;tier:number;mo:number;cost:number;net:number;kind:'sat'|'ihale'|'kurum';crew:number;rep:number;cert:number;req:number;floors:number;}
const S=(n:string,d:string,tier:number,mo:number,cost:number,net:number,kind:Stage['kind'],crew:number,rep:number,cert:number,req:number,floors:number):Stage=>({n,d,tier,mo,cost,net,kind,crew,rep,cert,req,floors});
export const TIERS=['Mahalle','İlçe','Şehir','Büyük Oyuncu','Zirve'];
export const STAGES:Stage[]=[
S('Sıva, boya, tadilat','Komşunun duvarıyla başlar her şey.',0,2,12e3,16e3,'ihale',2,0,0,3,0),
S('Gecekondu üstüne kat','Ruhsat soran olursa dua et.',0,5,3e4,4e4,'ihale',3,8,0,2,2),
S('3-4 daireli ilk bina','Mahalle arasında kat karşılığı, adını taşıyan ilk bina.',0,11,8e4,112e3,'sat',4,14,0,2,4),
S('6 daireli apartman','Aynı sokakta ikinci iş, kendi usta ekibin.',0,14,15e4,21e4,'sat',5,20,0,2,5),
S('Köşe başı apartmanı','Altı dükkânlı. Kira da getirir, kavga da.',0,16,23e4,32e4,'sat',6,25,1,1,6),
S('İlk ofis ve tabela','Muhasebeci, vergi düzeni, kapıda adın.',0,3,4e4,0,'kurum',6,28,1,1,0),
S('10-12 daireli apartman','Kiralık vinç ilk kez senin için dönüyor.',1,18,4e5,56e4,'sat',8,32,1,2,7),
S('Yan yana iki blok','İki bina aynı anda, iki kat bela.',1,22,8e5,11e5,'sat',10,36,2,2,8),
S('Belediye işleri','Kaldırım, istinat duvarı, okul onarımı.',1,10,3e5,39e4,'ihale',8,38,2,2,0),
S('Kooperatif evleri','Üyeler, aidatlar, bitmeyen toplantılar.',1,26,13e5,18e5,'ihale',12,42,2,1,6),
S('30 dairelik küçük site','İlk kez bahçe duvarının içi senin.',1,30,22e5,31e5,'sat',15,45,3,1,6),
S('Kendi kamyon ve kepçelerin','Kiradan kurtuluş, bakımın başlangıcı.',1,6,5e5,0,'kurum',15,46,3,1,0),
S('60-100 daireli havuzlu site','Broşürü olan ilk işin.',2,36,6e6,84e5,'sat',25,50,3,2,10),
S('Satış ofisi ve reklam','Maketten satış, televizyonda yüzün.',2,4,5e5,0,'kurum',25,52,3,1,0),
S('Devlet okulu ve sağlık ocağı','Hakediş geç gelir ama gelir.',2,24,5e6,62e5,'ihale',25,55,3,1,4),
S('Küçük otel','İnşaat bitince işletme derdi başlar.',2,30,12e6,17e6,'sat',40,57,4,1,9),
S('İlk kentsel dönüşüm','On iki malik, on iki ayrı dert.',2,36,18e6,26e6,'sat',50,60,4,1,12),
S('Kendi hazır beton santralin','Betonuna artık kimseye sormadan güvenirsin.',2,18,8e6,0,'kurum',40,62,4,1,0),
S('İş hanı ya da küçük AVM','Kiracı bulmak binayı dikmekten zor.',2,36,4e7,56e6,'sat',70,64,4,1,10),
S('Devlet arazisi ihalesi','Kârı devletle paylaşırsın, sırtın yere gelmez.',3,40,7e7,1e8,'ihale',90,66,5,1,14),
S('500-1000 konutluk toplu konut','Binlerce aile, binlerce şikâyet.',3,48,13e7,18e7,'sat',120,68,5,1,12),
S('Hastane ya da kampüs','Şartnamesi kitap gibi, denetimi sert.',3,48,18e7,225e6,'ihale',120,70,5,1,8),
S('Büyük konut projesi','Okuluyla çarşısıyla bir mahalle.',3,60,35e7,49e7,'sat',150,73,6,1,18),
S('İlk rezidans','Lobide kahve, asansörde parfüm kokusu.',3,54,5e8,72e7,'sat',180,75,6,1,28),
S('Yol, viyadük, köprü','Ayakların yere değmeyen işler.',3,48,45e7,56e7,'ihale',180,77,6,1,0),
S('Holdingleşme, halka arz','Artık bir şirket değil, borsada bir kod.',4,12,3e8,0,'kurum',200,80,6,1,0),
S('Yurt dışı ihaleleri','Başka ülke, başka kur, başka bela.',4,48,9e8,115e7,'ihale',250,82,7,1,0),
S('Havalimanı ya da liman ortaklığı','Ortak bulamayan ayakta kalamaz.',4,72,25e8,32e8,'ihale',350,84,7,1,0),
S('Şehrin en yüksek kulesi','Dedenin sözü burada tutulur.',4,96,4e9,58e8,'sat',500,86,7,1,64),
S('Sıfırdan yeni bir şehir','Bir hanedanın son imzası.',4,120,12e9,17e9,'sat',800,90,7,1,30),
];
for(let i=2;i<12;i++)if(STAGES[i].kind!=='kurum'){STAGES[i].cost=Math.round(STAGES[i].cost*.76);if(STAGES[i].kind==='sat')STAGES[i].net=Math.round(STAGES[i].net*1.3);}
const TUNE:Record<number,[number,number]>={12:[45e5,75e5],14:[4e6,54e5],15:[9e6,14e6],16:[14e6,22e6],18:[3e7,48e6],19:[6e7,85e6],20:[1e8,15e7],21:[15e7,2e8],22:[26e7,4e8],23:[4e8,62e7],24:[35e7,47e7],26:[7e8,95e7],27:[2e9,27e8],28:[35e8,55e8],29:[9e9,15e9]};
for(const k in TUNE){STAGES[+k].cost=TUNE[k][0];STAGES[+k].net=TUNE[k][1];}
export const REF_SHARE=.45;
export const CERT=['H','G','F','E','D','C','B','A'];
export const CERT_EXP=[0,2e5,1e6,4e6,15e6,6e7,25e7,1e9];
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
 {n:'Şantiye koğuşu',p:0,r:0,c:0},{n:'Kiralık bodrum',p:0,r:180,c:1},{n:'Gecekondu',p:6e3,r:40,c:2},{n:'Kiralık daire',p:0,r:550,c:3},
 {n:'Tapulu daire',p:6e4,r:150,c:4},{n:'Kendi apartmanında kat',p:25e4,r:450,c:5},{n:'Bahçeli villa',p:2e6,r:4e3,c:6},{n:'Köşk',p:15e6,r:25e3,c:7},{n:'Deniz kıyısında yalı',p:8e7,r:12e4,c:8}];
export const CARS=[
 {n:'Yok, dolmuş',p:0,u:0,s:0},{n:'Eski kamyonet',p:5e3,u:120,s:1},{n:'İkinci el sedan',p:12e3,u:220,s:2},{n:'Aile arabası',p:35e3,u:400,s:3},
 {n:'Alman sedanı',p:15e4,u:1500,s:5},{n:'Büyük SUV',p:4e5,u:3500,s:6},{n:'Makam aracı, şoförlü',p:15e5,u:15e3,s:8},{n:'İtalyan spor araba',p:6e6,u:5e4,s:10}];
export const INV:Record<string,{n:string;d:string;min:number}>={
 altin:{n:'Altın',d:'Krizde sığınak, patlamada uyur.',min:1e3},doviz:{n:'Döviz',d:'Kur fırlarsa kazandırır.',min:1e3},borsa:{n:'Borsa',d:'Patlamada uçar, krizde çakılır.',min:2e3},
 tarla:{n:'Şehir dışı tarla',d:'Yavaş değerlenir, imar gelirse katlanır.',min:1e4},kira:{n:'Kiralık daireler',d:'Düzenli kira, düşük risk.',min:5e4}};
export const BIZ:Record<string,{n:string;d:string;p:number;inc:number;st:number}>={
 oto:{n:'Oto yıkama ve lastik',d:'Küçük ama hep çalışır.',p:8e4,inc:1500,st:3},
 otel:{n:'Sahil oteli',d:'Yazın kazandırır, kışın sıkar.',p:8e6,inc:9e4,st:12},
 ocak:{n:'Taş ocağı',d:'Malzeme maliyeti %5 düşer, çevreci mahkemesi gelir.',p:3e7,inc:25e4,st:17},
 tv:{n:'Yerel gazete ve TV',d:'İtibarın daha yavaş erir.',p:15e7,inc:6e5,st:21},
};
export const CITIES:Record<string,{n:string;d:string;quake:number}>={
 sahil:{n:'Sahilkent',d:'Deniz, turizm, yazlık hırsı. Arsası pahalı, dairesi hızlı satılır.',quake:.7},
 sanayi:{n:'Demirkent',d:'Fabrikalar, işçi mahalleleri, ucuz konut. Kriz en önce burayı vurur.',quake:.8},
 fay:{n:'Yarıkkent',d:'Dağların dibinde, fay hattının üstünde. Her beton sınanır.',quake:1.3}};
export const SCENS:Record<string,{n:string;d:string;y:number;age:number;sex:'e'|'k';rank:number;cash:number;debt:number}>={
 koy:{n:'Köyden Gelen',d:'18 yaşındasın, cebinde otobüs biletinin parası kaldı. Şantiyede amelesin.',y:1986,age:18,sex:'e',rank:0,cash:300,debt:0},
 batik:{n:'Batmış Müteahhidin Oğlu',d:'Baban batıp öldü. Soyadın borçla anılıyor, ama beton kokusunu bilirsin.',y:1979,age:22,sex:'e',rank:1,cash:800,debt:8000},
 kalfa:{n:'Enkazdan Çıkan Kalfa',d:'Depremde evini kaybettin. Bir daha kötü bina dikilmesin diye yemin ettin.',y:1992,age:27,sex:'e',rank:1,cash:500,debt:0},
 dul:{n:'Kocasının Şantiyesi',d:'Kocan kalıptan düştü. İki çocuk, yarım bir bina ve sana güvenmeyen ustalar kaldı.',y:1984,age:31,sex:'k',rank:2,cash:9000,debt:12000}};
export const MNAMES=['Ali','Veli','Hasan','Hüseyin','Mustafa','Mehmet','Ahmet','İsmail','Yusuf','Kemal','Rıza','Cemal','Salih','Osman','Murat','Serkan','Emre','Burak','Tolga','Kerem','Arda','Can','Deniz','Barış','Eren','Yiğit','Sinan','Tahsin','Nuri','Hamza'];
export const FNAMES=['Ayşe','Fatma','Hatice','Zeynep','Emine','Elif','Meryem','Sultan','Gülay','Nurten','Songül','Esra','Derya','Pınar','Selin','Ece','Defne','Nazlı','Asiye','Hacer','Leyla','Sevgi','Ceren','Melis','Gamze','Nihal','Şule','Yasemin','Havva','Dilek'];
export const SURNAMES=['Yıldırım','Karaca','Demirtaş','Taşkın','Kalkan','Bozkurt','Çetin','Toprak','Akbulut','Sağlam','Korkmaz','Duman','Altıntaş','Güneş','Tekin','Kaplan','Ateş','Kılıç','Özdemir','Taşçı'];
export const RIVALS=['Kartal','Sarıkaya','Bayraktaroğlu','Hancıoğlu','Vural','Eroğlu','Tuncel','Gökalp'];
export const HOODS=['Tepebaşı','Çınarlı','Yeşilyurt','Kavaklık','Bahçelievler','Kocatepe','Güzelyalı','İstasyon','Saray','Hürriyet','Fatih','Cumhuriyet','Alibey','Değirmen','Aşağı Çarşı','Yukarı Mahalle','Sanayi','Gülbahar'];
export const DREAMS:Record<string,string>={insaat:'inşaatçı olmak',doktor:'doktor olmak',ogretmen:'öğretmen olmak',muzik:'müzisyen olmak',mimar:'mimar olmak',avukat:'avukat olmak',gurbet:'uzaklara gitmek'};
export const TRAITS:Record<string,string>={hirsli:'Hırslı',durust:'Dürüst',savurgan:'Savurgan',sakin:'Sakin',kurnaz:'Kurnaz'};
