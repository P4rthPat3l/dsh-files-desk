window.__ModuleLoader__.load({
  id: "dsh-files-desk",
  factory(require) {
    var module = { exports: {} };
    var exports = module.exports;
    globalThis.__dshFilesDeskRequireAsync = require.async;
var Ft=Object.create;var xe=Object.defineProperty;var Pt=Object.getOwnPropertyDescriptor;var Ct=Object.getOwnPropertyNames;var Et=Object.getPrototypeOf,Rt=Object.prototype.hasOwnProperty;var Tt=(t,e)=>{for(var r in e)xe(t,r,{get:e[r],enumerable:!0})},Ye=(t,e,r,o)=>{if(e&&typeof e=="object"||typeof e=="function")for(let n of Ct(e))!Rt.call(t,n)&&n!==r&&xe(t,n,{get:()=>e[n],enumerable:!(o=Pt(e,n))||o.enumerable});return t};var Ge=(t,e,r)=>(r=t!=null?Ft(Et(t)):{},Ye(e||!t||!t.__esModule?xe(r,"default",{value:t,enumerable:!0}):r,t)),Lt=t=>Ye(xe({},"__esModule",{value:!0}),t);var rr={};Tt(rr,{EditorTab:()=>qe,FilesWorkbench:()=>Ze,apply:()=>tr,inject:()=>Vt});module.exports=Lt(rr);var Nt=Ge(require("react"),1);var Me="dsh-resource://file/session/",Be=null;function Je(t){Be=t.connection}async function S(t,e,r){if(Be===null)throw new Error("The files channel is not ready.");let o=await Be.rpc.call("/files-rpc",t,e,r);if(!o.ok){let n=new Error(o.error.message);throw n.code=o.error.code,n.details=o.error.details,n}return o.value}function O(t){return t.replace(/\\/g,"/")}function de(t){return t.startsWith("/")||/^[A-Za-z]:\//.test(O(t))||O(t).startsWith("//")}function I(t){let e=O(t).replace(/\/+$/,""),r=e.lastIndexOf("/");return r<0?e:e.slice(r+1)}function ne(t){let e=O(t).replace(/\/+$/,""),r=e.lastIndexOf("/");return r<0?"":r===0?"/":e.slice(0,r)}function H(t,e){let r=O(t).replace(/\/+$/,"");return r===""?e:`${r}/${e}`}function Ie(t){let e=O(t).replace(/\/+$/,"");return e===""?"/":e}function pe(t,e){let r=Ie(t),o=O(e);return o===r||o.startsWith(`${r}/`)}function jt(t){return O(t).replace(/^(?:\.\/)+/,"").split("/").map(e=>encodeURIComponent(e)).join("/")}function ke(t,e){return`${Me}${encodeURIComponent(t)}/${jt(e)}`}function We(t,e,r){let o=O(r);if(!de(o))return ke(t,o);let n=e==null?"":Ie(e);return n!==""&&o===n?ke(t,""):n!==""&&o.startsWith(`${n}/`)?ke(t,o.slice(n.length+1)):ke(t,o)}function se(t){if(typeof t!="string"||!t.startsWith(Me))return;let e=t.slice(Me.length),r=e.indexOf("/");if(!(r<=0))try{let o=decodeURIComponent(e.slice(0,r)),n=e.slice(r+1),u=n===""?"":n.split("/").map(c=>decodeURIComponent(c)).join("/");return{sessionId:o,path:u}}catch{return}}var Ot={ts:"typescript",mts:"typescript",cts:"typescript",tsx:"tsx",js:"javascript",mjs:"javascript",cjs:"javascript",jsx:"jsx",json:"json",jsonc:"json",json5:"json",md:"markdown",markdown:"markdown",mdx:"markdown",css:"css",scss:"css",less:"css",html:"html",htm:"html",vue:"html",svelte:"html",py:"python",pyw:"python",yml:"yaml",yaml:"yaml",xml:"xml",svg:"xml",xsd:"xml",sql:"sql",java:"java",c:"cpp",h:"cpp",cc:"cpp",cpp:"cpp",cxx:"cpp",hpp:"cpp",rs:"rust",go:"go",php:"php"};function ie(t){let e=I(t).toLowerCase();if(e==="dockerfile"||e==="makefile"||e==="procfile")return"text";let r=e.lastIndexOf(".");return r<0?"text":Ot[e.slice(r+1)]??"text"}var zt=new Set(["png","jpg","jpeg","gif","webp","bmp","ico","icns","avif","tif","tiff","psd","heic","pdf","doc","docx","xls","xlsx","ppt","pptx","odt","ods","odp","rtf","epub","zip","gz","tgz","tar","bz2","xz","7z","rar","jar","war","exe","dll","so","dylib","bin","dat","wasm","class","pyc","o","a","lib","obj","woff","woff2","ttf","otf","eot","mp3","wav","flac","ogg","oga","m4a","mp4","mov","avi","mkv","webm","m4v","wmv","sqlite","sqlite3","db","mdb","ttc","icns"]);function ue(t){let e=I(t).toLowerCase(),r=e.lastIndexOf(".");return r<0?!1:zt.has(e.slice(r+1))}function Qe(t){let e=se(t);return e===void 0?!1:e.path!==""&&!ue(e.path)}function _(t){switch(t){case"files/outside-workspace":return"error.outside";case"files/not-found":return"error.notFound";case"files/exists":return"error.exists";case"files/binary":return"error.binary";case"files/too-large":return"error.tooLarge";case"files/not-utf8":return"error.notUtf8";case"files/symlink":return"error.symlink";case"files/name":return"error.name";default:return"error.generic"}}var et={panel:"Files","guide.title":"Files and editor","guide.description":"Browse, edit, and manage workspace files.","panel.title":"Files","action.newFile":"New file","action.newFolder":"New folder","action.refresh":"Refresh","action.save":"Save","action.preview":"Preview","action.reveal":"Reveal in Files","action.close":"Close","action.cancel":"Cancel","action.create":"Create","action.reload":"Reload","action.overwrite":"Overwrite","action.retry":"Retry","empty.select":"Select a file","empty.selectHint":"Pick a file in the tree. It opens here for editing.","empty.noRoot":"No workspace folder","empty.noRootHint":"Open a session that has a workspace to browse its files.","empty.loading":"Reading the file...","status.saved":"Saved","status.saving":"Saving...","status.unsaved":"Unsaved","status.conflict":"Changed on disk","status.readOnly":"Read only","status.error":"Save failed","status.lf":"LF","status.crlf":"CRLF","status.spaces":"Spaces: {count}","status.encoding":"UTF-8","action.wrap":"Wrap","dialog.newFile":"New file","dialog.newFileLabel":"File name","dialog.newFolder":"New folder","dialog.newFolderLabel":"Folder name","dialog.rename":"Rename","dialog.renameLabel":"New name","dialog.delete":"Delete","dialog.deleteFile":'Delete "{name}"? This cannot be undone.',"dialog.deleteFolder":'Delete "{name}" and everything inside it? This cannot be undone.',"dialog.pasteExists":'"{name}" already exists in that folder.',"conflict.title":"This file changed on disk.","conflict.body":"Reload to see the new content, or overwrite it with what you have here.","error.outside":"That path is outside the workspace.","error.notFound":"The file no longer exists.","error.exists":"That name already exists.","error.binary":"Binary files cannot be edited here.","error.tooLarge":"The file is too large to edit here.","error.notUtf8":"The file is not UTF-8 text.","error.symlink":"Symlinks are not edited here.","error.name":"Enter a name without a path separator.","error.generic":"The file operation failed.","error.surface":"The files view could not render.","error.surfaceHint":"Reload the page to try again. Nothing on disk was changed.","tree.loading":"Loading...","tree.failed":"Could not load this folder.","tree.truncated":"Too many entries, showing some of them.","tree.unavailable":"The file tree is unavailable.","tree.empty":"This folder is empty.","menu.openInEditor":"Open in editor","menu.preview":"Preview","menu.reveal":"Reveal in Files","menu.newFileHere":"New file here","menu.newFolderHere":"New folder here","menu.rename":"Rename","menu.duplicate":"Duplicate","menu.cut":"Cut","menu.copy":"Copy","menu.paste":"Paste","menu.copyPath":"Copy path","menu.delete":"Delete","toast.copied":"Copied {name}","toast.cut":"Cut {name}","toast.pasted":"Pasted {name}","toast.copiedPath":"Path copied","toast.saved":"Saved","title.files":"Files","tab.close":"Close {name}","dialog.ok":"OK"},tt={panel:"\u6587\u4EF6","guide.title":"\u6587\u4EF6\u4E0E\u7F16\u8F91\u5668","guide.description":"\u6D4F\u89C8\u3001\u7F16\u8F91\u548C\u7BA1\u7406\u5DE5\u4F5C\u533A\u6587\u4EF6\u3002","panel.title":"\u6587\u4EF6","action.newFile":"\u65B0\u5EFA\u6587\u4EF6","action.newFolder":"\u65B0\u5EFA\u6587\u4EF6\u5939","action.refresh":"\u5237\u65B0","action.save":"\u4FDD\u5B58","action.preview":"\u9884\u89C8","action.reveal":"\u5728\u6587\u4EF6\u4E2D\u663E\u793A","action.close":"\u5173\u95ED","action.cancel":"\u53D6\u6D88","action.create":"\u521B\u5EFA","action.reload":"\u91CD\u65B0\u52A0\u8F7D","action.overwrite":"\u8986\u76D6","action.retry":"\u91CD\u8BD5","empty.select":"\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6","empty.selectHint":"\u5728\u6587\u4EF6\u6811\u4E2D\u9009\u62E9\u6587\u4EF6\u540E\uFF0C\u4F1A\u5728\u8FD9\u91CC\u6253\u5F00\u5E76\u7F16\u8F91\u3002","empty.noRoot":"\u6CA1\u6709\u5DE5\u4F5C\u533A\u6587\u4EF6\u5939","empty.noRootHint":"\u6253\u5F00\u4E00\u4E2A\u6709\u5DE5\u4F5C\u533A\u7684\u4F1A\u8BDD\u5373\u53EF\u6D4F\u89C8\u6587\u4EF6\u3002","empty.loading":"\u6B63\u5728\u8BFB\u53D6\u6587\u4EF6...","status.saved":"\u5DF2\u4FDD\u5B58","status.saving":"\u4FDD\u5B58\u4E2D...","status.unsaved":"\u672A\u4FDD\u5B58","status.conflict":"\u78C1\u76D8\u5185\u5BB9\u5DF2\u53D8\u5316","status.readOnly":"\u53EA\u8BFB","status.error":"\u4FDD\u5B58\u5931\u8D25","status.lf":"LF","status.crlf":"CRLF","status.spaces":"\u7A7A\u683C\uFF1A{count}","status.encoding":"UTF-8","action.wrap":"\u81EA\u52A8\u6362\u884C","dialog.newFile":"\u65B0\u5EFA\u6587\u4EF6","dialog.newFileLabel":"\u6587\u4EF6\u540D","dialog.newFolder":"\u65B0\u5EFA\u6587\u4EF6\u5939","dialog.newFolderLabel":"\u6587\u4EF6\u5939\u540D\u79F0","dialog.rename":"\u91CD\u547D\u540D","dialog.renameLabel":"\u65B0\u540D\u79F0","dialog.delete":"\u5220\u9664","dialog.deleteFile":"\u5220\u9664\u201C{name}\u201D\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002","dialog.deleteFolder":"\u5220\u9664\u201C{name}\u201D\u53CA\u5176\u4E2D\u6240\u6709\u5185\u5BB9\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002","dialog.pasteExists":"\u8BE5\u6587\u4EF6\u5939\u4E2D\u5DF2\u5B58\u5728\u201C{name}\u201D\u3002","conflict.title":"\u6B64\u6587\u4EF6\u5DF2\u5728\u78C1\u76D8\u4E0A\u53D1\u751F\u53D8\u5316\u3002","conflict.body":"\u91CD\u65B0\u52A0\u8F7D\u53EF\u67E5\u770B\u65B0\u5185\u5BB9\uFF0C\u6216\u4F7F\u7528\u5F53\u524D\u5185\u5BB9\u8986\u76D6\u3002","error.outside":"\u8BE5\u8DEF\u5F84\u4E0D\u5728\u5DE5\u4F5C\u533A\u5185\u3002","error.notFound":"\u6587\u4EF6\u5DF2\u4E0D\u5B58\u5728\u3002","error.exists":"\u8BE5\u540D\u79F0\u5DF2\u5B58\u5728\u3002","error.binary":"\u65E0\u6CD5\u5728\u6B64\u7F16\u8F91\u4E8C\u8FDB\u5236\u6587\u4EF6\u3002","error.tooLarge":"\u6587\u4EF6\u8FC7\u5927\uFF0C\u65E0\u6CD5\u5728\u6B64\u7F16\u8F91\u3002","error.notUtf8":"\u8BE5\u6587\u4EF6\u4E0D\u662F UTF-8 \u6587\u672C\u3002","error.symlink":"\u65E0\u6CD5\u5728\u6B64\u7F16\u8F91\u7B26\u53F7\u94FE\u63A5\u3002","error.name":"\u8BF7\u8F93\u5165\u4E0D\u542B\u8DEF\u5F84\u5206\u9694\u7B26\u7684\u540D\u79F0\u3002","error.generic":"\u6587\u4EF6\u64CD\u4F5C\u5931\u8D25\u3002","error.surface":"\u6587\u4EF6\u89C6\u56FE\u65E0\u6CD5\u6E32\u67D3\u3002","error.surfaceHint":"\u91CD\u65B0\u52A0\u8F7D\u9875\u9762\u5373\u53EF\u91CD\u8BD5\u3002\u78C1\u76D8\u4E0A\u7684\u6587\u4EF6\u6CA1\u6709\u53D8\u5316\u3002","tree.loading":"\u52A0\u8F7D\u4E2D...","tree.failed":"\u65E0\u6CD5\u52A0\u8F7D\u6B64\u6587\u4EF6\u5939\u3002","tree.truncated":"\u6761\u76EE\u8FC7\u591A\uFF0C\u4EC5\u663E\u793A\u4E00\u90E8\u5206\u3002","tree.unavailable":"\u6587\u4EF6\u6811\u4E0D\u53EF\u7528\u3002","tree.empty":"\u6B64\u6587\u4EF6\u5939\u4E3A\u7A7A\u3002","menu.openInEditor":"\u5728\u7F16\u8F91\u5668\u4E2D\u6253\u5F00","menu.preview":"\u9884\u89C8","menu.reveal":"\u5728\u6587\u4EF6\u4E2D\u663E\u793A","menu.newFileHere":"\u5728\u6B64\u65B0\u5EFA\u6587\u4EF6","menu.newFolderHere":"\u5728\u6B64\u65B0\u5EFA\u6587\u4EF6\u5939","menu.rename":"\u91CD\u547D\u540D","menu.duplicate":"\u521B\u5EFA\u526F\u672C","menu.cut":"\u526A\u5207","menu.copy":"\u590D\u5236","menu.paste":"\u7C98\u8D34","menu.copyPath":"\u590D\u5236\u8DEF\u5F84","menu.delete":"\u5220\u9664","toast.copied":"\u5DF2\u590D\u5236 {name}","toast.cut":"\u5DF2\u526A\u5207 {name}","toast.pasted":"\u5DF2\u7C98\u8D34 {name}","toast.copiedPath":"\u5DF2\u590D\u5236\u8DEF\u5F84","toast.saved":"\u5DF2\u4FDD\u5B58","title.files":"\u6587\u4EF6","tab.close":"\u5173\u95ED {name}","dialog.ok":"\u786E\u5B9A"},$e=null;function rt(t){$e=t}function d(t,e){return $e===null?t:$e(t,e)}var st="dsh-files.preferences.v1";function Mt(){let t={wrap:!1,autoSave:!0};try{if(typeof localStorage>"u")return t;let e=localStorage.getItem(st);if(e===null)return t;let r=JSON.parse(e);return{wrap:r?.wrap===!0,autoSave:r?.autoSave!==!1}}catch{return t}}function ot(t){try{typeof localStorage<"u"&&localStorage.setItem(st,JSON.stringify(t))}catch{}}var nt=new Map;function it(t){let e=nt.get(t);return e===void 0&&(e=new Ae,nt.set(t,e)),e}var z=new Map,D={path:null,mode:null},Ne={prompt:null,confirm:null,toast:null},De=new Set,Z={subscribe(t){return De.add(t),()=>{De.delete(t)}},getSnapshot(){return Ne},patch(t){Ne={...Ne,...t};for(let e of De)e()}};function Se(t){return new Promise(e=>{Z.patch({prompt:{...t,resolve:e}})})}function lt(t){return new Promise(e=>{Z.patch({confirm:{...t,resolve:e}})})}var at=0;function U(t,e="info"){at+=1;let r=at;Z.patch({toast:{text:t,tone:e,token:r}}),setTimeout(()=>{Ne.toast?.token===r&&Z.patch({toast:null})},2600)}var Ae=class{constructor(){let e=Mt();this.listeners=new Set,this.state={sessionId:null,workspaceId:null,root:null,levels:{},expanded:[],buffers:[],activePath:null,treeWidth:260,wrap:e.wrap,autoSave:e.autoSave}}subscribe=e=>(this.listeners.add(e),()=>{this.listeners.delete(e)});getSnapshot=()=>this.state;emit(){for(let e of this.listeners)e()}patch(e){this.state={...this.state,...e},this.emit()}init(e,r,o){let n=Ie(o);this.state.sessionId===e&&this.state.root===n&&this.state.workspaceId===r||(this.state={...this.state,sessionId:e,workspaceId:r,root:n,levels:{},expanded:[n],buffers:[],activePath:null},this.emit(),this.loadLevel(n))}async loadLevel(e){let r=this.state.levels[e];if(r?.status!=="loading"){this.setLevel(e,{status:"loading",entries:r?.entries??[]});try{let o=await S("list",{workspaceId:this.state.workspaceId,path:e});this.setLevel(e,{status:"ready",entries:o.entries,truncated:o.truncated})}catch(o){this.setLevel(e,{status:"failed",entries:r?.entries??[],error:{code:o.code,message:o.message}})}}}setLevel(e,r){this.patch({levels:{...this.state.levels,[e]:r}})}toggle(e,r){let o=new Set(this.state.expanded);r?o.add(e):o.delete(e),this.patch({expanded:[...o]}),r&&this.loadLevel(e)}refresh(){let e=new Set([this.state.root,...this.state.expanded]);for(let r of e)typeof r=="string"&&r!==""&&this.loadLevel(r)}refreshPath(e){typeof e=="string"&&e!==""&&this.loadLevel(e)}buffer(e){return this.state.buffers.find(r=>r.path===e)}async openFile(e,r={}){let o=this.buffer(e);if(o!==void 0)return this.patch({activePath:e}),o;let n=r;if(typeof r.text!="string"){let c=await S("read",{workspaceId:this.state.workspaceId,path:e});n={text:c.text,version:c.version,eol:c.eol,bom:c.bom}}let u={path:e,text:n.text,version:n.version,eol:n.eol==="crlf"?"crlf":"lf",bom:n.bom===!0,status:"clean",error:null,readOnly:r.readOnly===!0||!pe(this.state.root,e)};return this.patch({buffers:[...this.state.buffers,u],activePath:e}),u}updateBuffer(e,r){let o=this.state.buffers.map(n=>n.path===e?{...n,...r}:n);this.patch({buffers:o})}setBufferText(e,r){let o=this.buffer(e);o!==void 0&&(o.text=r)}setBufferStatus(e,r,o=null){this.updateBuffer(e,{status:r,error:o})}setActive(e){this.patch({activePath:e})}closeBuffer(e){let r=this.state.buffers.filter(n=>n.path!==e),o=this.state.activePath;o===e&&(o=r.length>0?r[r.length-1].path:null),this.patch({buffers:r,activePath:o})}renameBuffers(e,r){let o=this.state.buffers.map(c=>c.path===e?{...c,path:r}:c.path.startsWith(`${e}/`)?{...c,path:r+c.path.slice(e.length)}:c),n=this.state.activePath,u=n===e?r:n!==null&&n.startsWith(`${e}/`)?r+n.slice(e.length):n;this.patch({buffers:o,activePath:u})}closeBuffersUnder(e){let r=this.state.buffers.filter(n=>n.path!==e&&!n.path.startsWith(`${e}/`)),o=r.some(n=>n.path===this.state.activePath)?this.state.activePath:null;this.patch({buffers:r,activePath:o})}async reveal(e,r={}){let o=this.state.root;if(o===null)return null;let n=de(e)?O(e):H(o,O(e));if(!pe(o,n))return await this.openFile(n,r),n;let u=n.slice(o.length).split("/").filter(w=>w!==""),c=new Set(this.state.expanded);c.add(o),await this.loadLevel(o);let f=o;for(let w=0;w<u.length-1;w+=1)f=H(f,u[w]),c.add(f),await this.loadLevel(f);return this.patch({expanded:[...c]}),await this.openFile(n,r),n}setTreeWidth(e){this.patch({treeWidth:Math.max(180,Math.min(560,Math.round(e)))})}toggleWrap(){let e=!this.state.wrap;return ot({wrap:e,autoSave:this.state.autoSave}),this.patch({wrap:e}),e}toggleAutoSave(){let e=!this.state.autoSave;return ot({wrap:this.state.wrap,autoSave:e}),this.patch({autoSave:e}),e}};function ct(t){switch(t){case"saving":return d("status.saving");case"saved":return d("status.saved");case"conflict":return d("status.conflict");case"error":return d("status.error");case"dirty":return d("status.unsaved");default:return""}}var le={sidebarRight:null};var Bt="text";function fe(t){U(d(_(t?.code)),"error")}function He(t){if(t.includes("/")||t.includes("\\")||t==="."||t===".."){let e=new Error("A name without path separators is required.");throw e.code="files/name",e}}function dt(t,e,r){let o=z.get(t)?.root,n=typeof r=="number"&&r>0?{line:r}:{};le.sidebarRight?.openResource(We(t,o??void 0,e),{params:n})}function G(t,e,r){let o=z.get(t)?.root,n=typeof r=="number"&&r>0?{line:r}:{};le.sidebarRight?.openResource(We(t,o??void 0,e),{kind:Bt,params:n})}function me(t){le.sidebarRight?.openTab("files",{params:{path:t}})}async function Fe(t){try{await navigator.clipboard.writeText(t),U(d("toast.copiedPath"))}catch(e){fe(e)}}async function Pe(t,e){let r=z.get(t);r!==void 0&&await Se({title:d("dialog.newFile"),label:d("dialog.newFileLabel"),initial:"",confirmLabel:d("action.create"),submit:async o=>{He(o);let n=H(e,o);await S("create",{workspaceId:r.workspaceId,path:n,kind:"file"}),r.store?.refreshPath(e),r.store!==void 0&&r.store.reveal(n).catch(fe)}})}async function Ce(t,e){let r=z.get(t);r!==void 0&&await Se({title:d("dialog.newFolder"),label:d("dialog.newFolderLabel"),initial:"",confirmLabel:d("action.create"),submit:async o=>{He(o),await S("create",{workspaceId:r.workspaceId,path:H(e,o),kind:"directory"}),r.store?.refreshPath(e)}})}async function _e(t,e){let r=z.get(t);r!==void 0&&await Se({title:d("dialog.rename"),label:d("dialog.renameLabel"),initial:I(e),confirmLabel:d("dialog.rename"),submit:async o=>{He(o);let n=H(ne(e),o);await S("rename",{workspaceId:r.workspaceId,from:e,to:n}),r.store?.renameBuffers(e,n),r.store?.refreshPath(ne(e))}})}async function pt(t,e){let r=z.get(t);if(r===void 0)return;let o=ne(e),n=I(e),u=n.lastIndexOf("."),c=u>0?n.slice(0,u):n,f=u>0?n.slice(u):"";try{for(let w=1;w<=20;w+=1){let E=H(o,w===1?`${c} copy${f}`:`${c} copy ${w}${f}`);try{await S("copy",{workspaceId:r.workspaceId,from:e,to:E}),r.store?.refreshPath(o);return}catch(p){if(p.code!=="files/exists")throw p}}}catch(w){fe(w)}}function he(t,e,r){D.path=e,D.mode=r,D.sessionId=t,U(d(r==="cut"?"toast.cut":"toast.copied",{name:I(e)}))}async function ut(t,e){let r=z.get(t);if(r===void 0||D.path===null)return;let o=D.path,n=H(e,I(o));try{D.mode==="cut"?(await S("rename",{workspaceId:r.workspaceId,from:o,to:n}),r.store?.renameBuffers(o,n),D.path=null,D.mode=null,D.sessionId=null):await S("copy",{workspaceId:r.workspaceId,from:o,to:n}),r.store?.refreshPath(e),U(d("toast.pasted",{name:I(n)}))}catch(u){fe(u)}}async function Ue(t,e,r){let o=z.get(t);if(o===void 0)return;let n=I(e);if(await lt({title:d("dialog.delete"),message:d(r?"dialog.deleteFolder":"dialog.deleteFile",{name:n}),confirmLabel:d("menu.delete"),danger:!0}))try{await S("delete",{workspaceId:o.workspaceId,path:e}),o.store?.closeBuffersUnder(e),o.store?.refreshPath(ne(e))}catch(c){fe(c)}}function Wt(t){let{sessionId:e,path:r}=t,o=typeof t.line=="number"?t.line:void 0,n=[{id:"open",label:d("menu.openInEditor"),run:()=>dt(e,r,o)},{id:"preview",label:d("menu.preview"),run:()=>G(e,r,o)},{id:"reveal",label:d("menu.reveal"),run:()=>me(r)},{id:"copy-path",label:d("menu.copyPath"),run:()=>void Fe(r)}],u=z.get(e);return u!==void 0&&(n.push({id:"rename",label:d("menu.rename"),run:()=>void _e(e,r)},{id:"duplicate",label:d("menu.duplicate"),run:()=>void pt(e,r)},{id:"cut",label:d("menu.cut"),run:()=>he(e,r,"cut")},{id:"copy",label:d("menu.copy"),run:()=>he(e,r,"copy")}),r!==u.root&&n.push({id:"delete",label:d("menu.delete"),run:()=>void Ue(e,r,!1)})),n}function $t(t){let{sessionId:e,path:r}=t,o=z.get(e),n=[];return o!==void 0&&(n.push({id:"new-file",label:d("menu.newFileHere"),run:()=>void Pe(e,r)},{id:"new-folder",label:d("menu.newFolderHere"),run:()=>void Ce(e,r)},{id:"paste",label:d("menu.paste"),disabled:D.path===null,run:()=>void ut(e,r)}),r!==o.root&&n.push({id:"rename",label:d("menu.rename"),run:()=>void _e(e,r)},{id:"cut",label:d("menu.cut"),run:()=>he(e,r,"cut")},{id:"copy",label:d("menu.copy"),run:()=>he(e,r,"copy")},{id:"delete",label:d("menu.delete"),run:()=>void Ue(e,r,!0)})),n.push({id:"copy-path",label:d("menu.copyPath"),run:()=>void Fe(r)}),n}function Dt(t){return[{id:"reveal",label:d("menu.reveal"),run:()=>me(t.path)},{id:"copy-path",label:d("menu.copyPath"),run:()=>void Fe(t.path)}]}function ft(t){let e=[{target:"file",resolve:Wt},{target:"directory",resolve:$t},{target:"image",resolve:Dt}];for(let r of e)t.effect(()=>t.contextMenus.register({id:`dsh-files-desk/${r.target}`,target:r.target,order:70,resolve:o=>r.resolve(o)}),`dsh-files-desk: ${r.target} menu`)}var q=require("react");var b=require("react/jsx-runtime");function At({t,data:e}){let[r,o]=(0,q.useState)(e.initial??""),[n,u]=(0,q.useState)(null),[c,f]=(0,q.useState)(!1),w=(0,q.useRef)(null);(0,q.useEffect)(()=>{w.current?.focus(),w.current?.select()},[]);let E=l=>{Z.patch({prompt:null}),e.resolve(l)},p=async()=>{let l=r.trim();if(!(l===""||c)){f(!0),u(null);try{await e.submit(l),Z.patch({prompt:null}),e.resolve(l)}catch(L){u(t(_(L?.code))),f(!1)}}};return(0,b.jsx)("div",{className:"fdp-scrim",role:"presentation",onPointerDown:l=>{l.target===l.currentTarget&&!c&&E(null)},children:(0,b.jsxs)("div",{className:"fdp-dialog",role:"dialog","aria-modal":"true","aria-label":e.title,onKeyDown:l=>{l.key==="Escape"&&!c&&E(null)},children:[(0,b.jsx)("div",{className:"fdp-dialog-head",children:e.title}),(0,b.jsxs)("label",{className:"fdp-field",children:[(0,b.jsx)("span",{className:"fdp-field-label",children:e.label}),(0,b.jsx)("input",{ref:w,className:"fdp-input",value:r,spellCheck:!1,onChange:l=>{o(l.target.value),u(null)},onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),p())}})]}),n===null?null:(0,b.jsx)("p",{className:"fdp-field-error",children:n}),(0,b.jsxs)("div",{className:"fdp-dialog-actions",children:[(0,b.jsx)("button",{type:"button",className:"fdp-button",disabled:c,onClick:()=>E(null),children:t("action.cancel")}),(0,b.jsx)("button",{type:"button",className:"fdp-button fdp-button-primary",disabled:c||r.trim()==="",onClick:()=>void p(),children:c?"...":e.confirmLabel})]})]})})}function Ht({t,data:e}){let r=o=>{Z.patch({confirm:null}),e.resolve(o)};return(0,b.jsx)("div",{className:"fdp-scrim",role:"presentation",onPointerDown:o=>{o.target===o.currentTarget&&r(!1)},children:(0,b.jsxs)("div",{className:"fdp-dialog",role:"dialog","aria-modal":"true","aria-label":e.title,onKeyDown:o=>{o.key==="Escape"&&r(!1)},children:[(0,b.jsx)("div",{className:"fdp-dialog-head",children:e.title}),(0,b.jsx)("p",{className:"fdp-dialog-message",children:e.message}),(0,b.jsxs)("div",{className:"fdp-dialog-actions",children:[(0,b.jsx)("button",{type:"button",className:"fdp-button",onClick:()=>r(!1),children:t("action.cancel")}),(0,b.jsx)("button",{type:"button",className:e.danger===!0?"fdp-button fdp-button-danger":"fdp-button fdp-button-primary",onClick:()=>r(!0),children:e.confirmLabel})]})]})})}function mt({t}){let e=(0,q.useSyncExternalStore)(Z.subscribe,Z.getSnapshot),r=e.toast;return e.prompt===null&&e.confirm===null&&r===null?null:(0,b.jsxs)("div",{className:"fdp-overlay-root","data-dsh-files-overlay":"",children:[e.prompt===null?null:(0,b.jsx)(At,{t,data:e.prompt}),e.confirm===null?null:(0,b.jsx)(Ht,{t,data:e.confirm}),r===null?null:(0,b.jsx)("div",{className:r.tone==="error"?"fdp-toast fdp-toast-error":"fdp-toast",role:"status",children:r.text})]})}function Ee({t,onReload:e,onOverwrite:r}){return(0,b.jsxs)("div",{className:"fdp-conflict",role:"alert",children:[(0,b.jsxs)("div",{className:"fdp-conflict-text",children:[(0,b.jsx)("strong",{children:t("conflict.title")}),(0,b.jsx)("span",{children:t("conflict.body")})]}),(0,b.jsxs)("div",{className:"fdp-conflict-actions",children:[(0,b.jsx)("button",{type:"button",className:"fdp-button",onClick:e,children:t("action.reload")}),(0,b.jsx)("button",{type:"button",className:"fdp-button",onClick:r,children:t("action.overwrite")})]})]})}var ht=Ge(require("react"),1),ae=require("react/jsx-runtime"),ve=class extends ht.default.Component{constructor(e){super(e),this.state={failed:!1}}static getDerivedStateFromError(){return{failed:!0}}render(){return this.state.failed?(0,ae.jsx)("section",{className:"fdp-root","data-dsh-files":"",children:(0,ae.jsxs)("div",{className:"fdp-empty",children:[(0,ae.jsx)("p",{className:"fdp-empty-title",children:this.props.title}),(0,ae.jsx)("p",{className:"fdp-empty-hint",children:this.props.hint}),(0,ae.jsx)("button",{type:"button",className:"fdp-button",onClick:()=>window.location.reload(),children:this.props.reloadLabel})]})}):this.props.children}};var P=require("react");var vt=require("react");function Re({sessionId:t,useSessions:e,useWorkspaces:r}){let o=r(u=>u.items),n=e(u=>u.byId[t]);return(0,vt.useMemo)(()=>{let u=o.find(c=>c.sessionIds?.includes(t))??o.find(c=>typeof n?.cwd=="string"&&(n.cwd===c.path||n.cwd.startsWith(`${c.path}/`)))??null;return{session:n,workspace:u,root:typeof n?.cwd=="string"?n.cwd:u?.path??null,workspaceId:u?.workspaceId??null}},[o,n,t])}var F=require("react");var be=require("react/jsx-runtime"),Ke=null;function _t(){if(Ke===null){let t=globalThis.__dshFilesDeskRequireAsync;if(typeof t!="function")throw new Error("The editor chunk loader is unavailable.");Ke=t("./client.editor.js")}return Ke}function Te(t){let{workspaceId:e,path:r,initialText:o,version:n,eol:u,bom:c,readOnly:f,wrap:w,tabSize:E,line:p,autoSave:l}=t,L=(0,F.useRef)(null),m=(0,F.useRef)(null),k=(0,F.useRef)(o),X=(0,F.useRef)(o),C=(0,F.useRef)(n),M=(0,F.useRef)(!1),K=(0,F.useRef)(!1),j=(0,F.useRef)(!1),N=(0,F.useRef)(null),a=(0,F.useRef)(t),W=(0,F.useRef)(null),[re,V]=(0,F.useState)(!1);a.current=t;async function Q(h,T){if(a.current.readOnly||K.current)return!1;K.current=!0,a.current.onStatus?.("saving");try{let y=await S("write",{workspaceId:a.current.workspaceId,path:a.current.path,text:h,version:T??C.current,eol:a.current.eol,bom:a.current.bom});return C.current=y.version,X.current=h,k.current=h,M.current=!1,j.current=!1,a.current.onDirty?.(!1),a.current.onSaved?.(y.version),a.current.onStatus?.("saved"),!0}catch(y){return y.code==="files/conflict"?(j.current=!0,a.current.onStatus?.("conflict")):(a.current.onStatus?.("error",y),a.current.onError?.(y)),!1}finally{K.current=!1}}W.current=Q;async function Y(){try{let h=await S("read",{workspaceId:a.current.workspaceId,path:a.current.path});C.current=h.version,X.current=h.text,k.current=h.text,M.current=!1,j.current=!1,m.current?.setText(h.text),a.current.onSaved?.(h.version),a.current.onDirty?.(!1),a.current.onStatus?.("clean")}catch(h){a.current.onError?.(h)}}async function ce(){try{let h=await S("stat",{workspaceId:a.current.workspaceId,path:a.current.path});await Q(m.current?.getText()??k.current,h.version)}catch(h){a.current.onError?.(h)}}function R(h){k.current=h,a.current.onChange?.(h);let T=h!==X.current;T!==M.current&&(M.current=T,a.current.onDirty?.(T),T||a.current.onStatus?.("clean")),a.current.autoSave&&T&&j.current===!1&&(clearTimeout(N.current),N.current=setTimeout(()=>{let y=m.current;y!==null&&W.current?.(y.getText())},800))}return(0,F.useEffect)(()=>{let h=!1;return V(!1),_t().then(T=>{if(h||L.current===null)return;let y=T.createEditor({parent:L.current,doc:k.current,language:ie(r),readOnly:f,wrap:w,tabSize:E,line:p,onChange:R,onCursor:i=>a.current.onCursor?.(i),onSave:()=>{let i=m.current;i!==null&&W.current?.(i.getText())}});m.current=y;let ze={save:()=>W.current?.(y.getText()),reload:Y,overwrite:ce,focus:y.focus,revealLine:y.revealLine,getText:y.getText};a.current.onApi?.(ze),a.current.onStatus?.(M.current?"dirty":"clean"),typeof a.current.line=="number"&&a.current.line>0&&y.revealLine(a.current.line)}).catch(()=>{h||V(!0)}),()=>{h=!0,clearTimeout(N.current),m.current?.destroy(),m.current=null}},[r,w,f,E]),(0,F.useEffect)(()=>{typeof p=="number"&&p>0&&m.current!==null&&m.current.revealLine(p)},[p]),(0,F.useEffect)(()=>{if(f)return;let h=setInterval(()=>{K.current||(async()=>{try{if((await S("stat",{workspaceId:e,path:r})).version===C.current)return;if(M.current){j.current||(j.current=!0,a.current.onStatus?.("conflict"));return}await Y()}catch{}})()},3e3);return()=>clearInterval(h)},[e,r,f]),(0,be.jsxs)("div",{className:"fdp-editor-host",children:[(0,be.jsx)("div",{ref:L,className:"fdp-editor-mount","data-fdp-editor":r}),re?(0,be.jsx)("p",{className:"fdp-note",children:d("error.generic")}):null]})}var Er=require("react"),g=require("react/jsx-runtime");function J({children:t,size:e=16}){return(0,g.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",focusable:"false",children:t})}function bt(){return(0,g.jsxs)(J,{children:[(0,g.jsx)("path",{d:"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"}),(0,g.jsx)("path",{d:"M14 3v5h5"}),(0,g.jsx)("path",{d:"M17 15v6M14 18h6"})]})}function gt(){return(0,g.jsxs)(J,{children:[(0,g.jsx)("path",{d:"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"}),(0,g.jsx)("path",{d:"M12 11v6M9 14h6"})]})}function wt(){return(0,g.jsxs)(J,{children:[(0,g.jsx)("path",{d:"M20 11a8 8 0 1 0-2.3 5.7"}),(0,g.jsx)("path",{d:"M20 4v7h-7"})]})}function Le(){return(0,g.jsxs)(J,{children:[(0,g.jsx)("path",{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"}),(0,g.jsx)("path",{d:"M17 21v-8H7v8M7 3v5h8"})]})}function je(){return(0,g.jsxs)(J,{children:[(0,g.jsx)("path",{d:"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"}),(0,g.jsx)("circle",{cx:"12",cy:"12",r:"3"})]})}function yt(){return(0,g.jsx)(J,{size:14,children:(0,g.jsx)("path",{d:"M18 6 6 18M6 6l12 12"})})}function ge(){return(0,g.jsx)(J,{children:(0,g.jsx)("path",{d:"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"})})}function Oe(){return(0,g.jsxs)(J,{children:[(0,g.jsx)("path",{d:"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"}),(0,g.jsx)("path",{d:"M14 3v5h5"})]})}function xt(){return(0,g.jsxs)(J,{children:[(0,g.jsx)("path",{d:"M3 6h18M3 12h13a3 3 0 0 1 0 6h-3"}),(0,g.jsx)("path",{d:"m15 15-3 3 3 3"}),(0,g.jsx)("path",{d:"M3 18h6"})]})}var s=require("react/jsx-runtime"),Ut={fallback:null},Kt=new Set(["files/binary","files/too-large","files/not-utf8"]);function Zt({path:t,root:e}){let r=t.replace(/\\/g,"/"),o=r.lastIndexOf("/"),n=o<0?"":r.slice(0,o+1),u=o<0?r:r.slice(o+1),c=e!==null&&n.startsWith(e)?n.slice(e.length):n;return c==="/"&&(c=""),(0,s.jsxs)("span",{className:"fdp-path",title:t,children:[c===""?null:(0,s.jsx)("span",{className:"fdp-path-dir",children:c}),(0,s.jsx)("span",{className:"fdp-path-name",children:u})]})}function we({label:t,onClick:e,children:r,pressed:o}){return(0,s.jsx)("button",{type:"button",className:"fdp-icon-button","aria-label":t,title:t,"aria-pressed":o,onClick:e,children:r})}function Ze(t){let{t:e,useTabInfo:r,useSessions:o,useWorkspaces:n,useContextMenu:u,renderFactorySlot:c,sessionId:f}=t,{tab:w,panel:E}=r(),p=(0,P.useMemo)(()=>it(E.id),[E.id]),l=(0,P.useSyncExternalStore)(p.subscribe,p.getSnapshot),L=Re({sessionId:f,useSessions:o,useWorkspaces:n}),m=L.root,k=L.workspaceId,[X,C]=(0,P.useState)({line:1,column:1}),[M,K]=(0,P.useState)(null),j=(0,P.useRef)(null);(0,P.useEffect)(()=>{m!==null&&k!==null&&p.init(f,k,m)},[p,f,k,m]),(0,P.useEffect)(()=>{m!==null&&k!==null&&z.set(f,{sessionId:f,workspaceId:k,root:m.replace(/\/+$/,""),store:p})},[f,k,m,p]);let N=w.navigation;(0,P.useEffect)(()=>{N?.params?.path&&l.root!==null&&p.reveal(N.params.path,{line:N.params.line}).catch(i=>U(e(_(i?.code)),"error"))},[N?.revision,l.root]);let a=l.buffers.find(i=>i.path===l.activePath)??null,W=(0,P.useCallback)(async i=>{if(ue(i)){G(f,i);return}try{await p.openFile(i)}catch(x){Kt.has(x?.code)?G(f,i):U(e(_(x?.code)),"error")}},[f,p,e]),re=(0,P.useMemo)(()=>{let i=[];for(let[x,$]of Object.entries(l.levels))if($.status==="ready")for(let A of $.entries)i.push({path:`${x.replace(/\/+$/,"")}/${A.name}`,name:A.name,meta:{kind:A.type==="directory"?"directory":A.type==="file"?"file":"other"}});return i},[l.levels]),V=(0,P.useMemo)(()=>{let i={},x=new Set([l.root,...l.expanded].filter($=>typeof $=="string"&&$!==""));for(let $ of x){let A=$.replace(/\/+$/,""),oe=l.levels[$];oe===void 0||oe.status==="loading"?i[A]={loading:!0}:oe.status==="failed"?i[A]={failure:e("tree.failed")}:i[A]=oe.truncated?{truncated:!0}:{}}return i},[l.levels,l.expanded,l.root,e]),Y=(typeof u=="function"?u():null)?.getTriggerProps,ce=(0,P.useMemo)(()=>({root:l.root===null?"":l.root.replace(/\/+$/,""),entries:re,expanded:l.expanded,onToggle:(i,x)=>p.toggle(i.path,x),onOpen:i=>{W(i.path)},directories:V,current:a?.path,rowTriggerProps:(i,x)=>typeof Y=="function"?Y(x==="directory"?{kind:"directory",value:{sessionId:f,path:i.path}}:{kind:"file",value:{sessionId:f,path:i.path,paneId:E.id}}):{}}),[l.root,re,l.expanded,V,a?.path,Y,f,E.id,p,W]),R=async i=>{let x=p.buffer(i);x!==void 0&&i===l.activePath&&(x.status==="dirty"||x.status==="conflict")&&await j.current?.save(),p.closeBuffer(i)},h=()=>{j.current?.save()},T=M??l.treeWidth,y=a===null?l.root:ne(a.path),ze=i=>{if(i.button!==0)return;i.preventDefault();let x=i.clientX,$=l.treeWidth,A=ye=>K(Math.max(180,Math.min(560,$+ye.clientX-x))),oe=()=>{window.removeEventListener("pointermove",A),window.removeEventListener("pointerup",oe),K(ye=>(ye!==null&&p.setTreeWidth(ye),null))};window.addEventListener("pointermove",A),window.addEventListener("pointerup",oe)};return m===null||k===null?(0,s.jsx)("section",{className:"fdp-root","data-dsh-files":"",children:(0,s.jsxs)("div",{className:"fdp-empty",children:[(0,s.jsx)(ge,{}),(0,s.jsx)("p",{className:"fdp-empty-title",children:e("empty.noRoot")}),(0,s.jsx)("p",{className:"fdp-empty-hint",children:e("empty.noRootHint")})]})}):(0,s.jsxs)("section",{className:"fdp-root","data-dsh-files":"",children:[(0,s.jsxs)("header",{className:"fdp-header",children:[(0,s.jsx)("div",{className:"fdp-heading",children:a===null?(0,s.jsxs)("span",{className:"fdp-path",title:l.root??"",children:[(0,s.jsx)(ge,{}),(0,s.jsx)("span",{className:"fdp-path-name",children:l.root===null?e("empty.noRoot"):I(l.root)})]}):(0,s.jsx)(Zt,{path:a.path,root:m})}),(0,s.jsxs)("div",{className:"fdp-actions",children:[a!==null&&a.status!=="clean"&&a.status!=="saved"?(0,s.jsx)(we,{label:e("action.save"),onClick:h,children:(0,s.jsx)(Le,{})}):null,a!==null?(0,s.jsx)(we,{label:e("action.preview"),onClick:()=>G(f,a.path),children:(0,s.jsx)(je,{})}):null,(0,s.jsx)(we,{label:e("action.newFile"),onClick:()=>{y!==null&&Pe(f,y)},children:(0,s.jsx)(bt,{})}),(0,s.jsx)(we,{label:e("action.newFolder"),onClick:()=>{y!==null&&Ce(f,y)},children:(0,s.jsx)(gt,{})}),(0,s.jsx)(we,{label:e("action.refresh"),onClick:()=>p.refresh(),children:(0,s.jsx)(wt,{})})]})]}),(0,s.jsxs)("div",{className:"fdp-body",children:[(0,s.jsx)("aside",{className:"fdp-tree",style:{width:`${T}px`},children:(0,s.jsx)("div",{className:"fdp-tree-scroll",children:l.root===null?(0,s.jsx)("p",{className:"fdp-note",children:e("tree.loading")}):typeof c=="function"?c("sidebar.files.tree",ce,Ut)??(0,s.jsx)("p",{className:"fdp-note",children:e("tree.unavailable")}):(0,s.jsx)("p",{className:"fdp-note",children:e("tree.unavailable")})})}),(0,s.jsx)("div",{className:"fdp-divider",role:"separator","aria-orientation":"vertical","aria-label":e("action.refresh"),"aria-valuenow":T,tabIndex:0,onPointerDown:ze,onKeyDown:i=>{i.key==="ArrowLeft"?p.setTreeWidth(T-16):i.key==="ArrowRight"&&p.setTreeWidth(T+16)}}),(0,s.jsxs)("main",{className:"fdp-main",children:[l.buffers.length>0?(0,s.jsx)("div",{className:"fdp-tabs",role:"tablist",children:l.buffers.map(i=>{let x=i.path===l.activePath,$=i.status==="dirty"||i.status==="conflict";return(0,s.jsxs)("div",{className:x?"fdp-tab fdp-tab-active":"fdp-tab",role:"presentation",children:[(0,s.jsxs)("button",{type:"button",role:"tab","aria-selected":x,className:"fdp-tab-main",title:i.path,onClick:()=>p.setActive(i.path),children:[(0,s.jsx)("span",{className:"fdp-tab-name",children:I(i.path)}),$?(0,s.jsx)("span",{className:i.status==="conflict"?"fdp-dot fdp-dot-warn":"fdp-dot","aria-hidden":"true"}):null]}),(0,s.jsx)("button",{type:"button",className:"fdp-tab-close","aria-label":e("tab.close",{name:I(i.path)}),title:e("tab.close",{name:I(i.path)}),onClick:()=>{R(i.path)},children:(0,s.jsx)(yt,{})})]},i.path)})}):null,a===null?(0,s.jsxs)("div",{className:"fdp-empty",children:[(0,s.jsx)(Oe,{}),(0,s.jsx)("p",{className:"fdp-empty-title",children:e("empty.select")}),(0,s.jsx)("p",{className:"fdp-empty-hint",children:e("empty.selectHint")})]}):(0,s.jsxs)(s.Fragment,{children:[a.status==="conflict"?(0,s.jsx)(Ee,{t:e,onReload:()=>{j.current?.reload()},onOverwrite:()=>{j.current?.overwrite()}}):null,(0,s.jsx)(Te,{sessionId:f,workspaceId:k,path:a.path,initialText:a.text??"",version:a.version,eol:a.eol,bom:a.bom,readOnly:a.readOnly===!0,wrap:l.wrap,tabSize:2,line:w.navigation?.params?.line,autoSave:l.autoSave,onChange:i=>p.setBufferText(a.path,i),onDirty:i=>p.setBufferStatus(a.path,i?"dirty":"clean"),onStatus:(i,x)=>p.setBufferStatus(a.path,i,x??null),onSaved:i=>p.updateBuffer(a.path,{version:i,status:"clean"}),onCursor:C,onError:i=>U(e(_(i?.code)),"error"),onApi:i=>{j.current=i}},`${a.path}:${l.wrap}`)]}),(0,s.jsxs)("footer",{className:"fdp-status",children:[(0,s.jsx)("span",{className:"fdp-status-left",children:a===null?"":e("status.encoding")}),(0,s.jsx)("span",{className:"fdp-status-right",children:a===null?null:(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)("span",{children:`${X.line}:${X.column}`}),(0,s.jsx)("span",{children:ie(a.path)}),(0,s.jsx)("span",{children:a.eol==="crlf"?e("status.crlf"):e("status.lf")}),(0,s.jsx)("span",{className:a.status==="conflict"||a.status==="error"?"fdp-status-warn":"",children:ct(a.status)}),(0,s.jsx)("button",{type:"button",className:"fdp-icon-button","aria-label":e("action.wrap"),title:e("action.wrap"),"aria-pressed":l.wrap,onClick:()=>p.toggleWrap(),children:(0,s.jsx)(xt,{})})]})})]})]})]})]})}var ee=require("react");var v=require("react/jsx-runtime"),qt=new Set(["files/binary","files/too-large","files/not-utf8"]);function qe(t){let{t:e,sessionId:r,useTabInfo:o,useSessions:n,useWorkspaces:u}=t,{tab:c}=o(),f=se(c.contentId??c.navigation?.address),w=f?.sessionId??r,E=Re({sessionId:w,useSessions:n,useWorkspaces:u}),p=E.root,l=E.workspaceId,L=f?.path??"",m=L===""?"":de(L)?O(L):p===null?L:H(p,L),k=c.navigation?.params?.line,X=p===null||m===""?!0:!pe(p,m),[C,M]=(0,ee.useState)({status:"loading",file:null,error:null}),[K,j]=(0,ee.useState)({line:1,column:1}),[N,a]=(0,ee.useState)("clean"),W=(0,ee.useRef)(null);(0,ee.useEffect)(()=>{let R=!1;return l===null||m===""?(M({status:"failed",file:null,error:{code:"files/no-workspace",message:"No workspace."}}),()=>{R=!0}):(M({status:"loading",file:null,error:null}),S("read",{workspaceId:l,path:m}).then(h=>{R||M({status:"ready",file:h,error:null})}).catch(h=>{R||M({status:"failed",file:null,error:h})}),()=>{R=!0})},[l,m,c.id]);let re=m===""?"":I(m),V=m.slice(0,m.length-re.length),Q=p!==null&&V.startsWith(p)?V.slice(p.length):V;Q==="/"&&(Q="");let Y=C.error?.code,ce=ue(m)||qt.has(Y);return(0,v.jsxs)("section",{className:"fdp-root fdp-editor-tab","data-dsh-files":"",children:[(0,v.jsxs)("header",{className:"fdp-header",children:[(0,v.jsx)("div",{className:"fdp-heading",children:(0,v.jsxs)("span",{className:"fdp-path",title:m,children:[Q===""?null:(0,v.jsx)("span",{className:"fdp-path-dir",children:Q}),(0,v.jsx)("span",{className:"fdp-path-name",children:re})]})}),(0,v.jsxs)("div",{className:"fdp-actions",children:[C.status==="ready"&&N!=="clean"&&N!=="saved"?(0,v.jsx)("button",{type:"button",className:"fdp-icon-button","aria-label":e("action.save"),title:e("action.save"),onClick:()=>{W.current?.save()},children:(0,v.jsx)(Le,{})}):null,(0,v.jsx)("button",{type:"button",className:"fdp-icon-button","aria-label":e("action.preview"),title:e("action.preview"),onClick:()=>G(w,m,k),children:(0,v.jsx)(je,{})})]})]}),C.status==="loading"?(0,v.jsx)("div",{className:"fdp-empty",children:(0,v.jsx)("p",{className:"fdp-empty-hint",children:e("empty.loading")})}):null,C.status==="failed"?(0,v.jsxs)("div",{className:"fdp-empty",children:[(0,v.jsx)("p",{className:"fdp-empty-title",children:e(_(Y))}),ce?(0,v.jsx)("button",{type:"button",className:"fdp-button",onClick:()=>G(w,m,k),children:e("action.preview")}):null,l===null?null:(0,v.jsx)("button",{type:"button",className:"fdp-button",onClick:()=>me(m),children:e("action.reveal")})]}):null,C.status==="ready"?(0,v.jsxs)(v.Fragment,{children:[N==="conflict"?(0,v.jsx)(Ee,{t:e,onReload:()=>{W.current?.reload()},onOverwrite:()=>{W.current?.overwrite()}}):null,(0,v.jsx)(Te,{sessionId:w,workspaceId:l,path:m,initialText:C.file.text,version:C.file.version,eol:C.file.eol,bom:C.file.bom,readOnly:X,wrap:!1,tabSize:2,line:typeof k=="number"?k:void 0,autoSave:!0,onDirty:R=>a(R?"dirty":"clean"),onStatus:R=>a(R),onSaved:()=>a("clean"),onCursor:j,onError:R=>U(e(_(R?.code)),"error"),onApi:R=>{W.current=R}}),(0,v.jsxs)("footer",{className:"fdp-status",children:[(0,v.jsx)("span",{className:"fdp-status-left",children:e(X?"status.readOnly":"status.encoding")}),(0,v.jsxs)("span",{className:"fdp-status-right",children:[(0,v.jsx)("span",{children:`${K.line}:${K.column}`}),(0,v.jsx)("span",{children:ie(m)}),(0,v.jsx)("span",{children:C.file.eol==="crlf"?e("status.crlf"):e("status.lf")}),(0,v.jsx)("span",{className:N==="conflict"||N==="error"?"fdp-status-warn":"",children:N==="saving"?e("status.saving"):N==="conflict"?e("status.conflict"):N==="error"?e("status.error"):N==="dirty"?e("status.unsaved"):""})]})]})]}):null]})}var kt="dsh-files-desk/styles",Xt=`
.fdp-root {
  --fdp-code-keyword: #8b3d9e;
  --fdp-code-string: #2f7d32;
  --fdp-code-number: #8a5a00;
  --fdp-code-comment: #8a8f98;
  --fdp-code-function: #2f5fb3;
  --fdp-code-type: #9a6700;
  --fdp-code-variable: #b03a2e;
  --fdp-code-operator: #0b7285;
  --fdp-code-meta: #2f5fb3;
  --fdp-code-invalid: #b03a2e;
  --fdp-code-link: #2f5fb3;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  min-width: 0;
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-bg-base);
  font-size: 13px;
  line-height: 1.5;
}
body[data-ds-dark-theme] .fdp-root {
  --fdp-code-keyword: #c678dd;
  --fdp-code-string: #98c379;
  --fdp-code-number: #d19a66;
  --fdp-code-comment: #6b7280;
  --fdp-code-function: #61afef;
  --fdp-code-type: #e5c07b;
  --fdp-code-variable: #e06c75;
  --fdp-code-operator: #56b6c2;
  --fdp-code-meta: #61afef;
  --fdp-code-invalid: #e06c75;
  --fdp-code-link: #61afef;
}
.fdp-root *, .fdp-overlay-root *, .fdp-root *::before, .fdp-overlay-root *::before {
  box-sizing: border-box;
}
.fdp-header {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 38px;
  padding: 0 6px 0 12px;
  border-bottom: .5px solid var(--dsw-alias-border-l3);
}
.fdp-editor-tab .fdp-header { padding-left: 14px; }
.fdp-heading {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--dsw-alias-label-secondary);
}
.fdp-path {
  display: flex;
  align-items: baseline;
  gap: 0;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  font-size: 12px;
}
.fdp-path svg { flex: none; align-self: center; margin-right: 6px; color: var(--dsw-alias-label-tertiary); }
.fdp-path-dir {
  color: var(--dsw-alias-label-tertiary);
  overflow: hidden;
  text-overflow: ellipsis;
}
.fdp-path-name {
  color: var(--dsw-alias-label-primary);
  overflow: hidden;
  text-overflow: ellipsis;
}
.fdp-actions { flex: none; display: flex; align-items: center; gap: 2px; }
.fdp-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: var(--dsw-radius-sm, 6px);
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  flex: none;
}
.fdp-icon-button svg { width: 15px; height: 15px; }
.fdp-icon-button:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.fdp-icon-button[aria-pressed="true"] { background: var(--dsw-alias-interactive-bg-active); color: var(--dsw-alias-label-primary); }
.fdp-body { flex: 1; min-height: 0; min-width: 0; display: flex; }
.fdp-tree {
  flex: none;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  background: var(--dsw-alias-bg-base);
}
.fdp-tree-scroll {
  height: 100%;
  overflow: auto;
  padding: 6px 0 10px 6px;
  scrollbar-gutter: stable;
}
.fdp-divider {
  flex: none;
  width: 5px;
  cursor: col-resize;
  position: relative;
  touch-action: none;
  background: transparent;
}
.fdp-divider::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 2px;
  width: 1px;
  background: var(--dsw-alias-border-l3);
  transition: background-color .12s ease;
}
.fdp-divider:hover::after, .fdp-divider:focus-visible::after { background: var(--dsw-alias-brand-primary); }
.fdp-main {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.fdp-tabs {
  flex: none;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 34px;
  padding: 4px 6px 0;
  border-bottom: .5px solid var(--dsw-alias-border-l3);
  overflow-x: auto;
  overflow-y: hidden;
}
.fdp-tabs::-webkit-scrollbar { height: 0; }
.fdp-tab {
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 190px;
  height: 26px;
  border-radius: var(--dsw-radius-sm, 6px) var(--dsw-radius-sm, 6px) 0 0;
  color: var(--dsw-alias-label-secondary);
}
.fdp-tab-active {
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
}
.fdp-tab-main {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  height: 100%;
  padding: 0 4px 0 9px;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.fdp-tab-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fdp-dot {
  flex: none;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--dsw-alias-state-warn-primary);
}
.fdp-dot-warn { background: var(--dsw-alias-state-error-primary); }
.fdp-tab-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: none;
  width: 22px;
  height: 22px;
  margin-right: 3px;
  padding: 0;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
}
.fdp-tab-close:hover { background: var(--dsw-alias-interactive-bg-hover); color: var(--dsw-alias-label-primary); }
.fdp-editor-host { flex: 1; min-height: 0; min-width: 0; position: relative; }
.fdp-editor-mount { position: absolute; inset: 0; }
.fdp-editor-mount .cm-editor { height: 100%; }
.fdp-editor-mount .cm-editor.cm-focused { outline: none; }
.fdp-editor-mount .cm-scroller { overflow: auto; }
.fdp-status {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 26px;
  padding: 0 8px 0 12px;
  border-top: .5px solid var(--dsw-alias-border-l3);
  color: var(--dsw-alias-label-tertiary);
  font-size: 11px;
}
.fdp-status-right { display: flex; align-items: center; gap: 10px; min-width: 0; }
.fdp-status-left { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fdp-status-warn { color: var(--dsw-alias-state-warn-primary); }
.fdp-status .fdp-icon-button { width: 22px; height: 22px; }
.fdp-status .fdp-icon-button svg { width: 13px; height: 13px; }
.fdp-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 24px;
  text-align: center;
  color: var(--dsw-alias-label-tertiary);
}
.fdp-empty svg { width: 26px; height: 26px; color: var(--dsw-alias-label-tertiary); margin-bottom: 4px; }
.fdp-empty-title { margin: 0; font-size: 13px; font-weight: 500; color: var(--dsw-alias-label-secondary); }
.fdp-empty-hint { margin: 0; max-width: 280px; font-size: 12px; line-height: 1.6; }
.fdp-note { margin: 0; padding: 8px 10px; color: var(--dsw-alias-label-tertiary); font-size: 12px; }
.fdp-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-bg-layer-2);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}
.fdp-button:hover { background: var(--dsw-alias-interactive-bg-hover); }
.fdp-button:disabled { opacity: .5; cursor: default; }
.fdp-button-primary {
  border-color: transparent;
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground);
}
.fdp-button-primary:hover { background: var(--dsw-alias-button-primary-hover); }
.fdp-button-danger {
  border-color: transparent;
  background: var(--dsw-alias-state-error-primary);
  color: var(--dsw-alias-label-primary-foreground);
}
.fdp-conflict {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 12px;
  border-bottom: .5px solid var(--dsw-alias-border-l1);
  border-left: 3px solid var(--dsw-alias-state-warn-primary);
  background: var(--dsw-alias-bg-layer-2);
}
.fdp-conflict-text { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.fdp-conflict-text strong { font-size: 12px; font-weight: 600; color: var(--dsw-alias-label-primary); }
.fdp-conflict-text span { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.fdp-conflict-actions { flex: none; display: flex; gap: 6px; }
.fdp-overlay-root { position: fixed; inset: 0; z-index: 60; }
.fdp-scrim {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--dsw-alias-bg-mask-1);
}
.fdp-dialog {
  width: min(380px, 100%);
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: var(--dsw-radius-lg, 12px);
  border: .5px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-overlay);
  box-shadow: var(--dsw-elevation-prominent, 0 12px 32px rgba(0, 0, 0, .24));
  color: var(--dsw-alias-label-primary);
}
.fdp-dialog-head { font-size: 13px; font-weight: 600; }
.fdp-dialog-message { margin: 0; font-size: 12px; line-height: 1.6; color: var(--dsw-alias-label-secondary); }
.fdp-dialog-actions { display: flex; justify-content: flex-end; gap: 8px; }
.fdp-field { display: flex; flex-direction: column; gap: 6px; }
.fdp-field-label { font-size: 12px; color: var(--dsw-alias-label-secondary); }
.fdp-input {
  width: 100%;
  height: 32px;
  padding: 0 9px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
}
.fdp-input:focus { outline: none; border-color: var(--dsw-alias-state-business-primary); box-shadow: 0 0 0 2px color-mix(in srgb, var(--dsw-alias-state-business-primary) 22%, transparent); }
.fdp-field-error { margin: 0; font-size: 12px; color: var(--dsw-alias-state-error-primary); }
.fdp-toast {
  position: fixed;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  max-width: 80vw;
  padding: 8px 12px;
  border-radius: var(--dsw-radius-sm, 6px);
  background: var(--dsw-alias-toast-bg);
  color: var(--dsw-alias-toast-label);
  font-size: 12px;
  box-shadow: var(--dsw-elevation-prominent, 0 8px 24px rgba(0, 0, 0, .2));
}
.fdp-toast-error { border-left: 3px solid var(--dsw-alias-state-error-primary); }
.fdp-root .cm-panels { font-family: inherit; }
.fdp-root .cm-panel.cm-search { padding: 6px 8px; }
.fdp-root .cm-panel.cm-search input, .fdp-root .cm-panel.cm-search button { font-size: 12px; }
.fdp-root :focus-visible, .fdp-overlay-root :focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary);
  outline-offset: 1px;
}
.fdp-root .cm-editor:focus,
.fdp-root .cm-editor:focus-visible,
.fdp-root .cm-scroller:focus,
.fdp-root .cm-scroller:focus-visible,
.fdp-root .cm-content:focus,
.fdp-root .cm-content:focus-visible,
.fdp-root .cm-gutters:focus,
.fdp-root .cm-gutters:focus-visible {
  outline: none;
}
.fdp-tok-keyword { color: var(--fdp-code-keyword); }
.fdp-tok-string { color: var(--fdp-code-string); }
.fdp-tok-number { color: var(--fdp-code-number); }
.fdp-tok-comment { color: var(--fdp-code-comment); font-style: italic; }
.fdp-tok-function { color: var(--fdp-code-function); }
.fdp-tok-type { color: var(--fdp-code-type); }
.fdp-tok-variable { color: var(--fdp-code-variable); }
.fdp-tok-operator { color: var(--fdp-code-operator); }
.fdp-tok-meta { color: var(--fdp-code-meta); }
.fdp-tok-invalid { color: var(--fdp-code-invalid); text-decoration: underline; }
.fdp-tok-link { color: var(--fdp-code-link); text-decoration: underline; }
.fdp-tok-heading { font-weight: 600; color: var(--dsw-alias-label-primary); }
.fdp-tok-emphasis { font-style: italic; }
.fdp-tok-strong { font-weight: 700; }
.fdp-chip { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.fdp-chip svg { flex: none; color: var(--dsw-alias-label-tertiary); }
.fdp-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;function It(){if(typeof document>"u"||document.querySelector(`style[data-plugin-css="${kt}"]`)!==null)return;let t=document.createElement("style");t.dataset.plugin="dsh-files-desk",t.dataset.pluginCss=kt,t.textContent=Xt,document.head.appendChild(t)}var B=Nt.default.createElement,te="files",Xe="dsh-files-desk",Ve="dsh-files-desk/editor",Vt=["connection","slots","locale","sidebarRightTabs","sidebarRight","contextMenus"];function St({icon:t,text:e}){return B("span",{className:"fdp-chip"},t,B("span",null,e))}function Yt(){return B("svg",{viewBox:"0 0 24 24",width:22,height:22,fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},B("path",{d:"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"}),B("path",{d:"M10 12l-2 2 2 2M14 12l2 2-2 2"}))}function Gt(t){return B(ve,{title:t.t("error.surface"),hint:t.t("error.surfaceHint"),reloadLabel:t.t("action.reload")},B(Ze,t))}function Jt(t){return B(ve,{title:t.t("error.surface"),hint:t.t("error.surfaceHint"),reloadLabel:t.t("action.reload")},B(qe,t))}function Qt({t}){return B(St,{icon:B(ge,{size:14}),text:t("panel")})}function er({useTabInfo:t}){let{tab:e}=t(),r=se(e.contentId??e.navigation?.address);return B(St,{icon:B(Oe,{size:14}),text:r===void 0?"":I(r.path)})}function tr(t){It(),Je(t),le.sidebarRight=t.sidebarRight,t.locale.register(te,"en",et),t.locale.register(te,"zh",tt);let e=(r,o)=>t.locale.bind(te)(r,o);rt(e),t.effect(()=>t.sidebarRightTabs.register({id:Xe,kind:"files",priority:"extension",keepMounted:!0,title:()=>e("panel"),guide:[{id:"workspace",order:10,commandId:"workspace.files",title:()=>e("guide.title"),description:()=>e("guide.description"),icon:Yt}]}),"dsh-files-desk: files tab type"),t.effect(()=>t.sidebarRightTabs.register({id:Ve,kind:"editor",priority:"extension",patterns:["dsh-resource://file/**"],canOpen:r=>Qe(r),title:r=>{let o=se(r);return o===void 0?"":I(o.path)}}),"dsh-files-desk: editor tab type"),t.slots.inject("sidebar.right.pane.tab",()=>t.slots.register({name:"sidebar.right.pane.tab",key:Xe,locale:te,inject:()=>({t:e})},Gt)),t.slots.inject("sidebar.right.pane.tab",()=>t.slots.register({name:"sidebar.right.pane.tab",key:Ve,locale:te,inject:()=>({t:e})},Jt)),t.slots.inject("sidebar.right.pane.tab.title",()=>t.slots.register({name:"sidebar.right.pane.tab.title",key:Xe,locale:te,inject:()=>({t:e})},Qt)),t.slots.inject("sidebar.right.pane.tab.title",()=>t.slots.register({name:"sidebar.right.pane.tab.title",key:Ve,locale:te,inject:()=>({t:e})},er)),t.slots.inject("shell.overlay",()=>t.slots.register({name:"shell.overlay",id:"dsh-files-ops",locale:te,inject:()=>({t:e})},mt)),ft(t)}

    return module.exports;
  },
});
