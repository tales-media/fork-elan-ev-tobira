(()=>{"use strict";var e={152:function(e,o,r){var t=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(o,"__esModule",{value:true});o.runServer=void 0;const s=t(r(685));const n=t(r(477));const a=r(837);const runServer=async e=>new Promise(((o,r)=>{var t;const n=(t=e.listen)!==null&&t!==void 0?t:{host:"127.0.0.1",port:3091};const a=s.default.createServer(((o,r)=>{listener(o,r,e).then((()=>r.end())).catch((e=>{if(e instanceof ErrorResponse){r.writeHead(e.code);if(e.body){r.write(e.body)}}else{r.writeHead(l.INTERNAL_SERVER_ERROR);r.write("Internal server error")}r.end()}))}));a.on("listening",(()=>{if(e.onListen==null){console.log("Listening on: ",n)}else{e.onListen()}}));a.on("error",r);a.on("close",o);if("socketPath"in n){a.listen(n.socketPath)}else{a.listen(n.port,n.host)}}));o.runServer=runServer;const i="userid";const c="password";class ErrorResponse{constructor(e,o){this.code=e;this.body=o}}const listener=async(e,o,{check:r,tobira:t})=>{var d;if(e.method!=="POST"){throw new ErrorResponse(l.METHOD_NOT_ALLOWED)}if(!((d=e.headers["content-type"])===null||d===void 0?void 0:d.startsWith("application/x-www-form-urlencoded"))){throw new ErrorResponse(l.BAD_REQUEST,"incorrect content type")}const u=await downloadBody(e);const _=new a.TextDecoder("utf8",{fatal:true});let p;try{p=_.decode(u)}catch(e){throw new ErrorResponse(l.BAD_REQUEST,"Request body is not valid UTF-8")}const E=n.default.parse(p);const[R,f]=[i,c].map((e=>{const o=E[e];if(typeof o==="string"){return o}else{if((o===null||o===void 0?void 0:o.length)!==1){throw new ErrorResponse(l.BAD_REQUEST,`field ${e} not present exactly once`)}return o[0]}}));let O;try{O=await r({userid:R,password:f})}catch(e){console.error("Login check threw an exception: ",e);o.writeHead(l.INTERNAL_SERVER_ERROR);return}if(O==="forbidden"){o.writeHead(l.FORBIDDEN)}else{const{username:e,displayName:r,roles:n,email:a}=O;const b64encode=e=>Buffer.from(e).toString("base64");let i;try{i=await new Promise(((o,i)=>{const c={...t!==null&&t!==void 0?t:{host:"localhost",port:3080},path:"/~session",method:"POST",headers:{"x-tobira-username":b64encode(e),"x-tobira-user-display-name":b64encode(r),"x-tobira-user-roles":b64encode(n.join(",")),...a&&{"x-tobira-user-email":b64encode(a)}}};const l=s.default.request(c);l.on("response",o);l.on("error",i);l.end()}))}catch(e){console.error("Failed to create user session:",e);o.writeHead(l.BAD_GATEWAY);return}if(i.statusCode!==l.NO_CONTENT){console.warn("unexpected status code from 'POST /~session'")}o.writeHead(l.NO_CONTENT,{"set-cookie":i.headers["set-cookie"]})}};const downloadBody=async e=>new Promise(((o,r)=>{const t=[];e.on("data",(e=>t.push(e)));e.on("end",(()=>o(Buffer.concat(t))));e.on("error",r)}));const l={NO_CONTENT:204,BAD_REQUEST:400,FORBIDDEN:403,METHOD_NOT_ALLOWED:405,INTERNAL_SERVER_ERROR:500,BAD_GATEWAY:502}},177:function(e,o,r){var t=this&&this.__importDefault||function(e){return e&&e.__esModule?e:{default:e}};Object.defineProperty(o,"__esModule",{value:true});const s=t(r(292));const n=r(152);const main=async()=>{let e;let o;if(process.argv[2]){const r=process.argv[2];const t=`/opt/tobira/${r}/socket/auth.sock`;const n=`/opt/tobira/${r}/socket/tobira.sock`;await s.default.rm(t,{force:true});e={socketPath:t};o={socketPath:n}}else{e={host:"0.0.0.0",port:3091};o={host:"host.docker.internal",port:3080}}process.on("SIGTERM",(()=>process.exit(0)));try{await(0,n.runServer)({listen:e,tobira:o,check:check,onListen:()=>{console.log("Listening on:",e);if("socketPath"in e){s.default.chmod(e.socketPath,511).catch((e=>console.warn("could not chmod socket file",e)))}}})}catch(e){console.log(e)}};const check=async({userid:e,password:o})=>{const r=i[e];return o===a&&r?{username:e,displayName:r.displayName,roles:r.roles.concat(["ROLE_ANONYMOUS","ROLE_USER"]),email:r.email}:"forbidden"};const a="tobira";const i={admin:{displayName:"Administrator",roles:["ROLE_ADMIN","ROLE_USER_ADMIN","ROLE_SUDO"],email:"admin@example.org"},sabine:{displayName:"Sabine Rudolfs",roles:["ROLE_USER_SABINE","ROLE_INSTRUCTOR","ROLE_TOBIRA_MODERATOR"],email:"sabine@example.org"},"björk":{displayName:"Prof. Björk Guðmundsdóttir",roles:["ROLE_USER_BJÖRK","ROLE_EXTERNAL","ROLE_TOBIRA_MODERATOR"],email:"bjoerk@example.org"},morgan:{displayName:"Morgan Yu",roles:["ROLE_USER_MORGAN","ROLE_STUDENT","ROLE_TOBIRA_UPLOAD"],email:"morgan@example.org"},jose:{displayName:"José Carreño Quiñones",roles:["ROLE_USER_JOSE","ROLE_STUDENT"]}};main()},292:e=>{e.exports=require("fs/promises")},685:e=>{e.exports=require("http")},477:e=>{e.exports=require("querystring")},837:e=>{e.exports=require("util")}};var o={};function __nccwpck_require__(r){var t=o[r];if(t!==undefined){return t.exports}var s=o[r]={exports:{}};var n=true;try{e[r].call(s.exports,s,s.exports,__nccwpck_require__);n=false}finally{if(n)delete o[r]}return s.exports}if(typeof __nccwpck_require__!=="undefined")__nccwpck_require__.ab=__dirname+"/";var r=__nccwpck_require__(177);module.exports=r})();