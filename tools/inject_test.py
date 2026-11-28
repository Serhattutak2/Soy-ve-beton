# Simülatör testi için: hata/donma göstergesi + otomatik oynatma kancası ekler (sadece test derlemesinde).
import sys
p=sys.argv[1];h=open(p,encoding='utf8').read()
head=r"""<script>
window.__E=[];window.__L=[];var __t0=Date.now();
function __show(){var d=document.getElementById('__dbg');if(!d){d=document.createElement('div');d.id='__dbg';d.style.cssText='position:fixed;left:0;right:0;bottom:0;max-height:42%;overflow:auto;background:rgba(150,0,0,.9);color:#fff;font:11px monospace;z-index:2147483647;padding:6px;white-space:pre-wrap;pointer-events:none';(document.body||document.documentElement).appendChild(d);}d.textContent='⏱ '+((Date.now()-__t0)/1000).toFixed(1)+'s\n'+__E.concat(__L).join('\n');}
window.onerror=function(m,s,l,c,e){__E.push('HATA: '+m+' @'+l+':'+c+(e&&e.stack?'\n'+String(e.stack).slice(0,300):''));__show();};
window.addEventListener('unhandledrejection',function(e){__E.push('REJ: '+(e.reason&&e.reason.stack||e.reason));__show();});
function __log(x){__L.push(((Date.now()-__t0)/1000).toFixed(1)+'s '+x);__show();}
setInterval(__show,500);
</script>"""
tail=r"""<script>
__log('script sonu, ekran: '+(document.getElementById('go')?'başlangıç':'?')+' sayfa='+document.documentElement.scrollHeight+' pencere='+innerHeight);
function __step(n,f,ms){setTimeout(function(){try{f();__log('OK '+n);}catch(e){__log('ERR '+n+': '+e+(e.stack?' '+String(e.stack).slice(0,200):''));}},ms);}
__step('senaryo+başla',function(){document.querySelector('[data-sc=truva]').click();document.getElementById('go').click();},6000);
__step('seçimler',function(){for(var i=0;i<6;i++){var b=document.querySelector('#sheet .choice:not([disabled])');if(b)b.click();}__log('yıl='+S.year+' modal='+!!cur);},11000);
__step('bir yıl',function(){var b=document.querySelector('[data-live]')||null;liveYear(1);},16000);
__step('seçimler2',function(){for(var i=0;i<12;i++){var b=document.querySelector('#sheet .choice:not([disabled])');if(b)b.click();}__log('yıl='+S.year);},21000);
__step('saray',function(){tab='saray';render();},26000);
__step('harita',function(){tab='harita';render();__log('hücre='+document.querySelectorAll('[data-reg]').length);},36000);
__step('pazar',function(){tab='koy';render();var b=document.querySelector('[data-mkt]');__log('pazar satırı='+document.querySelectorAll('.mrow').length);window.scrollTo(0,document.documentElement.scrollHeight);},31000);
</script>"""
h=h.replace('<head>','<head>'+head,1)
i=h.rfind('</body>');h=h[:i]+tail+h[i:]
open(p,'w',encoding='utf8').write(h);print('injected')
