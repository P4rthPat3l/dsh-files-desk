window.__ModuleLoader__.load({
  id: "dsh-files-desk",
  factory(require) {
    var module = { exports: {} };
    var exports = module.exports;
    globalThis.__dshFilesDeskRequireAsync = require.async;
"use strict";var Bt=Object.create;var Ie=Object.defineProperty;var Lt=Object.getOwnPropertyDescriptor;var Ot=Object.getOwnPropertyNames;var jt=Object.getPrototypeOf,Wt=Object.prototype.hasOwnProperty;var Mt=(t,e)=>{for(var r in e)Ie(t,r,{get:e[r],enumerable:!0})},tt=(t,e,r,n)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of Ot(e))!Wt.call(t,o)&&o!==r&&Ie(t,o,{get:()=>e[o],enumerable:!(n=Lt(e,o))||n.enumerable});return t};var rt=(t,e,r)=>(r=t!=null?Bt(jt(t)):{},tt(e||!t||!t.__esModule?Ie(r,"default",{value:t,enumerable:!0}):r,t)),At=t=>tt(Ie({},"__esModule",{value:!0}),t);var pr={};Mt(pr,{EditorTab:()=>Je,FilesWorkbench:()=>Ye,apply:()=>cr,inject:()=>or});module.exports=At(pr);var Ft=rt(require("react"),1);var De="dsh-resource://file/session/",Ee=class extends Error{code;details;constructor(e,r,n){super(r),this.name="FilesCallError",this.code=e,this.details=n}},ze=null;function nt(t){ze=t.connection}async function N(t,e,r){if(ze===null)throw new Error("The files channel is not ready.");let n=await ze.rpc.call("/files-rpc",t,e,r);if(!n.ok)throw new Ee(n.error.code,n.error.message,n.error.details);return n.value}function T(t){if(t instanceof Ee)return t.code;if(t instanceof Error&&"code"in t){let{code:e}=t;return typeof e=="string"?e:void 0}}function W(t){return t.replace(/\\/g,"/")}function pe(t){return t.startsWith("/")||/^[A-Za-z]:\//.test(W(t))||W(t).startsWith("//")}function I(t){let e=W(t).replace(/\/+$/,""),r=e.lastIndexOf("/");return r<0?e:e.slice(r+1)}function ie(t){let e=W(t).replace(/\/+$/,""),r=e.lastIndexOf("/");return r<0?"":r===0?"/":e.slice(0,r)}function U(t,e){let r=W(t).replace(/\/+$/,"");return r===""?e:`${r}/${e}`}function Ne(t){let e=W(t).replace(/\/+$/,"");return e===""?"/":e}function ue(t,e){let r=Ne(t),n=W(e);return n===r||n.startsWith(`${r}/`)}function Dt(t){return W(t).replace(/^(?:\.\/)+/,"").split("/").map(e=>encodeURIComponent(e)).join("/")}function Pe(t,e){return`${De}${encodeURIComponent(t)}/${Dt(e)}`}function $e(t,e,r){let n=W(r);if(!pe(n))return Pe(t,n);let o=e==null?"":Ne(e);return o!==""&&n===o?Pe(t,""):o!==""&&n.startsWith(`${o}/`)?Pe(t,n.slice(o.length+1)):Pe(t,n)}function le(t){if(typeof t!="string"||!t.startsWith(De))return;let e=t.slice(De.length),r=e.indexOf("/");if(!(r<=0))try{let n=decodeURIComponent(e.slice(0,r)),o=e.slice(r+1),c=o===""?"":o.split("/").map(l=>decodeURIComponent(l)).join("/");return{sessionId:n,path:c}}catch{return}}var zt={ts:"typescript",mts:"typescript",cts:"typescript",tsx:"tsx",js:"javascript",mjs:"javascript",cjs:"javascript",jsx:"jsx",json:"json",jsonc:"json",json5:"json",md:"markdown",markdown:"markdown",mdx:"markdown",css:"css",scss:"css",less:"css",html:"html",htm:"html",vue:"html",svelte:"html",py:"python",pyw:"python",yml:"yaml",yaml:"yaml",xml:"xml",svg:"xml",xsd:"xml",sql:"sql",java:"java",c:"cpp",h:"cpp",cc:"cpp",cpp:"cpp",cxx:"cpp",hpp:"cpp",rs:"rust",go:"go",php:"php"};function de(t){let e=I(t).toLowerCase();if(e==="dockerfile"||e==="makefile"||e==="procfile")return"text";let r=e.lastIndexOf(".");return r<0?"text":$t(e.slice(r+1))}function $t(t){return zt[t]??"text"}var Ht=new Set(["png","jpg","jpeg","gif","webp","bmp","ico","icns","avif","tif","tiff","psd","heic","pdf","doc","docx","xls","xlsx","ppt","pptx","odt","ods","odp","rtf","epub","zip","gz","tgz","tar","bz2","xz","7z","rar","jar","war","exe","dll","so","dylib","bin","dat","wasm","class","pyc","o","a","lib","obj","woff","woff2","ttf","otf","eot","mp3","wav","flac","ogg","oga","m4a","mp4","mov","avi","mkv","webm","m4v","wmv","sqlite","sqlite3","db","mdb","ttc"]);function fe(t){let e=I(t).toLowerCase(),r=e.lastIndexOf(".");return r<0?!1:Ht.has(e.slice(r+1))}function ot(t){let e=le(t);return e===void 0?!1:e.path!==""&&!fe(e.path)}function K(t){switch(t){case"files/outside-workspace":return"error.outside";case"files/not-found":return"error.notFound";case"files/exists":return"error.exists";case"files/binary":return"error.binary";case"files/too-large":return"error.tooLarge";case"files/not-utf8":return"error.notUtf8";case"files/symlink":return"error.symlink";case"files/name":return"error.name";default:return"error.generic"}}var at={panel:"Files","guide.title":"Files and editor","guide.description":"Browse, edit, and manage workspace files.","panel.title":"Files","action.newFile":"New file","action.newFolder":"New folder","action.refresh":"Refresh","action.save":"Save","action.preview":"Preview","action.reveal":"Reveal in Files","action.close":"Close","action.cancel":"Cancel","action.create":"Create","action.reload":"Reload","action.overwrite":"Overwrite","action.retry":"Retry","empty.select":"Select a file","empty.selectHint":"Pick a file in the tree. It opens here for editing.","empty.noRoot":"No workspace folder","empty.noRootHint":"Open a session that has a workspace to browse its files.","empty.loading":"Reading the file...","status.saved":"Saved","status.saving":"Saving...","status.unsaved":"Unsaved","status.conflict":"Changed on disk","status.readOnly":"Read only","status.error":"Save failed","status.lf":"LF","status.crlf":"CRLF","status.spaces":"Spaces: {count}","status.encoding":"UTF-8","action.wrap":"Wrap","dialog.newFile":"New file","dialog.newFileLabel":"File name","dialog.newFolder":"New folder","dialog.newFolderLabel":"Folder name","dialog.rename":"Rename","dialog.renameLabel":"New name","dialog.delete":"Delete","dialog.deleteFile":'Delete "{name}"? This cannot be undone.',"dialog.deleteFolder":'Delete "{name}" and everything inside it? This cannot be undone.',"dialog.pasteExists":'"{name}" already exists in that folder.',"conflict.title":"This file changed on disk.","conflict.body":"Reload to see the new content, or overwrite it with what you have here.","error.outside":"That path is outside the workspace.","error.notFound":"The file no longer exists.","error.exists":"That name already exists.","error.binary":"Binary files cannot be edited here.","error.tooLarge":"The file is too large to edit here.","error.notUtf8":"The file is not UTF-8 text.","error.symlink":"Symlinks are not edited here.","error.name":"Enter a name without a path separator.","error.generic":"The file operation failed.","error.surface":"The files view could not render.","error.surfaceHint":"Reload the page to try again. Nothing on disk was changed.","tree.loading":"Loading...","tree.failed":"Could not load this folder.","tree.truncated":"Too many entries, showing some of them.","tree.unavailable":"The file tree is unavailable.","tree.empty":"This folder is empty.","menu.openInEditor":"Open in editor","menu.preview":"Preview","menu.reveal":"Reveal in Files","menu.newFileHere":"New file here","menu.newFolderHere":"New folder here","menu.rename":"Rename","menu.duplicate":"Duplicate","menu.cut":"Cut","menu.copy":"Copy","menu.paste":"Paste","menu.copyPath":"Copy path","menu.delete":"Delete","toast.copied":"Copied {name}","toast.cut":"Cut {name}","toast.pasted":"Pasted {name}","toast.copiedPath":"Path copied","toast.saved":"Saved","title.files":"Files","tab.close":"Close {name}","dialog.ok":"OK"},it={panel:"\u6587\u4EF6","guide.title":"\u6587\u4EF6\u4E0E\u7F16\u8F91\u5668","guide.description":"\u6D4F\u89C8\u3001\u7F16\u8F91\u548C\u7BA1\u7406\u5DE5\u4F5C\u533A\u6587\u4EF6\u3002","panel.title":"\u6587\u4EF6","action.newFile":"\u65B0\u5EFA\u6587\u4EF6","action.newFolder":"\u65B0\u5EFA\u6587\u4EF6\u5939","action.refresh":"\u5237\u65B0","action.save":"\u4FDD\u5B58","action.preview":"\u9884\u89C8","action.reveal":"\u5728\u6587\u4EF6\u4E2D\u663E\u793A","action.close":"\u5173\u95ED","action.cancel":"\u53D6\u6D88","action.create":"\u521B\u5EFA","action.reload":"\u91CD\u65B0\u52A0\u8F7D","action.overwrite":"\u8986\u76D6","action.retry":"\u91CD\u8BD5","empty.select":"\u9009\u62E9\u4E00\u4E2A\u6587\u4EF6","empty.selectHint":"\u5728\u6587\u4EF6\u6811\u4E2D\u9009\u62E9\u6587\u4EF6\u540E\uFF0C\u4F1A\u5728\u8FD9\u91CC\u6253\u5F00\u5E76\u7F16\u8F91\u3002","empty.noRoot":"\u6CA1\u6709\u5DE5\u4F5C\u533A\u6587\u4EF6\u5939","empty.noRootHint":"\u6253\u5F00\u4E00\u4E2A\u6709\u5DE5\u4F5C\u533A\u7684\u4F1A\u8BDD\u5373\u53EF\u6D4F\u89C8\u6587\u4EF6\u3002","empty.loading":"\u6B63\u5728\u8BFB\u53D6\u6587\u4EF6...","status.saved":"\u5DF2\u4FDD\u5B58","status.saving":"\u4FDD\u5B58\u4E2D...","status.unsaved":"\u672A\u4FDD\u5B58","status.conflict":"\u78C1\u76D8\u5185\u5BB9\u5DF2\u53D8\u5316","status.readOnly":"\u53EA\u8BFB","status.error":"\u4FDD\u5B58\u5931\u8D25","status.lf":"LF","status.crlf":"CRLF","status.spaces":"\u7A7A\u683C\uFF1A{count}","status.encoding":"UTF-8","action.wrap":"\u81EA\u52A8\u6362\u884C","dialog.newFile":"\u65B0\u5EFA\u6587\u4EF6","dialog.newFileLabel":"\u6587\u4EF6\u540D","dialog.newFolder":"\u65B0\u5EFA\u6587\u4EF6\u5939","dialog.newFolderLabel":"\u6587\u4EF6\u5939\u540D\u79F0","dialog.rename":"\u91CD\u547D\u540D","dialog.renameLabel":"\u65B0\u540D\u79F0","dialog.delete":"\u5220\u9664","dialog.deleteFile":"\u5220\u9664\u201C{name}\u201D\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002","dialog.deleteFolder":"\u5220\u9664\u201C{name}\u201D\u53CA\u5176\u4E2D\u6240\u6709\u5185\u5BB9\uFF1F\u6B64\u64CD\u4F5C\u65E0\u6CD5\u64A4\u9500\u3002","dialog.pasteExists":"\u8BE5\u6587\u4EF6\u5939\u4E2D\u5DF2\u5B58\u5728\u201C{name}\u201D\u3002","conflict.title":"\u6B64\u6587\u4EF6\u5DF2\u5728\u78C1\u76D8\u4E0A\u53D1\u751F\u53D8\u5316\u3002","conflict.body":"\u91CD\u65B0\u52A0\u8F7D\u53EF\u67E5\u770B\u65B0\u5185\u5BB9\uFF0C\u6216\u4F7F\u7528\u5F53\u524D\u5185\u5BB9\u8986\u76D6\u3002","error.outside":"\u8BE5\u8DEF\u5F84\u4E0D\u5728\u5DE5\u4F5C\u533A\u5185\u3002","error.notFound":"\u6587\u4EF6\u5DF2\u4E0D\u5B58\u5728\u3002","error.exists":"\u8BE5\u540D\u79F0\u5DF2\u5B58\u5728\u3002","error.binary":"\u65E0\u6CD5\u5728\u6B64\u7F16\u8F91\u4E8C\u8FDB\u5236\u6587\u4EF6\u3002","error.tooLarge":"\u6587\u4EF6\u8FC7\u5927\uFF0C\u65E0\u6CD5\u5728\u6B64\u7F16\u8F91\u3002","error.notUtf8":"\u8BE5\u6587\u4EF6\u4E0D\u662F UTF-8 \u6587\u672C\u3002","error.symlink":"\u65E0\u6CD5\u5728\u6B64\u7F16\u8F91\u7B26\u53F7\u94FE\u63A5\u3002","error.name":"\u8BF7\u8F93\u5165\u4E0D\u542B\u8DEF\u5F84\u5206\u9694\u7B26\u7684\u540D\u79F0\u3002","error.generic":"\u6587\u4EF6\u64CD\u4F5C\u5931\u8D25\u3002","error.surface":"\u6587\u4EF6\u89C6\u56FE\u65E0\u6CD5\u6E32\u67D3\u3002","error.surfaceHint":"\u91CD\u65B0\u52A0\u8F7D\u9875\u9762\u5373\u53EF\u91CD\u8BD5\u3002\u78C1\u76D8\u4E0A\u7684\u6587\u4EF6\u6CA1\u6709\u53D8\u5316\u3002","tree.loading":"\u52A0\u8F7D\u4E2D...","tree.failed":"\u65E0\u6CD5\u52A0\u8F7D\u6B64\u6587\u4EF6\u5939\u3002","tree.truncated":"\u6761\u76EE\u8FC7\u591A\uFF0C\u4EC5\u663E\u793A\u4E00\u90E8\u5206\u3002","tree.unavailable":"\u6587\u4EF6\u6811\u4E0D\u53EF\u7528\u3002","tree.empty":"\u6B64\u6587\u4EF6\u5939\u4E3A\u7A7A\u3002","menu.openInEditor":"\u5728\u7F16\u8F91\u5668\u4E2D\u6253\u5F00","menu.preview":"\u9884\u89C8","menu.reveal":"\u5728\u6587\u4EF6\u4E2D\u663E\u793A","menu.newFileHere":"\u5728\u6B64\u65B0\u5EFA\u6587\u4EF6","menu.newFolderHere":"\u5728\u6B64\u65B0\u5EFA\u6587\u4EF6\u5939","menu.rename":"\u91CD\u547D\u540D","menu.duplicate":"\u521B\u5EFA\u526F\u672C","menu.cut":"\u526A\u5207","menu.copy":"\u590D\u5236","menu.paste":"\u7C98\u8D34","menu.copyPath":"\u590D\u5236\u8DEF\u5F84","menu.delete":"\u5220\u9664","toast.copied":"\u5DF2\u590D\u5236 {name}","toast.cut":"\u5DF2\u526A\u5207 {name}","toast.pasted":"\u5DF2\u7C98\u8D34 {name}","toast.copiedPath":"\u5DF2\u590D\u5236\u8DEF\u5F84","toast.saved":"\u5DF2\u4FDD\u5B58","title.files":"\u6587\u4EF6","tab.close":"\u5173\u95ED {name}","dialog.ok":"\u786E\u5B9A"},He=null;function st(t){He=t}function p(t,e){return He===null?t:He(t,e)}var pt="dsh-files.preferences.v1";function _t(){let t={wrap:!1,autoSave:!0};try{if(typeof localStorage>"u")return t;let e=localStorage.getItem(pt);if(e===null)return t;let r=JSON.parse(e);if(r===null||typeof r!="object")return t;let n=r;return{wrap:n.wrap===!0,autoSave:n.autoSave!==!1}}catch{return t}}function lt(t){try{typeof localStorage<"u"&&localStorage.setItem(pt,JSON.stringify(t))}catch{}}var dt=new Map;function ut(t){let e=dt.get(t);return e===void 0&&(e=new Ue,dt.set(t,e)),e}var M=new Map,z={path:null,mode:null,sessionId:null},Re={prompt:null,confirm:null,toast:null},_e=new Set,G={subscribe(t){return _e.add(t),()=>{_e.delete(t)}},getSnapshot(){return Re},patch(t){Re={...Re,...t};for(let e of _e)e()}};function Fe(t){return new Promise(e=>{G.patch({prompt:{...t,resolve:e}})})}function ft(t){return new Promise(e=>{G.patch({confirm:{...t,resolve:e}})})}var ct=0;function q(t,e="info"){ct+=1;let r=ct;G.patch({toast:{text:t,tone:e,token:r}}),setTimeout(()=>{Re.toast?.token===r&&G.patch({toast:null})},2600)}var Ue=class{listeners=new Set;state;constructor(){let e=_t();this.state={sessionId:null,workspaceId:null,root:null,levels:{},expanded:[],buffers:[],activePath:null,treeWidth:260,wrap:e.wrap,autoSave:e.autoSave}}subscribe=e=>(this.listeners.add(e),()=>{this.listeners.delete(e)});getSnapshot=()=>this.state;patch(e){this.state={...this.state,...e};for(let r of this.listeners)r()}init(e,r,n){let o=Ne(n);this.state.sessionId===e&&this.state.root===o&&this.state.workspaceId===r||(this.state={...this.state,sessionId:e,workspaceId:r,root:o,levels:{},expanded:[o],buffers:[],activePath:null},this.emit(),this.loadLevel(o))}async loadLevel(e){let r=this.state.levels[e];if(r?.status!=="loading"){this.setLevel(e,{status:"loading",entries:r?.entries??[]});try{let n=await N("list",{workspaceId:this.state.workspaceId,path:e});this.setLevel(e,{status:"ready",entries:n.entries,truncated:n.truncated})}catch(n){this.setLevel(e,{status:"failed",entries:r?.entries??[],error:{code:T(n),message:n instanceof Error?n.message:String(n)}})}}}setLevel(e,r){this.patch({levels:{...this.state.levels,[e]:r}})}toggle(e,r){let n=new Set(this.state.expanded);r?n.add(e):n.delete(e),this.patch({expanded:[...n]}),r&&this.loadLevel(e)}refresh(){let e=new Set;this.state.root!==null&&e.add(this.state.root);for(let r of this.state.expanded)e.add(r);for(let r of e)r!==""&&this.loadLevel(r)}refreshPath(e){e!==""&&this.loadLevel(e)}buffer(e){return this.state.buffers.find(r=>r.path===e)}async openFile(e,r={}){let n=this.buffer(e);if(n!==void 0)return this.patch({activePath:e}),n;let o=r.text,c=r.version??null,l=r.eol??"lf",u=r.bom===!0;if(typeof o!="string"){let x=await N("read",{workspaceId:this.state.workspaceId,path:e});o=x.text,c=x.version,l=x.eol,u=x.bom}let w={path:e,text:o,version:c,eol:l,bom:u,status:"clean",error:null,readOnly:r.readOnly===!0||!ue(this.state.root??"",e)};return this.patch({buffers:[...this.state.buffers,w],activePath:e}),w}updateBuffer(e,r){let n=this.state.buffers.map(o=>o.path===e?{...o,...r}:o);this.patch({buffers:n})}setBufferText(e,r){let n=this.buffer(e);n!==void 0&&(n.text=r)}setBufferStatus(e,r,n=null){this.updateBuffer(e,{status:r,error:n})}setActive(e){this.patch({activePath:e})}closeBuffer(e){let r=this.state.buffers.filter(o=>o.path!==e),n=this.state.activePath;n===e&&(n=r.length>0?r[r.length-1]?.path??null:null),this.patch({buffers:r,activePath:n})}renameBuffers(e,r){let n=this.state.buffers.map(l=>l.path===e?{...l,path:r}:l.path.startsWith(`${e}/`)?{...l,path:r+l.path.slice(e.length)}:l),o=this.state.activePath,c=o===e?r:o!==null&&o.startsWith(`${e}/`)?r+o.slice(e.length):o;this.patch({buffers:n,activePath:c})}closeBuffersUnder(e){let r=this.state.buffers.filter(o=>o.path!==e&&!o.path.startsWith(`${e}/`)),n=r.some(o=>o.path===this.state.activePath)?this.state.activePath:null;this.patch({buffers:r,activePath:n})}async reveal(e){let r=this.state.root;if(r===null)return null;let n=pe(e)?W(e):U(r,W(e));if(!ue(r,n))return await this.openFile(n),n;let o=n.slice(r.length).split("/").filter(u=>u!==""),c=new Set(this.state.expanded);c.add(r),await this.loadLevel(r);let l=r;for(let u=0;u<o.length-1;u+=1)l=U(l,o[u]??""),c.add(l),await this.loadLevel(l);return this.patch({expanded:[...c]}),await this.openFile(n),n}setTreeWidth(e){this.patch({treeWidth:Math.max(180,Math.min(560,Math.round(e)))})}toggleWrap(){let e=!this.state.wrap;return lt({wrap:e,autoSave:this.state.autoSave}),this.patch({wrap:e}),e}toggleAutoSave(){let e=!this.state.autoSave;return lt({wrap:this.state.wrap,autoSave:e}),this.patch({autoSave:e}),e}emit(){for(let e of this.listeners)e()}};function mt(t){switch(t){case"saving":return p("status.saving");case"saved":return p("status.saved");case"conflict":return p("status.conflict");case"error":return p("status.error");case"dirty":return p("status.unsaved");case"clean":return""}}var ce={sidebarRight:null};var Ut="text",Ke=class extends Error{code="files/name";constructor(){super("A name without path separators is required."),this.name="NameError"}};function me(t){q(p(K(T(t))),"error")}function qe(t){if(t.includes("/")||t.includes("\\")||t==="."||t==="..")throw new Ke}function ht(t,e,r){let n=M.get(t)?.root,o=typeof r=="number"&&r>0?{line:r}:{};ce.sidebarRight?.openResource($e(t,n??void 0,e),{params:o})}function J(t,e,r){let n=M.get(t)?.root,o=typeof r=="number"&&r>0?{line:r}:{};ce.sidebarRight?.openResource($e(t,n??void 0,e),{kind:Ut,params:o})}function he(t){ce.sidebarRight?.openTab("files",{params:{path:t}})}async function Ce(t){try{await navigator.clipboard.writeText(t),q(p("toast.copiedPath"))}catch(e){me(e)}}async function Te(t,e){let r=M.get(t);r!==void 0&&await Fe({title:p("dialog.newFile"),label:p("dialog.newFileLabel"),initial:"",confirmLabel:p("action.create"),submit:async n=>{qe(n);let o=U(e,n);await N("create",{workspaceId:r.workspaceId,path:o,kind:"file"}),r.store.refreshPath(e),r.store.reveal(o).catch(me)}})}async function Be(t,e){let r=M.get(t);r!==void 0&&await Fe({title:p("dialog.newFolder"),label:p("dialog.newFolderLabel"),initial:"",confirmLabel:p("action.create"),submit:async n=>{qe(n),await N("create",{workspaceId:r.workspaceId,path:U(e,n),kind:"directory"}),r.store.refreshPath(e)}})}async function Xe(t,e){let r=M.get(t);r!==void 0&&await Fe({title:p("dialog.rename"),label:p("dialog.renameLabel"),initial:I(e),confirmLabel:p("dialog.rename"),submit:async n=>{qe(n);let o=U(ie(e),n);await N("rename",{workspaceId:r.workspaceId,from:e,to:o}),r.store.renameBuffers(e,o),r.store.refreshPath(ie(e))}})}async function gt(t,e){let r=M.get(t);if(r===void 0)return;let n=ie(e),o=I(e),c=o.lastIndexOf("."),l=c>0?o.slice(0,c):o,u=c>0?o.slice(c):"";try{for(let w=1;w<=20;w+=1){let x=U(n,w===1?`${l} copy${u}`:`${l} copy ${w}${u}`);try{await N("copy",{workspaceId:r.workspaceId,from:e,to:x}),r.store.refreshPath(n);return}catch(d){if(T(d)!=="files/exists")throw d}}}catch(w){me(w)}}function ge(t,e,r){z.path=e,z.mode=r,z.sessionId=t,q(p(r==="cut"?"toast.cut":"toast.copied",{name:I(e)}))}async function vt(t,e){let r=M.get(t);if(r===void 0||z.path===null)return;let n=z.path,o=U(e,I(n));try{z.mode==="cut"?(await N("rename",{workspaceId:r.workspaceId,from:n,to:o}),r.store.renameBuffers(n,o),z.path=null,z.mode=null,z.sessionId=null):await N("copy",{workspaceId:r.workspaceId,from:n,to:o}),r.store.refreshPath(e),q(p("toast.pasted",{name:I(o)}))}catch(c){me(c)}}async function Ze(t,e,r){let n=M.get(t);if(n===void 0)return;let o=I(e);if(await ft({title:p("dialog.delete"),message:p(r?"dialog.deleteFolder":"dialog.deleteFile",{name:o}),confirmLabel:p("menu.delete"),danger:!0}))try{await N("delete",{workspaceId:n.workspaceId,path:e}),n.store.closeBuffersUnder(e),n.store.refreshPath(ie(e))}catch(l){me(l)}}function Kt(t){let{sessionId:e,path:r}=t,n=typeof t.line=="number"?t.line:void 0,o=[{id:"open",label:p("menu.openInEditor"),run:()=>ht(e,r,n)},{id:"preview",label:p("menu.preview"),run:()=>J(e,r,n)},{id:"reveal",label:p("menu.reveal"),run:()=>he(r)},{id:"copy-path",label:p("menu.copyPath"),run:()=>void Ce(r)}],c=M.get(e);return c!==void 0&&(o.push({id:"rename",label:p("menu.rename"),run:()=>void Xe(e,r)},{id:"duplicate",label:p("menu.duplicate"),run:()=>void gt(e,r)},{id:"cut",label:p("menu.cut"),run:()=>ge(e,r,"cut")},{id:"copy",label:p("menu.copy"),run:()=>ge(e,r,"copy")}),r!==c.root&&o.push({id:"delete",label:p("menu.delete"),run:()=>void Ze(e,r,!1)})),o}function qt(t){let{sessionId:e,path:r}=t,n=M.get(e),o=[];return n!==void 0&&(o.push({id:"new-file",label:p("menu.newFileHere"),run:()=>void Te(e,r)},{id:"new-folder",label:p("menu.newFolderHere"),run:()=>void Be(e,r)},{id:"paste",label:p("menu.paste"),disabled:z.path===null,run:()=>void vt(e,r)}),r!==n.root&&o.push({id:"rename",label:p("menu.rename"),run:()=>void Xe(e,r)},{id:"cut",label:p("menu.cut"),run:()=>ge(e,r,"cut")},{id:"copy",label:p("menu.copy"),run:()=>ge(e,r,"copy")},{id:"delete",label:p("menu.delete"),run:()=>void Ze(e,r,!0)})),o.push({id:"copy-path",label:p("menu.copyPath"),run:()=>void Ce(r)}),o}function Xt(t){return[{id:"reveal",label:p("menu.reveal"),run:()=>he(t.path)},{id:"copy-path",label:p("menu.copyPath"),run:()=>void Ce(t.path)}]}function Ge(t){return t!==null&&typeof t=="object"?t:{}}function ve(t,e){let r=t[e];return typeof r=="string"?r:""}function Zt(t){let e=t.line;return typeof e=="number"?e:void 0}function bt(t){let e=[{id:"dsh-files-desk/file",target:"file",order:70,resolve:r=>{let n=Ge(r);return Kt({sessionId:ve(n,"sessionId"),path:ve(n,"path"),line:Zt(n)})}},{id:"dsh-files-desk/directory",target:"directory",order:70,resolve:r=>{let n=Ge(r);return qt({sessionId:ve(n,"sessionId"),path:ve(n,"path")})}},{id:"dsh-files-desk/image",target:"image",order:70,resolve:r=>Xt({path:ve(Ge(r),"path")})}];for(let r of e)t.effect(()=>t.contextMenus.register(r),`dsh-files-desk: ${r.target} menu`)}var V=require("react");var b=require("react/jsx-runtime");function Gt({t,data:e}){let[r,n]=(0,V.useState)(e.initial),[o,c]=(0,V.useState)(null),[l,u]=(0,V.useState)(!1),w=(0,V.useRef)(null);(0,V.useEffect)(()=>{w.current?.focus(),w.current?.select()},[]);let x=i=>{G.patch({prompt:null}),e.resolve(i)},d=async()=>{let i=r.trim();if(!(i===""||l)){u(!0),c(null);try{await e.submit(i),G.patch({prompt:null}),e.resolve(i)}catch(O){c(t(K(T(O)))),u(!1)}}};return(0,b.jsx)("div",{className:"fdp-scrim",role:"presentation",onPointerDown:i=>{i.target===i.currentTarget&&!l&&x(null)},children:(0,b.jsxs)("div",{className:"fdp-dialog",role:"dialog","aria-modal":"true","aria-label":e.title,onKeyDown:i=>{i.key==="Escape"&&!l&&x(null)},children:[(0,b.jsx)("div",{className:"fdp-dialog-head",children:e.title}),(0,b.jsxs)("label",{className:"fdp-field",children:[(0,b.jsx)("span",{className:"fdp-field-label",children:e.label}),(0,b.jsx)("input",{ref:w,className:"fdp-input",value:r,spellCheck:!1,onChange:i=>{n(i.target.value),c(null)},onKeyDown:i=>{i.key==="Enter"&&(i.preventDefault(),d())}})]}),o===null?null:(0,b.jsx)("p",{className:"fdp-field-error",children:o}),(0,b.jsxs)("div",{className:"fdp-dialog-actions",children:[(0,b.jsx)("button",{type:"button",className:"fdp-button",disabled:l,onClick:()=>x(null),children:t("action.cancel")}),(0,b.jsx)("button",{type:"button",className:"fdp-button fdp-button-primary",disabled:l||r.trim()==="",onClick:()=>void d(),children:l?"...":e.confirmLabel})]})]})})}function Vt({t,data:e}){let r=n=>{G.patch({confirm:null}),e.resolve(n)};return(0,b.jsx)("div",{className:"fdp-scrim",role:"presentation",onPointerDown:n=>{n.target===n.currentTarget&&r(!1)},children:(0,b.jsxs)("div",{className:"fdp-dialog",role:"dialog","aria-modal":"true","aria-label":e.title,onKeyDown:n=>{n.key==="Escape"&&r(!1)},children:[(0,b.jsx)("div",{className:"fdp-dialog-head",children:e.title}),(0,b.jsx)("p",{className:"fdp-dialog-message",children:e.message}),(0,b.jsxs)("div",{className:"fdp-dialog-actions",children:[(0,b.jsx)("button",{type:"button",className:"fdp-button",onClick:()=>r(!1),children:t("action.cancel")}),(0,b.jsx)("button",{type:"button",className:e.danger===!0?"fdp-button fdp-button-danger":"fdp-button fdp-button-primary",onClick:()=>r(!0),children:e.confirmLabel})]})]})})}function yt({t}){let e=(0,V.useSyncExternalStore)(G.subscribe,G.getSnapshot),r=e.toast;return e.prompt===null&&e.confirm===null&&r===null?null:(0,b.jsxs)("div",{className:"fdp-overlay-root","data-dsh-files-overlay":"",children:[e.prompt===null?null:(0,b.jsx)(Gt,{t,data:e.prompt}),e.confirm===null?null:(0,b.jsx)(Vt,{t,data:e.confirm}),r===null?null:(0,b.jsx)("div",{className:r.tone==="error"?"fdp-toast fdp-toast-error":"fdp-toast",role:"status",children:r.text})]})}function Le({t,onReload:e,onOverwrite:r}){return(0,b.jsxs)("div",{className:"fdp-conflict",role:"alert",children:[(0,b.jsxs)("div",{className:"fdp-conflict-text",children:[(0,b.jsx)("strong",{children:t("conflict.title")}),(0,b.jsx)("span",{children:t("conflict.body")})]}),(0,b.jsxs)("div",{className:"fdp-conflict-actions",children:[(0,b.jsx)("button",{type:"button",className:"fdp-button",onClick:e,children:t("action.reload")}),(0,b.jsx)("button",{type:"button",className:"fdp-button",onClick:r,children:t("action.overwrite")})]})]})}var wt=rt(require("react"),1),se=require("react/jsx-runtime"),be=class extends wt.default.Component{constructor(e){super(e),this.state={failed:!1}}static getDerivedStateFromError(){return{failed:!0}}render(){return this.state.failed?(0,se.jsx)("section",{className:"fdp-root","data-dsh-files":"",children:(0,se.jsxs)("div",{className:"fdp-empty",children:[(0,se.jsx)("p",{className:"fdp-empty-title",children:this.props.title}),(0,se.jsx)("p",{className:"fdp-empty-hint",children:this.props.hint}),(0,se.jsx)("button",{type:"button",className:"fdp-button",onClick:()=>window.location.reload(),children:this.props.reloadLabel})]})}):this.props.children}};var F=require("react");var xt=require("react");function Oe({sessionId:t,useSessions:e,useWorkspaces:r}){let n=r(c=>c.items),o=e(c=>c.byId[t]);return(0,xt.useMemo)(()=>{let c=typeof o?.cwd=="string"?o.cwd:null,l=n.find(u=>u.sessionIds?.includes(t))??n.find(u=>c!==null&&(c===u.path||c.startsWith(`${u.path}/`)))??null;return{session:o,workspace:l,root:c??l?.path??null,workspaceId:l?.workspaceId??null}},[n,o,t])}var R=require("react");var ye=require("react/jsx-runtime"),Ve=null;function Yt(){if(Ve===null){let t=globalThis.__dshFilesDeskRequireAsync;if(typeof t!="function")throw new Error("The editor chunk loader is unavailable.");Ve=t("./client.editor.js")}return Ve}function Jt(t){return{code:T(t),message:t instanceof Error?t.message:String(t)}}function je(t){let{workspaceId:e,path:r,initialText:n,version:o,readOnly:c,wrap:l,tabSize:u,line:w}=t,x=(0,R.useRef)(null),d=(0,R.useRef)(null),i=(0,R.useRef)(n),O=(0,R.useRef)(n),v=(0,R.useRef)(o),P=(0,R.useRef)(!1),$=(0,R.useRef)(!1),H=(0,R.useRef)(!1),C=(0,R.useRef)(void 0),f=(0,R.useRef)(t),A=(0,R.useRef)(null),[ne,j]=(0,R.useState)(!1);f.current=t;async function m(h,E){if(f.current.readOnly||$.current)return!1;$.current=!0,f.current.onStatus?.("saving");try{let S=await N("write",{workspaceId:f.current.workspaceId,path:f.current.path,text:h,version:E??v.current??"",eol:f.current.eol,bom:f.current.bom});return v.current=S.version,O.current=h,i.current=h,P.current=!1,H.current=!1,f.current.onDirty?.(!1),f.current.onSaved?.(S.version),f.current.onStatus?.("saved"),!0}catch(S){return T(S)==="files/conflict"?(H.current=!0,f.current.onStatus?.("conflict")):(f.current.onStatus?.("error",Jt(S)),f.current.onError?.(S)),!1}finally{$.current=!1}}A.current=m;async function X(){try{let h=await N("read",{workspaceId:f.current.workspaceId,path:f.current.path});v.current=h.version,O.current=h.text,i.current=h.text,P.current=!1,H.current=!1,d.current?.setText(h.text),f.current.onSaved?.(h.version),f.current.onDirty?.(!1),f.current.onStatus?.("clean")}catch(h){f.current.onError?.(h)}}async function oe(){try{let h=await N("stat",{workspaceId:f.current.workspaceId,path:f.current.path});await m(d.current?.getText()??i.current,h.version)}catch(h){f.current.onError?.(h)}}function ee(h){i.current=h,f.current.onChange?.(h);let E=h!==O.current;E!==P.current&&(P.current=E,f.current.onDirty?.(E),E||f.current.onStatus?.("clean")),f.current.autoSave&&E&&H.current===!1&&(clearTimeout(C.current),C.current=setTimeout(()=>{let S=d.current;S!==null&&A.current?.(S.getText())},800))}return(0,R.useEffect)(()=>{let h=!1;return j(!1),Yt().then(E=>{if(h||x.current===null)return;let S=E.createEditor({parent:x.current,doc:i.current,language:de(r),readOnly:c,wrap:l,tabSize:u,line:w,onChange:ee,onCursor:Y=>f.current.onCursor?.(Y),onSave:()=>{let Y=d.current;Y!==null&&A.current?.(Y.getText())}});d.current=S;let B={save:()=>A.current?.(S.getText()),reload:X,overwrite:oe,focus:S.focus,revealLine:S.revealLine,getText:S.getText};f.current.onApi?.(B),f.current.onStatus?.(P.current?"dirty":"clean");let Z=f.current.line;typeof Z=="number"&&Z>0&&S.revealLine(Z)}).catch(()=>{h||j(!0)}),()=>{h=!0,clearTimeout(C.current),d.current?.destroy(),d.current=null}},[r,l,c,u]),(0,R.useEffect)(()=>{typeof w=="number"&&w>0&&d.current!==null&&d.current.revealLine(w)},[w]),(0,R.useEffect)(()=>{if(c)return;let h=setInterval(()=>{$.current||(async()=>{try{if((await N("stat",{workspaceId:e,path:r})).version===v.current)return;if(P.current){H.current||(H.current=!0,f.current.onStatus?.("conflict"));return}await X()}catch{}})()},3e3);return()=>clearInterval(h)},[e,r,c]),(0,ye.jsxs)("div",{className:"fdp-editor-host",children:[(0,ye.jsx)("div",{ref:x,className:"fdp-editor-mount","data-fdp-editor":r}),ne?(0,ye.jsx)("p",{className:"fdp-note",children:p("error.generic")}):null]})}var Ar=require("react"),y=require("react/jsx-runtime");function Q({children:t,size:e=16}){return(0,y.jsx)("svg",{width:e,height:e,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true",focusable:"false",children:t})}function kt(){return(0,y.jsxs)(Q,{children:[(0,y.jsx)("path",{d:"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"}),(0,y.jsx)("path",{d:"M14 3v5h5"}),(0,y.jsx)("path",{d:"M17 15v6M14 18h6"})]})}function St(){return(0,y.jsxs)(Q,{children:[(0,y.jsx)("path",{d:"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"}),(0,y.jsx)("path",{d:"M12 11v6M9 14h6"})]})}function It(){return(0,y.jsxs)(Q,{children:[(0,y.jsx)("path",{d:"M20 11a8 8 0 1 0-2.3 5.7"}),(0,y.jsx)("path",{d:"M20 4v7h-7"})]})}function We(){return(0,y.jsxs)(Q,{children:[(0,y.jsx)("path",{d:"M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"}),(0,y.jsx)("path",{d:"M17 21v-8H7v8M7 3v5h8"})]})}function Me(){return(0,y.jsxs)(Q,{children:[(0,y.jsx)("path",{d:"M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"}),(0,y.jsx)("circle",{cx:"12",cy:"12",r:"3"})]})}function Pt(){return(0,y.jsx)(Q,{size:14,children:(0,y.jsx)("path",{d:"M18 6 6 18M6 6l12 12"})})}function we(){return(0,y.jsx)(Q,{children:(0,y.jsx)("path",{d:"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"})})}function Ae(){return(0,y.jsxs)(Q,{children:[(0,y.jsx)("path",{d:"M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z"}),(0,y.jsx)("path",{d:"M14 3v5h5"})]})}function Et(){return(0,y.jsxs)(Q,{children:[(0,y.jsx)("path",{d:"M3 6h18M3 12h13a3 3 0 0 1 0 6h-3"}),(0,y.jsx)("path",{d:"m15 15-3 3 3 3"}),(0,y.jsx)("path",{d:"M3 18h6"})]})}var a=require("react/jsx-runtime"),Qt={fallback:null},er=new Set(["files/binary","files/too-large","files/not-utf8"]);function tr({path:t,root:e}){let r=t.replace(/\\/g,"/"),n=r.lastIndexOf("/"),o=n<0?"":r.slice(0,n+1),c=n<0?r:r.slice(n+1),l=e!==null&&o.startsWith(e)?o.slice(e.length):o;return l==="/"&&(l=""),(0,a.jsxs)("span",{className:"fdp-path",title:t,children:[l===""?null:(0,a.jsx)("span",{className:"fdp-path-dir",children:l}),(0,a.jsx)("span",{className:"fdp-path-name",children:c})]})}function xe({label:t,onClick:e,children:r,pressed:n}){return(0,a.jsx)("button",{type:"button",className:"fdp-icon-button","aria-label":t,title:t,"aria-pressed":n,onClick:e,children:r})}function Ye(t){let{t:e,useTabInfo:r,useSessions:n,useWorkspaces:o,useContextMenu:c,renderFactorySlot:l,sessionId:u}=t,{tab:w,panel:x}=r(),d=(0,F.useMemo)(()=>ut(x.id),[x.id]),i=(0,F.useSyncExternalStore)(d.subscribe,d.getSnapshot),O=Oe({sessionId:u,useSessions:n,useWorkspaces:o}),v=O.root,P=O.workspaceId,[$,H]=(0,F.useState)({line:1,column:1}),[C,f]=(0,F.useState)(null),A=(0,F.useRef)(null);(0,F.useEffect)(()=>{v!==null&&P!==null&&d.init(u,P,v)},[d,u,P,v]),(0,F.useEffect)(()=>{v!==null&&P!==null&&M.set(u,{sessionId:u,workspaceId:P,root:v.replace(/\/+$/,""),store:d})},[u,P,v,d]);let ne=w.navigation?.params?.path,j=w.navigation?.revision;(0,F.useEffect)(()=>{typeof ne=="string"&&ne!==""&&i.root!==null&&d.reveal(ne).catch(s=>{q(e(K(T(s))),"error")})},[j,i.root]);let m=i.buffers.find(s=>s.path===i.activePath)??null,X=(0,F.useCallback)(async s=>{if(fe(s)){J(u,s);return}try{await d.openFile(s)}catch(k){let L=T(k);L!==void 0&&er.has(L)?J(u,s):q(e(K(L)),"error")}},[u,d,e]),oe=(0,F.useMemo)(()=>{let s=[];for(let[k,L]of Object.entries(i.levels))if(L.status==="ready")for(let _ of L.entries)s.push({path:`${k.replace(/\/+$/,"")}/${_.name}`,name:_.name,meta:{kind:_.type==="directory"?"directory":_.type==="file"?"file":"other"}});return s},[i.levels]),ee=(0,F.useMemo)(()=>{let s={},k=new Set;i.root!==null&&k.add(i.root);for(let L of i.expanded)k.add(L);for(let L of k){if(L==="")continue;let _=L.replace(/\/+$/,""),ae=i.levels[L];ae===void 0||ae.status==="loading"?s[_]={loading:!0}:ae.status==="failed"?s[_]={failure:e("tree.failed")}:s[_]=ae.truncated===!0?{truncated:!0}:{}}return s},[i.levels,i.expanded,i.root,e]),E=(typeof c=="function"?c():null)?.getTriggerProps,S=(0,F.useMemo)(()=>({root:i.root===null?"":i.root.replace(/\/+$/,""),entries:oe,expanded:i.expanded,onToggle:(s,k)=>d.toggle(s.path,k),onOpen:s=>{X(s.path)},directories:ee,current:m?.path,rowTriggerProps:(s,k)=>typeof E=="function"?E(k==="directory"?{kind:"directory",value:{sessionId:u,path:s.path}}:{kind:"file",value:{sessionId:u,path:s.path,paneId:x.id}}):{}}),[i.root,oe,i.expanded,ee,m?.path,E,u,x.id,d,X]),B=async s=>{let k=d.buffer(s);k!==void 0&&s===i.activePath&&(k.status==="dirty"||k.status==="conflict")&&await A.current?.save(),d.closeBuffer(s)},Z=()=>{A.current?.save()},Y=C??i.treeWidth,ke=m===null?i.root:ie(m.path),Tt=s=>{if(s.button!==0)return;s.preventDefault();let k=s.clientX,L=i.treeWidth,_=Se=>f(Math.max(180,Math.min(560,L+Se.clientX-k))),ae=()=>{window.removeEventListener("pointermove",_),window.removeEventListener("pointerup",ae),f(Se=>(Se!==null&&d.setTreeWidth(Se),null))};window.addEventListener("pointermove",_),window.addEventListener("pointerup",ae)};return v===null||P===null?(0,a.jsx)("section",{className:"fdp-root","data-dsh-files":"",children:(0,a.jsxs)("div",{className:"fdp-empty",children:[(0,a.jsx)(we,{}),(0,a.jsx)("p",{className:"fdp-empty-title",children:e("empty.noRoot")}),(0,a.jsx)("p",{className:"fdp-empty-hint",children:e("empty.noRootHint")})]})}):(0,a.jsxs)("section",{className:"fdp-root","data-dsh-files":"",children:[(0,a.jsxs)("header",{className:"fdp-header",children:[(0,a.jsx)("div",{className:"fdp-heading",children:m===null?(0,a.jsxs)("span",{className:"fdp-path",title:i.root??"",children:[(0,a.jsx)(we,{}),(0,a.jsx)("span",{className:"fdp-path-name",children:i.root===null?e("empty.noRoot"):I(i.root)})]}):(0,a.jsx)(tr,{path:m.path,root:v})}),(0,a.jsxs)("div",{className:"fdp-actions",children:[m!==null&&m.status!=="clean"&&m.status!=="saved"?(0,a.jsx)(xe,{label:e("action.save"),onClick:Z,children:(0,a.jsx)(We,{})}):null,m!==null?(0,a.jsx)(xe,{label:e("action.preview"),onClick:()=>J(u,m.path),children:(0,a.jsx)(Me,{})}):null,(0,a.jsx)(xe,{label:e("action.newFile"),onClick:()=>{ke!==null&&Te(u,ke)},children:(0,a.jsx)(kt,{})}),(0,a.jsx)(xe,{label:e("action.newFolder"),onClick:()=>{ke!==null&&Be(u,ke)},children:(0,a.jsx)(St,{})}),(0,a.jsx)(xe,{label:e("action.refresh"),onClick:()=>d.refresh(),children:(0,a.jsx)(It,{})})]})]}),(0,a.jsxs)("div",{className:"fdp-body",children:[(0,a.jsx)("aside",{className:"fdp-tree",style:{width:`${Y}px`},children:(0,a.jsx)("div",{className:"fdp-tree-scroll",children:i.root===null?(0,a.jsx)("p",{className:"fdp-note",children:e("tree.loading")}):typeof l=="function"?l("sidebar.files.tree",S,Qt)??(0,a.jsx)("p",{className:"fdp-note",children:e("tree.unavailable")}):(0,a.jsx)("p",{className:"fdp-note",children:e("tree.unavailable")})})}),(0,a.jsx)("div",{className:"fdp-divider",role:"separator","aria-orientation":"vertical","aria-label":e("action.refresh"),"aria-valuenow":Y,tabIndex:0,onPointerDown:Tt,onKeyDown:s=>{s.key==="ArrowLeft"?d.setTreeWidth(Y-16):s.key==="ArrowRight"&&d.setTreeWidth(Y+16)}}),(0,a.jsxs)("main",{className:"fdp-main",children:[i.buffers.length>0?(0,a.jsx)("div",{className:"fdp-tabs",role:"tablist",children:i.buffers.map(s=>{let k=s.path===i.activePath,L=s.status==="dirty"||s.status==="conflict";return(0,a.jsxs)("div",{className:k?"fdp-tab fdp-tab-active":"fdp-tab",role:"presentation",children:[(0,a.jsxs)("button",{type:"button",role:"tab","aria-selected":k,className:"fdp-tab-main",title:s.path,onClick:()=>d.setActive(s.path),children:[(0,a.jsx)("span",{className:"fdp-tab-name",children:I(s.path)}),L?(0,a.jsx)("span",{className:s.status==="conflict"?"fdp-dot fdp-dot-warn":"fdp-dot","aria-hidden":"true"}):null]}),(0,a.jsx)("button",{type:"button",className:"fdp-tab-close","aria-label":e("tab.close",{name:I(s.path)}),title:e("tab.close",{name:I(s.path)}),onClick:()=>{B(s.path)},children:(0,a.jsx)(Pt,{})})]},s.path)})}):null,m===null?(0,a.jsxs)("div",{className:"fdp-empty",children:[(0,a.jsx)(Ae,{}),(0,a.jsx)("p",{className:"fdp-empty-title",children:e("empty.select")}),(0,a.jsx)("p",{className:"fdp-empty-hint",children:e("empty.selectHint")})]}):(0,a.jsxs)(a.Fragment,{children:[m.status==="conflict"?(0,a.jsx)(Le,{t:e,onReload:()=>{A.current?.reload()},onOverwrite:()=>{A.current?.overwrite()}}):null,(0,a.jsx)(je,{workspaceId:P,path:m.path,initialText:m.text,version:m.version,eol:m.eol,bom:m.bom,readOnly:m.readOnly,wrap:i.wrap,tabSize:2,line:typeof w.navigation?.params?.line=="number"?w.navigation.params.line:void 0,autoSave:i.autoSave,onChange:s=>d.setBufferText(m.path,s),onDirty:s=>d.setBufferStatus(m.path,s?"dirty":"clean"),onStatus:(s,k)=>d.setBufferStatus(m.path,s,k??null),onSaved:s=>d.updateBuffer(m.path,{version:s,status:"clean"}),onCursor:H,onError:s=>q(e(K(T(s))),"error"),onApi:s=>{A.current=s}},`${m.path}:${i.wrap}`)]}),(0,a.jsxs)("footer",{className:"fdp-status",children:[(0,a.jsx)("span",{className:"fdp-status-left",children:m===null?"":e("status.encoding")}),(0,a.jsx)("span",{className:"fdp-status-right",children:m===null?null:(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)("span",{children:`${$.line}:${$.column}`}),(0,a.jsx)("span",{children:de(m.path)}),(0,a.jsx)("span",{children:m.eol==="crlf"?e("status.crlf"):e("status.lf")}),(0,a.jsx)("span",{className:m.status==="conflict"||m.status==="error"?"fdp-status-warn":"",children:mt(m.status)}),(0,a.jsx)("button",{type:"button",className:"fdp-icon-button","aria-label":e("action.wrap"),title:e("action.wrap"),"aria-pressed":i.wrap,onClick:()=>d.toggleWrap(),children:(0,a.jsx)(Et,{})})]})})]})]})]})]})}var te=require("react");var g=require("react/jsx-runtime"),rr=new Set(["files/binary","files/too-large","files/not-utf8"]);function Je(t){let{t:e,sessionId:r,useTabInfo:n,useSessions:o,useWorkspaces:c}=t,{tab:l}=n(),u=le(l.contentId??l.navigation?.address),w=u?.sessionId??r,x=Oe({sessionId:w,useSessions:o,useWorkspaces:c}),d=x.root,i=x.workspaceId,O=u?.path??"",v=O===""?"":pe(O)?W(O):d===null?O:U(d,O),P=l.navigation?.params?.line,$=typeof P=="number"?P:void 0,H=d===null||v===""?!0:!ue(d,v),[C,f]=(0,te.useState)({status:"loading"}),[A,ne]=(0,te.useState)({line:1,column:1}),[j,m]=(0,te.useState)("clean"),X=(0,te.useRef)(null);(0,te.useEffect)(()=>{let B=!1;return i===null||v===""?(f({status:"failed",error:{code:"files/no-workspace",message:"No workspace."}}),()=>{B=!0}):(f({status:"loading"}),N("read",{workspaceId:i,path:v}).then(Z=>{B||f({status:"ready",file:Z})}).catch(Z=>{B||f({status:"failed",error:{code:T(Z),message:String(Z)}})}),()=>{B=!0})},[i,v,l.id]);let oe=v===""?"":I(v),ee=v.slice(0,v.length-oe.length),h=d!==null&&ee.startsWith(d)?ee.slice(d.length):ee;h==="/"&&(h="");let E=C.status==="failed"?C.error.code:void 0,S=fe(v)||E!==void 0&&rr.has(E);return(0,g.jsxs)("section",{className:"fdp-root fdp-editor-tab","data-dsh-files":"",children:[(0,g.jsxs)("header",{className:"fdp-header",children:[(0,g.jsx)("div",{className:"fdp-heading",children:(0,g.jsxs)("span",{className:"fdp-path",title:v,children:[h===""?null:(0,g.jsx)("span",{className:"fdp-path-dir",children:h}),(0,g.jsx)("span",{className:"fdp-path-name",children:oe})]})}),(0,g.jsxs)("div",{className:"fdp-actions",children:[C.status==="ready"&&j!=="clean"&&j!=="saved"?(0,g.jsx)("button",{type:"button",className:"fdp-icon-button","aria-label":e("action.save"),title:e("action.save"),onClick:()=>{X.current?.save()},children:(0,g.jsx)(We,{})}):null,(0,g.jsx)("button",{type:"button",className:"fdp-icon-button","aria-label":e("action.preview"),title:e("action.preview"),onClick:()=>J(w,v,$),children:(0,g.jsx)(Me,{})})]})]}),C.status==="loading"?(0,g.jsx)("div",{className:"fdp-empty",children:(0,g.jsx)("p",{className:"fdp-empty-hint",children:e("empty.loading")})}):null,C.status==="failed"?(0,g.jsxs)("div",{className:"fdp-empty",children:[(0,g.jsx)("p",{className:"fdp-empty-title",children:e(K(E))}),S?(0,g.jsx)("button",{type:"button",className:"fdp-button",onClick:()=>J(w,v,$),children:e("action.preview")}):null,i===null?null:(0,g.jsx)("button",{type:"button",className:"fdp-button",onClick:()=>he(v),children:e("action.reveal")})]}):null,C.status==="ready"?(0,g.jsxs)(g.Fragment,{children:[j==="conflict"?(0,g.jsx)(Le,{t:e,onReload:()=>{X.current?.reload()},onOverwrite:()=>{X.current?.overwrite()}}):null,(0,g.jsx)(je,{workspaceId:i,path:v,initialText:C.file.text,version:C.file.version,eol:C.file.eol,bom:C.file.bom,readOnly:H,wrap:!1,tabSize:2,line:$,autoSave:!0,onDirty:B=>m(B?"dirty":"clean"),onStatus:B=>m(B),onSaved:()=>m("clean"),onCursor:ne,onError:B=>q(e(K(T(B))),"error"),onApi:B=>{X.current=B}}),(0,g.jsxs)("footer",{className:"fdp-status",children:[(0,g.jsx)("span",{className:"fdp-status-left",children:e(H?"status.readOnly":"status.encoding")}),(0,g.jsxs)("span",{className:"fdp-status-right",children:[(0,g.jsx)("span",{children:`${A.line}:${A.column}`}),(0,g.jsx)("span",{children:de(v)}),(0,g.jsx)("span",{children:C.file.eol==="crlf"?e("status.crlf"):e("status.lf")}),(0,g.jsx)("span",{className:j==="conflict"||j==="error"?"fdp-status-warn":"",children:j==="saving"?e("status.saving"):j==="conflict"?e("status.conflict"):j==="error"?e("status.error"):j==="dirty"?e("status.unsaved"):""})]})]})]}):null]})}var Nt="dsh-files-desk/styles",nr=`
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
`;function Rt(){if(typeof document>"u"||document.querySelector(`style[data-plugin-css="${Nt}"]`)!==null)return;let t=document.createElement("style");t.dataset.plugin="dsh-files-desk",t.dataset.pluginCss=Nt,t.textContent=nr,document.head.appendChild(t)}var D=Ft.default.createElement,re="files",Qe="dsh-files-desk",et="dsh-files-desk/editor",or=["connection","slots","locale","sidebarRightTabs","sidebarRight","contextMenus"];function Ct({icon:t,text:e}){return D("span",{className:"fdp-chip"},t,D("span",null,e))}function ar(){return D("svg",{viewBox:"0 0 24 24",width:22,height:22,fill:"none",stroke:"currentColor",strokeWidth:1.7,strokeLinecap:"round",strokeLinejoin:"round","aria-hidden":"true"},D("path",{d:"M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"}),D("path",{d:"M10 12l-2 2 2 2M14 12l2 2-2 2"}))}function ir(t){return D(be,{title:t.t("error.surface"),hint:t.t("error.surfaceHint"),reloadLabel:t.t("action.reload")},D(Ye,t))}function sr(t){return D(be,{title:t.t("error.surface"),hint:t.t("error.surfaceHint"),reloadLabel:t.t("action.reload")},D(Je,t))}function lr({t}){return D(Ct,{icon:D(we,{size:14}),text:t("panel")})}function dr({useTabInfo:t}){let{tab:e}=t(),r=le(e.contentId??e.navigation?.address);return D(Ct,{icon:D(Ae,{size:14}),text:r===void 0?"":I(r.path)})}function cr(t){Rt(),nt(t),ce.sidebarRight=t.sidebarRight,t.locale.register(re,"en",at),t.locale.register(re,"zh",it);let e=(r,n)=>t.locale.bind(re)(r,n);st(e),t.effect(()=>t.sidebarRightTabs.register({id:Qe,kind:"files",priority:"extension",keepMounted:!0,title:()=>e("panel"),guide:[{id:"workspace",order:10,commandId:"workspace.files",title:()=>e("guide.title"),description:()=>e("guide.description"),icon:ar}]}),"dsh-files-desk: files tab type"),t.effect(()=>t.sidebarRightTabs.register({id:et,kind:"editor",priority:"extension",patterns:["dsh-resource://file/**"],canOpen:r=>ot(r),title:r=>{let n=le(r);return n===void 0?"":I(n.path)}}),"dsh-files-desk: editor tab type"),t.slots.inject("sidebar.right.pane.tab",()=>t.slots.register({name:"sidebar.right.pane.tab",key:Qe,locale:re,inject:()=>({t:e})},ir)),t.slots.inject("sidebar.right.pane.tab",()=>t.slots.register({name:"sidebar.right.pane.tab",key:et,locale:re,inject:()=>({t:e})},sr)),t.slots.inject("sidebar.right.pane.tab.title",()=>t.slots.register({name:"sidebar.right.pane.tab.title",key:Qe,locale:re,inject:()=>({t:e})},lr)),t.slots.inject("sidebar.right.pane.tab.title",()=>t.slots.register({name:"sidebar.right.pane.tab.title",key:et,locale:re,inject:()=>({t:e})},dr)),t.slots.inject("shell.overlay",()=>t.slots.register({name:"shell.overlay",id:"dsh-files-ops",locale:re,inject:()=>({t:e})},yt)),bt(t)}

    return module.exports;
  },
});
