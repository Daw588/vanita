const container=document.createElement("div"),toggleBtn=(container.id="app",document.body.appendChild(container),document.createElement("div")),style=(toggleBtn.id="app-toggle",toggleBtn.textContent="Vanita",document.body.appendChild(toggleBtn),document.createElement("style"));style.textContent='@import"https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200";svg.a1{stroke:currentColor;fill:currentColor;stroke-width:0;width:100%;height:auto;max-height:100%}.info.a2.a2{padding:8px 8px 0;font-size:.9rem}.controls.a2.a2{display:flex;flex-direction:row;gap:8px;padding:8px}.controls.a2 .textfield.a2{padding:8px;background-color:#111212;color:#bdbebe;border:1px solid #414142;border-radius:8px;outline:none;font-size:1rem}.controls.a2 .textfield.a2:focus{border-color:#bdbebe}.controls.a2 .textfield.a2::placeholder{color:#919191}.controls.a2 .button.a2{padding:6px 12px;background-color:transparent;color:#bdbebe;border:1px solid #bdbebe;border-radius:8px;font-size:1rem}.controls.a2 .button.a2:hover{border-color:#e4e4e4;color:#e4e4e4}.outfits.a2.a2{overflow-y:auto;padding:8px;display:flex;flex-direction:row;flex-wrap:wrap;align-items:flex-start;flex-grow:1;gap:8px}.outfits.a2 .outfit.a2{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px}.outfits.a2 .outfit .preview.a2{position:relative}.outfits.a2 .outfit .preview .icon.a2{width:126px;height:126px;background-color:#2f3133;border-radius:8px;cursor:pointer;transition:background .3s linear}.outfits.a2 .outfit .preview .icon.a2:hover{background:radial-gradient(transparent,rgba(0,0,0,.2))}.outfits.a2 .outfit .preview .options.a2{position:absolute;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:5px;background-color:#000000bf;border-radius:8px}.outfits.a2 .outfit .preview .options .option.a2{padding:3px;border:1px solid transparent;border-radius:8px;width:100%;font-size:.8rem;cursor:pointer}.outfits.a2 .outfit .preview .options .option.a2:hover{border-color:#fff}.outfits.a2 .outfit .caption.a2{display:flex;flex-direction:row;align-items:center;gap:5px;width:100%}.outfits.a2 .outfit .caption .name.a2{font-size:1rem;flex-grow:1;max-width:100px;text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.outfits.a2 .outfit .caption .actions.a2{display:flex;flex-direction:column;height:100%}.outfits.a2 .outfit .caption .actions .edit.a2{width:18px;height:18px;color:#fff;cursor:pointer}.switch.a5.a5.a5{position:relative;display:inline-block;width:40px;height:22.6666666667px}.switch.a5 input.a5.a5{opacity:0;width:0;height:0}.switch.a5 input.a5:checked+.slider.a5{background-color:#00b06f}.switch.a5 input.a5:focus+.slider.a5{box-shadow:0 0 1px #00b06f}.switch.a5 input.a5:checked+.slider.a5:before{transform:translate(17.3333333333px)}.switch.a5 .slider.a5.a5{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#656668;transition:.2s;border-radius:22.6666666667px}.switch.a5 .slider.a5.a5:before{position:absolute;content:"";height:17.3333333333px;width:17.3333333333px;left:2.6666666667px;bottom:2.6666666667px;background-color:#fff;transition:.2s;border-radius:50%}.options.a3.a3{display:flex;flex-direction:column}.options.a3 .option.a3{display:flex;align-items:center;gap:10px;padding:10px}.page.a4.a4{display:flex;flex-direction:column;gap:8px;padding:8px}.page.a4 .link.a4{color:#5e7af7}.page.a4 .link.a4:hover{text-decoration:underline}.header.a0.a0{display:flex;flex-direction:row;align-items:center;background-color:#191b1d;border-bottom:1px solid #111214;border-top-left-radius:5px;border-top-right-radius:5px;font-size:1rem}.header.a0 .icon.a0{width:24px;height:24px;margin-left:6px;user-select:none}.header.a0 .title.a0{padding:8px}.header.a0 .drag.a0{padding:8px;flex-grow:1;height:100%}.header.a0 .close.a0{width:24px;height:24px;margin-right:6px;cursor:pointer}.header.a0 .close.a0,.header.a0 .close .a0{color:#fff}.tabs.a0.a0{display:flex;flex-direction:row;align-items:center;background-color:#393b3d}.tabs.a0 .tab.a0{text-align:center;padding:6px 12px;font-size:1rem;cursor:pointer;border-bottom:1px solid transparent}.tabs.a0 .tab[data-isSelected=true].a0{background:rgba(255,255,255,.1294117647);border-color:#eee}.tabs.a0 .tab.a0:first-letter{text-transform:capitalize}.tabs.a0 .tab.a0:hover{background-color:#5e6165}#app *{box-sizing:border-box;font-family:HCo Gotham SSm,Helvetica Neue,Helvetica,Arial,Lucida Grande,"sans-serif"}#app{position:fixed;top:0;left:0;z-index:9999;display:flex;flex-direction:column;width:700px;height:500px;background:#232527;color:#fff;border:1px solid #111214;border-radius:5px}#app-toggle{position:fixed;top:100%;left:100px;transform:translateY(calc(-100% + 1px));z-index:9999;padding:6px 8px;cursor:pointer;background:#232527;color:#fff;border:1px solid #111214;border-bottom:none;border-top-left-radius:8px;border-top-right-radius:8px}#app .material-symbols-outlined{font-variation-settings:"FILL" 0,"wght" 400,"GRAD" 0,"opsz" 48}',document.head.appendChild(style);(()=>{var oe=Object.defineProperty,ae=(t,e,n)=>e in t?oe(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n,O=(t,e,n)=>(ae(t,"symbol"!=typeof e?e+"":e,n),n);function P(){}function Q(t,e){for(const n in e)t[n]=e[n];return t}function Ht(t){return t()}function Et(){return Object.create(null)}function q(t){t.forEach(Ht)}function Rt(t){return"function"==typeof t}function V(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}!function(){var t=document.createElement("link").relList;if(!(t&&t.supports&&t.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(t=>{for(const e of t)if("childList"===e.type)for(const n of e.addedNodes)"LINK"===n.tagName&&"modulepreload"===n.rel&&a(n)}).observe(document,{childList:!0,subtree:!0})}function a(t){var e,n;t.ep||(t.ep=!0,n={},(e=t).integrity&&(n.integrity=e.integrity),e.referrerpolicy&&(n.referrerPolicy=e.referrerpolicy),"use-credentials"===e.crossorigin?n.credentials="include":"anonymous"===e.crossorigin?n.credentials="omit":n.credentials="same-origin",fetch(t.href,n))}}();let ut;function bt(t,e){return(ut=ut||document.createElement("a")).href=e,t===ut.href}function re(t){return 0===Object.keys(t).length}function ie(t,...e){if(null==t)return P;const n=t.subscribe(...e);return n.unsubscribe?()=>n.unsubscribe():n}function vt(t,e,n){t.$$.on_destroy.push(ie(e,n))}function le(t,e,n,a){if(t)return e=zt(t,e,n,a),t[0](e)}function zt(t,e,n,a){return t[1]&&a?Q(n.ctx.slice(),t[1](a(e))):n.ctx}function ce(t,e,n,a){if(t[2]&&a){var r=t[2](a(n));if(void 0===e.dirty)return r;if("object"!=typeof r)return e.dirty|r;var o=[],s=Math.max(e.dirty.length,r.length);for(let t=0;t<s;t+=1)o[t]=e.dirty[t]|r[t];return o}return e.dirty}function ue(t,e,n,a,r,o){r&&(e=zt(e,n,a,o),t.p(e,r))}function fe(t){if(32<t.ctx.length){var e=[],n=t.ctx.length/32;for(let t=0;t<n;t++)e[t]=-1;return e}return-1}function ht(t){var e={};for(const n in t)"$"!==n[0]&&(e[n]=t[n]);return e}function g(t,e){t.appendChild(e)}function L(t,e,n){t.insertBefore(e,n||null)}function E(t){t.parentNode&&t.parentNode.removeChild(t)}function Ft(e,n){for(let t=0;t<e.length;t+=1)e[t]&&e[t].d(n)}function b(t){return document.createElement(t)}function gt(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function lt(t){return document.createTextNode(t)}function B(){return lt(" ")}function qt(){return lt("")}function T(t,e,n,a){return t.addEventListener(e,n,a),()=>t.removeEventListener(e,n,a)}function f(t,e,n){null==n?t.removeAttribute(e):t.getAttribute(e)!==n&&t.setAttribute(e,n)}function de(t){return Array.from(t.childNodes)}function xt(t,e){t.wholeText!==(e=""+e)&&(t.data=e)}function Lt(t,e){t.value=e??""}function me(t,e,{bubbles:n=!1,cancelable:a=!1}={}){var r=document.createEvent("CustomEvent");return r.initCustomEvent(t,n,a,e),r}let it;function at(t){it=t}function Vt(){if(it)return it;throw new Error("Function called outside component initialization")}function Gt(t){Vt().$$.on_mount.push(t)}function he(){const o=Vt();return(t,e,{cancelable:n=!1}={})=>{var a=o.$$.callbacks[t];if(a){const r=me(t,e,{cancelable:n});return a.slice().forEach(t=>{t.call(o,r)}),!r.defaultPrevented}return!0}}const et=[],pt=[],dt=[],wt=[],pe=Promise.resolve();let kt=!1;function ge(){kt||(kt=!0,pe.then(Kt))}function $t(t){dt.push(t)}function At(t){wt.push(t)}const _t=new Set;let Z=0;function Kt(){if(0===Z){var t=it;do{try{for(;Z<et.length;){var e=et[Z];Z++,at(e),_e(e.$$)}}catch(t){throw et.length=0,Z=0,t}for(at(null),et.length=0,Z=0;pt.length;)pt.pop()();for(let t=0;t<dt.length;t+=1){var n=dt[t];_t.has(n)||(_t.add(n),n())}}while(dt.length=0,et.length);for(;wt.length;)wt.pop()();kt=!1,_t.clear(),at(t)}}function _e(t){var e;null!==t.fragment&&(t.update(),q(t.before_update),e=t.dirty,t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,e),t.after_update.forEach($t))}const mt=new Set;let J;function Wt(){J={r:0,c:[],p:J}}function Jt(){J.r||q(J.c),J=J.p}function S(t,e){t&&t.i&&(mt.delete(t),t.i(e))}function Y(t,e,n,a){t&&t.o?mt.has(t)||(mt.add(t),J.c.push(()=>{mt.delete(t),a&&(n&&t.d(1),a())}),t.o(e)):a&&a()}function Qt(t,e){var n={},a={},r={$$scope:1};let o=t.length;for(;o--;){var s=t[o],i=e[o];if(i){for(const l in s)l in i||(a[l]=1);for(const c in i)r[c]||(n[c]=i[c],r[c]=1);t[o]=i}else for(const u in s)r[u]=1}for(const f in a)f in n||(n[f]=void 0);return n}function Zt(t){return"object"==typeof t&&null!==t?t:{}}function Bt(t,e,n){e=t.$$.props[e];void 0!==e&&(t.$$.bound[e]=n)(t.$$.ctx[e])}function F(t){t&&t.c()}function X(e,t,n,a){var{fragment:r,after_update:o}=e.$$;r&&r.m(t,n),a||$t(()=>{var t=e.$$.on_mount.map(Ht).filter(Rt);e.$$.on_destroy?e.$$.on_destroy.push(...t):q(t),e.$$.on_mount=[]}),o.forEach($t)}function H(t,e){t=t.$$;null!==t.fragment&&(q(t.on_destroy),t.fragment&&t.fragment.d(e),t.on_destroy=t.fragment=null,t.ctx=[])}function ye(t,e){-1===t.$$.dirty[0]&&(et.push(t),ge(),t.$$.dirty.fill(0)),t.$$.dirty[e/31|0]|=1<<e%31}function G(a,t,e,n,r,o,s,i=[-1]){var l=it;at(a);const c=a.$$={fragment:null,ctx:[],props:o,update:P,not_equal:r,bound:Et(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(t.context||(l?l.$$.context:[])),callbacks:Et(),dirty:i,skip_bound:!1,root:t.target||l.$$.root};s&&s(c.root);let u=!1;c.ctx=e?e(a,t.props||{},(t,e,...n)=>{n=n.length?n[0]:e;return c.ctx&&r(c.ctx[t],c.ctx[t]=n)&&(!c.skip_bound&&c.bound[t]&&c.bound[t](n),u)&&ye(a,t),e}):[],c.update(),u=!0,q(c.before_update),c.fragment=!!n&&n(c.ctx),t.target&&(t.hydrate?(o=de(t.target),c.fragment&&c.fragment.l(o),o.forEach(E)):c.fragment&&c.fragment.c(),t.intro&&S(a.$$.fragment),X(a,t.target,t.anchor,t.customElement),Kt()),at(l)}class K{$destroy(){H(this,1),this.$destroy=P}$on(t,e){if(!Rt(e))return P;const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{var t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(t){this.$$set&&!re(t)&&(this.$$.skip_bound=!0,this.$$set(t),this.$$.skip_bound=!1)}}class be{constructor(t){O(this,"offX",0),O(this,"offY",0),O(this,"mouseX",0),O(this,"mouseY",0),O(this,"target"),O(this,"dragCompletedCallbacks",[]),this.target=t}drag(t){this.dragMouseDown(t)}dragMouseDown(t){t.preventDefault();const e=this;this.mouseX=t.clientX,this.mouseY=t.clientY,document.onmouseup=()=>e.closeDragElement(),document.onmousemove=t=>{e.elementDrag(t)}}elementDrag(t){t.preventDefault(),this.offX=this.mouseX-t.clientX,this.offY=this.mouseY-t.clientY,this.mouseX=t.clientX,this.mouseY=t.clientY,this.updateWindowPosition()}updateWindowPosition(){this.target.style.top=this.target.offsetTop-this.offY+"px",this.target.style.left=this.target.offsetLeft-this.offX+"px"}get targetX(){return parseFloat(this.target.style.left)}set targetX(t){this.target.style.left=t+"px"}get targetY(){return parseFloat(this.target.style.top)}set targetY(t){this.target.style.top=t+"px"}closeDragElement(){document.onmouseup=null,document.onmousemove=null,this.dragCompletedCallbacks.forEach(t=>t())}onDragCompleted(t){this.dragCompletedCallbacks.push(t)}}class ve{constructor(){}static getAssetUrl(t){return chrome.runtime.getURL(t)}}class yt{constructor(t){O(this,"name"),O(this,"isSelected",!1),this.name=t}}class we{constructor(t){O(this,"realData"),this.data=t}set data(t){this.realData=t}get data(){return this.realData}}const Tt=document.querySelector("meta[name='csrf-token']"),ke=Tt?Tt.getAttribute("data-token"):"COULD_NOT_EXTRACT_TOKEN";let nt=new we(ke);async function ft(t,e){e=await fetch(t,{method:"POST",headers:new Headers({"Content-Type":"application/json","x-csrf-token":nt.data}),credentials:"include",body:e?JSON.stringify(e):null});return 403===e.status?(nt.data=e.headers.get("x-csrf-token"),await fetch(t,{method:"GET",headers:new Headers({"Content-Type":"application/json","x-csrf-token":nt.data}),credentials:"include"})):e}async function rt(t){var e=await fetch(t,{method:"GET",headers:new Headers({"Content-Type":"application/json","x-csrf-token":nt.data}),credentials:"include"});return 403===e.status?(nt.data=e.headers.get("x-csrf-token"),await fetch(t,{method:"GET",headers:new Headers({"Content-Type":"application/json","x-csrf-token":nt.data}),credentials:"include"})):e}class Ct{constructor(){O(this,"id"),O(this,"name"),O(this,"displayName")}static async getCurrentUser(){var t=await(await rt("https://users.roblox.com/v1/users/authenticated")).json(),e=new Ct;return e.id=t.id,e.name=t.name,e.displayName=t.displayName,e}}class z{constructor(){O(this,"id"),O(this,"thumbnailUrl"),O(this,"data"),O(this,"menuOpen",!1)}async wear(){this.id||console.error("Cannot wear an outfit without an outfit id!"),await ft(`https://avatar.roblox.com/v1/outfits/${this.id}/wear`)}async update(){this.id||console.error("Cannot update outfit without an outfit id!"),this.data||console.error("Cannot update outfit without data!"),await ft(`https://avatar.roblox.com/v1/outfits/${this.id}/update`,this.data)}async create(){this.data||console.error("Cannot create an outfit without data!"),await ft("https://avatar.roblox.com/v1/outfits/create",this.data)}async delete(){this.id||console.error("Cannot delete outfit without an outfit id!"),await ft(`https://avatar.roblox.com/v1/outfits/${this.id}/delete`),this.data=null}static async getOutfitsList(t){t=await(await rt(`https://avatar.roblox.com/v1/users/${t}/outfits?page=1&itemsPerPage=100&isEditable=true`)).json();return console.log(t),t.data}static async getOutfitByName(t,e){var t=await z.getOutfitsList(t),t=(console.log(t),t.find(t=>t.name===e)),n=new z;return n.id=t.id,n}static async getOutfit(t){var t=(await rt(`https://avatar.roblox.com/v1/outfits/${t}/details`)).json(),e=new z;return e.id=t.id,e.data={assetIds:t.assets.map(t=>t.id),bodyColors:t.bodyColors,name:t.name,outfitType:t.outfitType,playerAvatarType:t.playerAvatarType,scale:t.scale},e}static async getOutfitFromAvatar(){var t=await(await rt("https://avatar.roblox.com/v1/avatar")).json(),e=new z;return e.data={name:"TEMPLATE",bodyColors:t.bodyColors,assetIds:t.assets.map(t=>t.id),scale:t.scales,playerAvatarType:t.playerAvatarType,outfitType:"Avatar"},e}}class St{constructor(){}static async getAvatarBodyShot(t){return(await(await rt("https://thumbnails.roblox.com/v1/users/avatar?"+new URLSearchParams({userIds:t.userId.toString(),size:t.size,format:t.format,isCircular:t.isCircular?"true":"false"}).toString())).json()).data[0].imageUrl}}function Nt(t){let n,a;return{c(){n=gt("title"),a=lt(t[0])},m(t,e){L(t,n,e),g(n,a)},p(t,e){1&e&&xt(a,t[0])},d(t){t&&E(n)}}}function $e(t){let n,a,r,o=t[0]&&Nt(t);const s=t[3].default,i=le(s,t,t[2],null);return{c(){n=gt("svg"),o&&o.c(),a=qt(),i&&i.c(),f(n,"xmlns","http://www.w3.org/2000/svg"),f(n,"viewBox",t[1]),f(n,"class","a1")},m(t,e){L(t,n,e),o&&o.m(n,null),g(n,a),i&&i.m(n,null),r=!0},p(t,[e]){t[0]?o?o.p(t,e):((o=Nt(t)).c(),o.m(n,a)):o&&(o.d(1),o=null),i&&i.p&&(!r||4&e)&&ue(i,s,t,t[2],r?ce(s,t[2],e,null):fe(t[2]),null),(!r||2&e)&&f(n,"viewBox",t[1])},i(t){r||(S(i,t),r=!0)},o(t){Y(i,t),r=!1},d(t){t&&E(n),o&&o.d(),i&&i.d(t)}}}function xe(t,e,n){let{$$slots:a={},$$scope:r}=e,{title:o=null}=e,s=e["viewBox"];return t.$$set=t=>{"title"in t&&n(0,o=t.title),"viewBox"in t&&n(1,s=t.viewBox),"$$scope"in t&&n(2,r=t.$$scope)},[o,s,r,a]}class te extends K{constructor(t){super(),G(this,t,xe,$e,V,{title:0,viewBox:1})}}function Ce(t){let n;return{c(){f(n=gt("path"),"d","M14 8.77v-1.6l-1.94-.64-.45-1.09.88-1.84-1.13-1.13-1.81.91-1.09-.45-.69-1.92h-1.6l-.63 1.94-1.11.45-1.84-.88-1.13 1.13.91 1.81-.45 1.09L0 7.23v1.59l1.94.64.45 1.09-.88 1.84 1.13 1.13 1.81-.91 1.09.45.69 1.92h1.59l.63-1.94 1.11-.45 1.84.88 1.13-1.13-.92-1.81.47-1.09L14 8.75v.02zM7 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z")},m(t,e){L(t,n,e)},p:P,d(t){t&&E(n)}}}function Oe(t){let a,n;const r=[{viewBox:"0 0 14 16"},t[0]];let e={$$slots:{default:[Ce]},$$scope:{ctx:t}};for(let t=0;t<r.length;t+=1)e=Q(e,r[t]);return a=new te({props:e}),{c(){F(a.$$.fragment)},m(t,e){X(a,t,e),n=!0},p(t,[e]){var n=1&e?Qt(r,[r[0],Zt(t[0])]):{};2&e&&(n.$$scope={dirty:e,ctx:t}),a.$set(n)},i(t){n||(S(a.$$.fragment,t),n=!0)},o(t){Y(a.$$.fragment,t),n=!1},d(t){H(a,t)}}}function Ee(t,e,n){return t.$$set=t=>{n(0,e=Q(Q({},e),ht(t)))},[e=ht(e)]}class Le extends K{constructor(t){super(),G(this,t,Ee,Oe,V,{})}}class Ae{constructor(t,e){O(this,"key"),O(this,"defaultValue"),this.key=t,this.defaultValue=e}async save(t){var e={};e[this.key]=t,await chrome.storage.local.set(e)}async load(){return(await chrome.storage.local.get([this.key]))[this.key]||this.defaultValue}}function Ut(t,e,n){t=t.slice(),t[19]=e[n],e=t[19].data?t[19].data.name:"Unknown";return t[20]=e,t}function Dt(n){let a,r,o,s,i,l,c,u,d,m,p,h,y,v,$,w,x=n[20]+"",k,O,C,A,P,I,_,U,N,z;function D(){return n[9](n[19])}function j(){return n[10](n[19])}function V(){return n[11](n[19])}function M(){return n[12](n[19])}function G(){return n[13](n[19])}return I=new Le({}),{c(){a=b("div"),r=b("div"),o=b("img"),l=B(),c=b("div"),(u=b("div")).textContent="Update",d=B(),(m=b("div")).textContent="Delete",p=B(),(h=b("div")).textContent="Cancel",v=B(),$=b("div"),w=b("div"),k=lt(x),C=B(),A=b("div"),P=b("div"),F(I.$$.fragment),_=B(),f(o,"class","icon a2"),f(o,"alt",s="Bodyshot of "+n[20]),bt(o.src,i=n[19].thumbnailUrl||"#")||f(o,"src",i),f(u,"class","option a2"),f(m,"class","option a2"),f(h,"class","option a2"),f(c,"class","options a2"),f(c,"style",y=`display: ${n[19].menuOpen?"flex":"none"};`),f(r,"class","preview a2"),f(w,"class","name a2"),f(w,"title",O=n[20]),f(P,"class","edit a2"),f(A,"class","actions a2"),f($,"class","caption a2"),f(a,"class","outfit a2")},m(t,e){L(t,a,e),g(a,r),g(r,o),g(r,l),g(r,c),g(c,u),g(c,d),g(c,m),g(c,p),g(c,h),g(a,v),g(a,$),g($,w),g(w,k),g($,C),g($,A),g(A,P),X(I,P,null),g(a,_),U=!0,N||(z=[T(o,"click",D),T(o,"keydown",Te),T(u,"click",j),T(u,"keydown",Se),T(m,"click",V),T(m,"keydown",Ne),T(h,"click",M),T(h,"keydown",Ue),T(P,"click",G),T(P,"keydown",De)],N=!0)},p(t,e){n=t,(!U||2&e&&s!==(s="Bodyshot of "+n[20]))&&f(o,"alt",s),(!U||2&e&&!bt(o.src,i=n[19].thumbnailUrl||"#"))&&f(o,"src",i),(!U||2&e&&y!==(y=`display: ${n[19].menuOpen?"flex":"none"};`))&&f(c,"style",y),(!U||2&e)&&x!==(x=n[20]+"")&&xt(k,x),(!U||2&e&&O!==(O=n[20]))&&f(w,"title",O)},i(t){U||(S(I.$$.fragment,t),U=!0)},o(t){Y(I.$$.fragment,t),U=!1},d(t){t&&E(a),H(I),N=!1,q(z)}}}function Be(n){let a,r,o,s,i,l,c,u,d,m,p,h=n[1],y=[];for(let t=0;t<h.length;t+=1)y[t]=Dt(Ut(n,h,t));return{c(){(a=b("div")).textContent="You must have at least one free spot in your outfits in order for this program to work!",r=B(),o=b("div"),s=b("input"),i=B(),(l=b("button")).textContent="Create",c=B(),u=b("div");for(let t=0;t<y.length;t+=1)y[t].c();f(a,"class","info a2"),f(s,"class","textfield a2"),f(s,"type","text"),f(s,"placeholder","Name of your custome"),f(l,"class","button a2"),f(o,"class","controls a2"),f(u,"class","outfits a2")},m(t,e){L(t,a,e),L(t,r,e),L(t,o,e),g(o,s),Lt(s,n[0]),g(o,i),g(o,l),L(t,c,e),L(t,u,e);for(let t=0;t<y.length;t+=1)y[t].m(u,null);d=!0,m||(p=[T(s,"input",n[8]),T(l,"click",n[2])],m=!0)},p(e,[n]){if(1&n&&s.value!==e[0]&&Lt(s,e[0]),122&n){h=e[1];let t;for(t=0;t<h.length;t+=1){var a=Ut(e,h,t);y[t]?(y[t].p(a,n),S(y[t],1)):(y[t]=Dt(a),y[t].c(),S(y[t],1),y[t].m(u,null))}for(Wt(),t=h.length;t<y.length;t+=1)(t=>Y(y[t],1,1,()=>{y[t]=null}))(t);Jt()}},i(t){if(!d){for(let t=0;t<h.length;t+=1)S(y[t]);d=!0}},o(t){y=y.filter(Boolean);for(let t=0;t<y.length;t+=1)Y(y[t]);d=!1},d(t){t&&E(a),t&&E(r),t&&E(o),t&&E(c),t&&E(u),Ft(y,t),m=!1,q(p)}}}const Te=()=>{},Se=()=>{},Ne=()=>{},Ue=()=>{},De=()=>{};function Me(t,e,a){let r=[],n="",o,s=!1,i=[];const l=new Ae("outfit-list",[]);async function c(t){var e=t.data.name,n=(t.data.name="TEMPORARY",await t.create(),await z.getOutfitByName(o.id,"TEMPORARY"));await n.wear(),await n.delete(),t.data.name=e,window.location.reload()}function u(t){t.menuOpen=!t.menuOpen,a(7,r)}function f(t){u(t);t=r.indexOf(t);-1!==t&&(r.splice(t,1),a(7,r))}async function d(t){u(t);var e=await z.getOutfitFromAvatar(),n=(e.thumbnailUrl=await St.getAvatarBodyShot({format:"Png",isCircular:!1,size:"100x100",userId:o.id}),t.data.name);t.thumbnailUrl=e.thumbnailUrl,t.data=e.data,t.data.name=n,a(7,r)}Gt(async()=>{o=await Ct.getCurrentUser(),async function(){let t=await l.load();var e=(await chrome.storage.sync.get(["outfit-list"]))["outfit-list"];e&&(await chrome.storage.sync.remove("outfit-list"),t=e),a(7,r=t.map(t=>{var e=new z;return e.thumbnailUrl=t.thumbnailUrl,e.data=t.data,e})),s=!0}()});return t.$$.update=()=>{129&t.$$.dirty&&(n||r)&&(""===n.trim()?a(1,i=r):a(1,i=r.filter(t=>{var e;return!!t.data&&(t=t.data.name.toLowerCase(),e=n.toLowerCase(),t.includes(e))}))),128&t.$$.dirty&&r&&async function(){var t;s&&(t=r.map(t=>({data:t.data,thumbnailUrl:t.thumbnailUrl})),await l.save(t))}()},[n,i,async function(){var t=await z.getOutfitFromAvatar();t.data.name=""===n.trim()?"New outfit":n,a(0,n=""),t.thumbnailUrl=await St.getAvatarBodyShot({format:"Png",isCircular:!1,size:"100x100",userId:o.id}),r.push(t),a(7,r)},c,u,f,d,r,function(){n=this.value,a(0,n)},t=>c(t),t=>d(t),t=>f(t),t=>u(t),t=>u(t)]}class Ie extends K{constructor(t){super(),G(this,t,Me,Be,V,{})}}function Pe(n){let a,r,o,s,i,l;return{c(){a=b("label"),r=b("input"),o=B(),s=b("span"),f(r,"type","checkbox"),f(r,"class","a5"),f(s,"class","slider a5"),f(a,"class","switch a5")},m(t,e){L(t,a,e),g(a,r),r.checked=n[0],g(a,o),g(a,s),i||(l=T(r,"change",n[1]),i=!0)},p(t,[e]){1&e&&(r.checked=t[0])},i:P,o:P,d(t){t&&E(a),i=!1,l()}}}function Ye(t,e,n){let{value:a=!1}=e;const r=he();return t.$$set=t=>{"value"in t&&n(0,a=t.value)},t.$$.update=()=>{1&t.$$.dirty&&r("toggled",a)},[a,function(){a=this.checked,n(0,a)}]}class Mt extends K{constructor(t){super(),G(this,t,Ye,Pe,V,{value:0})}}function I(t,e){document.querySelectorAll(t).forEach(t=>e(t))}class je{constructor(){O(this,"observer"),I("#nav-robux-amount",t=>t.style.filter="blur(8px)"),this.observer=new MutationObserver(t=>{"attributes"===t[0].type&&I("#nav-robux-balance",t=>t.style.filter="blur(8px)")});var t=document.getElementById("navbar-robux").getElementsByTagName("button")[0];this.observer.observe(t,{attributes:!0}),I("[class*='amount icon-robux-container']",t=>t.style.filter="blur(8px)"),I("[class*='balance-label icon-robux-container']",t=>t.style.filter="blur(8px)")}destroy(){this.observer.disconnect(),I("#nav-robux-amount",t=>t.style.filter=""),I("#nav-robux-balance",t=>t.style.filter=""),I("[class*='amount icon-robux-container']",t=>t.style.filter=""),I("[class*='balance-label icon-robux-container']",t=>t.style.filter="")}}const tt=[];function Xe(a,r=P){let o;const s=new Set;function i(t){if(V(a,t)&&(a=t,o)){t=!tt.length;for(const e of s)e[1](),tt.push(e,a);if(t){for(let t=0;t<tt.length;t+=2)tt[t][0](tt[t+1]);tt.length=0}}}return{set:i,update:function(t){i(t(a))},subscribe:function(t,e=P){const n=[t,e];return s.add(n),1===s.size&&(o=r(i)||P),t(a),()=>{s.delete(n),0===s.size&&(o(),o=null)}}}}function Ot(n,t,a){let r=!1;const e=Xe(t);return e.subscribe(async t=>{var e;r&&((e={})[n]=t,await chrome.storage.local.set(e),a)&&a(t)}),chrome.storage.local.get([n]).then(t=>{t=t[n];t&&e.set(t),r=!0,a&&a(t)}),e}let st;const It=Ot("hide-balance",!1,t=>{t?st=st||new je:st&&(st.destroy(),st=null)});class He{constructor(){I("[id*='Skyscraper-Abp']",t=>t.style.visibility="hidden"),I("[id='Leaderboard-Abp']",t=>t.style.visibility="hidden"),I("[class='profile-ads-container'",t=>t.style.display="none")}destroy(){I("[id*='Skyscraper-Abp']",t=>t.style.visibility=""),I("[id='Leaderboard-Abp']",t=>t.style.visibility=""),I("[class='profile-ads-container'",t=>t.style.display="")}}let ot;const Pt=Ot("hide-advertisements",!1,t=>{t?ot=ot||new He:ot&&(ot.destroy(),ot=null)});function Re(e){let n,a,r,o,s,i,l,c,u,d,m,p,h;function t(t){e[2](t)}var y={};function v(t){e[3](t)}void 0!==e[0]&&(y.value=e[0]),s=new Mt({props:y}),pt.push(()=>Bt(s,"value",t));y={};return void 0!==e[1]&&(y.value=e[1]),m=new Mt({props:y}),pt.push(()=>Bt(m,"value",v)),{c(){n=b("div"),a=b("div"),(r=b("div")).textContent="Hide Balance",o=B(),F(s.$$.fragment),l=B(),c=b("div"),(u=b("div")).textContent="Hide Advertisements",d=B(),F(m.$$.fragment),f(r,"class","label"),f(a,"class","option a3"),f(u,"class","label"),f(c,"class","option a3"),f(n,"class","options a3")},m(t,e){L(t,n,e),g(n,a),g(a,r),g(a,o),X(s,a,null),g(n,l),g(n,c),g(c,u),g(c,d),X(m,c,null),h=!0},p(t,[e]){var n={},n=(!i&&1&e&&(i=!0,n.value=t[0],At(()=>i=!1)),s.$set(n),{});!p&&2&e&&(p=!0,n.value=t[1],At(()=>p=!1)),m.$set(n)},i(t){h||(S(s.$$.fragment,t),S(m.$$.fragment,t),h=!0)},o(t){Y(s.$$.fragment,t),Y(m.$$.fragment,t),h=!1},d(t){t&&E(n),H(s),H(m)}}}function ze(t,e,n){let a,r;return vt(t,It,t=>n(0,a=t)),vt(t,Pt,t=>n(1,r=t)),[a,r,function(t){a=t,It.set(a)},function(t){r=t,Pt.set(r)}]}class Fe extends K{constructor(t){super(),G(this,t,ze,Re,V,{})}}function qe(t){let n;return{c(){(n=b("div")).innerHTML=`<div>Made with ❤️ by Daw588.
		Available on <a class="link a4" href="https://github.com/Daw588/rwp" target="_blank" rel="noopener noreferrer">GitHub</a>
		for free.</div> 
	<div>If you would like to support me,
		you can <a class="link a4" href="https://www.roblox.com/game-pass/138589151" target="_blank" rel="noopener noreferrer">donate</a>
		to keep me motivated! Donations go
		towards improving this product by
		putting food on my table :D</div>`,f(n,"class","page a4")},m(t,e){L(t,n,e)},p:P,i:P,o:P,d(t){t&&E(n)}}}class Ve extends K{constructor(t){super(),G(this,t,null,qe,V,{})}}const Yt=Ot("window-location",{x:0,y:0});function Ge(t){let n;return{c(){f(n=gt("path"),"d","M7.48 8l3.75 3.75-1.48 1.48L6 9.48l-3.75 3.75-1.48-1.48L4.52 8 .77 4.25l1.48-1.48L6 6.52l3.75-3.75 1.48 1.48L7.48 8z")},m(t,e){L(t,n,e)},p:P,d(t){t&&E(n)}}}function Ke(t){let a,n;const r=[{viewBox:"0 0 12 16"},t[0]];let e={$$slots:{default:[Ge]},$$scope:{ctx:t}};for(let t=0;t<r.length;t+=1)e=Q(e,r[t]);return a=new te({props:e}),{c(){F(a.$$.fragment)},m(t,e){X(a,t,e),n=!0},p(t,[e]){var n=1&e?Qt(r,[r[0],Zt(t[0])]):{};2&e&&(n.$$scope={dirty:e,ctx:t}),a.$set(n)},i(t){n||(S(a.$$.fragment,t),n=!0)},o(t){Y(a.$$.fragment,t),n=!1},d(t){H(a,t)}}}function We(t,e,n){return t.$$set=t=>{n(0,e=Q(Q({},e),ht(t)))},[e=ht(e)]}class Je extends K{constructor(t){super(),G(this,t,We,Ke,V,{})}}function jt(t,e,n){t=t.slice();return t[9]=e[n],t}function Xt(n){let a,r=n[9].name+"",o,s,i,l;function c(){return n[8](n[9])}return{c(){a=b("div"),o=lt(r),f(a,"class","tab a0"),f(a,"data-isselected",s=n[9].isSelected)},m(t,e){L(t,a,e),g(a,o),i||(l=[T(a,"click",c),T(a,"keydown",nn)],i=!0)},p(t,e){n=t,8&e&&r!==(r=n[9].name+"")&&xt(o,r),8&e&&s!==(s=n[9].isSelected)&&f(a,"data-isselected",s)},d(t){t&&E(a),i=!1,q(l)}}}function Qe(t){let n,a;return n=new Ve({}),{c(){F(n.$$.fragment)},m(t,e){X(n,t,e),a=!0},i(t){a||(S(n.$$.fragment,t),a=!0)},o(t){Y(n.$$.fragment,t),a=!1},d(t){H(n,t)}}}function Ze(t){let n,a;return n=new Fe({}),{c(){F(n.$$.fragment)},m(t,e){X(n,t,e),a=!0},i(t){a||(S(n.$$.fragment,t),a=!0)},o(t){Y(n.$$.fragment,t),a=!1},d(t){H(n,t)}}}function tn(t){let n,a;return n=new Ie({}),{c(){F(n.$$.fragment)},m(t,e){X(n,t,e),a=!0},i(t){a||(S(n.$$.fragment,t),a=!0)},o(t){Y(n.$$.fragment,t),a=!1},d(t){H(n,t)}}}function en(n){let a,r,t,o,s,i,l,c,u,d,m,p,h,y,v,$,w,x,k,O=(d=new Je({}),n[3]),C=[];for(let t=0;t<O.length;t+=1)C[t]=Xt(jt(n,O,t));const A=[tn,Ze,Qe],P=[];function I(t){return"outfits"===t[2]?0:"streamer"===t[2]?1:"about"===t[2]?2:-1}return~(y=I(n))&&(v=P[y]=A[y](n)),{c(){a=b("div"),r=b("img"),o=B(),(s=b("div")).textContent="Vanita",i=B(),l=b("div"),c=B(),u=b("button"),F(d.$$.fragment),m=B(),p=b("div");for(let t=0;t<C.length;t+=1)C[t].c();h=B(),v&&v.c(),$=qt(),f(r,"class","icon a0"),f(r,"draggable",!1),bt(r.src,t=ve.getAssetUrl("logo.png"))||f(r,"src",t),f(r,"alt","Vanita Logo"),f(s,"class","title a0"),f(l,"class","drag a0"),f(u,"class","close a0"),f(a,"class","header a0"),f(p,"class","tabs a0")},m(t,e){L(t,a,e),g(a,r),g(a,o),g(a,s),g(a,i),g(a,l),g(a,c),g(a,u),X(d,u,null),L(t,m,e),L(t,p,e);for(let t=0;t<C.length;t+=1)C[t].m(p,null);L(t,h,e),~y&&P[y].m(t,e),L(t,$,e),w=!0,x||(k=[T(l,"mousedown",n[6]),T(u,"click",n[7])],x=!0)},p(e,[n]){if(24&n){O=e[3];let t;for(t=0;t<O.length;t+=1){var a=jt(e,O,t);C[t]?C[t].p(a,n):(C[t]=Xt(a),C[t].c(),C[t].m(p,null))}for(;t<C.length;t+=1)C[t].d(1);C.length=O.length}let t=y;(y=I(e))!==t&&(v&&(Wt(),Y(P[t],1,1,()=>{P[t]=null}),Jt()),~y?((v=P[y])||(v=P[y]=A[y](e)).c(),S(v,1),v.m($.parentNode,$)):v=null)},i(t){w||(S(d.$$.fragment,t),S(v),w=!0)},o(t){Y(d.$$.fragment,t),Y(v),w=!1},d(t){t&&E(a),H(d),t&&E(m),t&&E(p),Ft(C,t),t&&E(h),~y&&P[y].d(t),t&&E($),x=!1,q(k)}}}const nn=()=>{};function sn(t,e,n){let a;vt(t,Yt,t=>n(5,a=t));let r,o="",s=!1,i=[new yt("outfits"),new yt("streamer"),new yt("about")];function l(t){for(const e of i)e.isSelected=!1;t.isSelected=!0,n(2,o=t.name),n(3,i)}Gt(async()=>{var t=document.getElementById("app");n(0,r=new be(t)),document.getElementById("app-toggle").onclick=()=>{n(1,s=!0)},r.onDragCompleted(()=>{Yt.set({x:r.targetX,y:r.targetY})}),l(i[0])});return t.$$.update=()=>{2&t.$$.dirty&&null!==s&&(document.getElementById("app-toggle").style.display=s?"none":"flex",document.getElementById("app").style.display=s?"flex":"none"),33&t.$$.dirty&&r&&(n(0,r.targetX=a.x,r),n(0,r.targetY=a.y,r))},[r,s,o,i,l,a,t=>r.drag(t),()=>n(1,s=!1),t=>l(t)]}class on extends K{constructor(t){super(),G(this,t,sn,en,V,{})}}new on({target:document.getElementById("app")});})()