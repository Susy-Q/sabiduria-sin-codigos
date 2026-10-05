const storageKey="id-course-local-students-v1";
const sessionKey="id-course-browser-session";
let lang=localStorage.getItem("id-course-language")||"en";

const accessibilityStyles=document.createElement("link");
accessibilityStyles.rel="stylesheet";
accessibilityStyles.href="accesibilidad.css";
document.head.appendChild(accessibilityStyles);

function base64ToBytes(value){const binary=atob(value);return Uint8Array.from(binary,character=>character.charCodeAt(0))}
function bytesToBase64(bytes){let binary="";bytes.forEach(byte=>binary+=String.fromCharCode(byte));return btoa(binary)}
async function protectPassword(password,salt){const encoder=new TextEncoder();const key=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveBits"]);const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt,iterations:210000},key,256);return bytesToBase64(new Uint8Array(bits))}
function readStudents(){try{return JSON.parse(localStorage.getItem(storageKey)||"[]")}catch{return []}}
function applyLanguage(){document.documentElement.lang=lang;document.title=lang==="en"?"Sign in | Wisdom Without Code":"Iniciar sesión | Sabiduría Sin Códigos";document.querySelectorAll("[data-en]").forEach(element=>element.textContent=element.dataset[lang]);document.querySelectorAll("[data-placeholder-en]").forEach(element=>element.placeholder=element.dataset["placeholder"+(lang==="en"?"En":"Es")]);document.querySelectorAll("[data-alt-en]").forEach(element=>element.alt=element.dataset["alt"+(lang==="en"?"En":"Es")]);document.querySelectorAll("[data-lang]").forEach(button=>button.classList.toggle("active",button.dataset.lang===lang))}
document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>{lang=button.dataset.lang;localStorage.setItem("id-course-language",lang);applyLanguage()}));
document.getElementById("homeLink").href=location.pathname==="/login"?"/":"index.html";
if(location.pathname==="/login")document.querySelector(".switch a").href="/register";
if(location.pathname==="/login"){
  const reviewerLink=document.createElement("a");
  reviewerLink.id="reviewAccessLink";
  reviewerLink.href="/review";
  reviewerLink.dataset.en="Private reviewer access";
  reviewerLink.dataset.es="Acceso privado del revisor";
  reviewerLink.textContent="Private reviewer access";
  reviewerLink.style.display="block";
  reviewerLink.style.marginTop="12px";
  document.querySelector(".switch").appendChild(reviewerLink);
}
const form=document.getElementById("loginForm"),message=document.getElementById("message"),submitButton=form.querySelector("button[type=submit]");
form.addEventListener("submit",async event=>{event.preventDefault();message.className="message";submitButton.disabled=true;const email=form.email.value.trim().toLowerCase();try{if(location.pathname==="/login"){try{const response=await fetch("/api/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password:form.password.value})});const contentType=response.headers.get("content-type")||"";if(response.ok&&contentType.includes("application/json")){const result=await response.json();location.href=result.redirect||"/course/";return}if(response.status!==404&&contentType.includes("application/json")){await response.json();throw new Error(lang==="en"?"Incorrect email or password.":"El correo o la contraseña son incorrectos.")}}catch(error){if(error.message&&!/fetch|network/i.test(error.message))throw error}}const student=readStudents().find(item=>item.email===email);if(!student)throw new Error(lang==="en"?"Incorrect email or password.":"El correo o la contraseña son incorrectos.");const passwordHash=await protectPassword(form.password.value,base64ToBytes(student.salt));if(passwordHash!==student.passwordHash)throw new Error(lang==="en"?"Incorrect email or password.":"El correo o la contraseña son incorrectos.");sessionStorage.setItem(sessionKey,JSON.stringify({email,startedAt:Date.now()}));location.href="independencia-digital-ia.html"}catch(error){message.textContent=error.message||(lang==="en"?"Sign in could not be completed.":"No se pudo iniciar sesión.");message.className="message error show";submitButton.disabled=false}});
applyLanguage();

const accessibilityScript=document.createElement("script");
accessibilityScript.src="accesibilidad.js";
document.body.appendChild(accessibilityScript);
