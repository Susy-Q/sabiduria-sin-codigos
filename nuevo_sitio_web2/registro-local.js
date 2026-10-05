const storageKey="id-course-local-students-v1";
const sessionKey="id-course-browser-session";
let lang=localStorage.getItem("id-course-language")||"en";

function bytesToBase64(bytes){
  let binary="";
  bytes.forEach(byte=>binary+=String.fromCharCode(byte));
  return btoa(binary);
}

async function protectPassword(password,salt){
  const encoder=new TextEncoder();
  const key=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveBits"]);
  const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt,iterations:210000},key,256);
  return bytesToBase64(new Uint8Array(bits));
}

function readStudents(){
  try{return JSON.parse(localStorage.getItem(storageKey)||"[]")}catch{return []}
}

function applyLanguage(){
  document.documentElement.lang=lang;
  document.title=lang==="en"?"Register | Wisdom Without Code":"Registro | Sabiduría Sin Códigos";
  document.querySelectorAll("[data-en]").forEach(element=>element.textContent=element.dataset[lang]);
  document.querySelectorAll("[data-placeholder-en]").forEach(element=>element.placeholder=element.dataset["placeholder"+(lang==="en"?"En":"Es")]);
  document.querySelectorAll("[data-alt-en]").forEach(element=>element.alt=element.dataset["alt"+(lang==="en"?"En":"Es")]);
  document.querySelectorAll("[data-lang]").forEach(button=>button.classList.toggle("active",button.dataset.lang===lang));
}

document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>{
  lang=button.dataset.lang;
  localStorage.setItem("id-course-language",lang);
  applyLanguage();
}));

document.getElementById("homeLink").href=location.pathname.startsWith("/register")?"/":"index.html";
if(location.pathname==="/register")document.querySelector(".switch a").href="/login";
const form=document.getElementById("registrationForm");
const message=document.getElementById("message");
const submitButton=form.querySelector("button[type=submit]");

form.noValidate=true;
const help=document.createElement("div");
help.className="registration-help";
help.innerHTML='<span aria-hidden="true">📝</span><div><strong data-en="A simple registration" data-es="Un registro sencillo">A simple registration</strong><div data-en="Complete the five fields below. Your phone number remains a required part of your student registration." data-es="Complete los cinco espacios siguientes. El teléfono se mantiene como parte obligatoria de su registro de estudiante.">Complete the five fields below. Your phone number remains a required part of your student registration.</div></div>';
form.before(help);

function addPasswordControl(input){
  const wrapper=document.createElement("div");wrapper.className="password-input-wrap";
  input.parentElement.insertBefore(wrapper,input);wrapper.appendChild(input);
  const button=document.createElement("button");button.type="button";button.className="password-visibility";button.dataset.en="Show";button.dataset.es="Mostrar";button.textContent=button.dataset[lang];button.setAttribute("aria-controls",input.id);button.setAttribute("aria-pressed","false");
  wrapper.appendChild(button);
  button.addEventListener("click",()=>{const visible=input.type==="text";input.type=visible?"password":"text";button.setAttribute("aria-pressed",String(!visible));button.dataset.en=visible?"Show":"Hide";button.dataset.es=visible?"Mostrar":"Ocultar";button.textContent=button.dataset[lang]});
}
addPasswordControl(form.password);addPasswordControl(form.confirm);

const passwordGuidance=document.createElement("div");passwordGuidance.className="password-guidance";passwordGuidance.innerHTML='<span data-en="Use at least 10 characters" data-es="Utilice al menos 10 caracteres">Use at least 10 characters</span><span data-en="Choose a phrase that is easy for you to remember" data-es="Elija una frase que sea fácil de recordar para usted">Choose a phrase that is easy for you to remember</span><span data-en="Do not reuse a banking password" data-es="No reutilice una contraseña bancaria">Do not reuse a banking password</span>';form.password.closest(".field").appendChild(passwordGuidance);

const fieldInputs=[form.fullName,form.phone,form.email,form.password,form.confirm];
fieldInputs.forEach(input=>{const error=document.createElement("p");error.className="field-error";error.id=`${input.id}-error`;error.setAttribute("aria-live","polite");input.closest(".field").appendChild(error);input.setAttribute("aria-describedby",`${input.getAttribute("aria-describedby")||""} ${error.id}`.trim());input.addEventListener("input",()=>{input.removeAttribute("aria-invalid");error.textContent=""})});
function fieldError(input,text){input.setAttribute("aria-invalid","true");document.getElementById(`${input.id}-error`).textContent=text}
function validateRegistration(){
  let firstInvalid=null;
  const set=(input,condition,en,es)=>{if(condition)return;fieldError(input,lang==="es"?es:en);if(!firstInvalid)firstInvalid=input};
  set(form.fullName,form.fullName.value.trim().length>=2,"Enter your full name.","Ingrese su nombre completo.");
  set(form.phone,/^[0-9+() -]{7,30}$/.test(form.phone.value.trim()),"Enter a valid phone number. This field is required.","Ingrese un teléfono válido. Este campo es obligatorio.");
  set(form.email,form.email.validity.valid&&form.email.value.trim()!=="","Enter a valid email address.","Ingrese un correo electrónico válido.");
  set(form.password,form.password.value.length>=10,"Use at least 10 characters for your password.","Utilice al menos 10 caracteres para su contraseña.");
  set(form.confirm,form.confirm.value!==""&&form.confirm.value===form.password.value,"Both passwords must be identical.","Las dos contraseñas deben ser idénticas.");
  if(firstInvalid){firstInvalid.focus();return false}return true;
}

form.addEventListener("submit",async event=>{
  event.preventDefault();
  message.className="message";
  if(!validateRegistration())return;
  if(form.password.value!==form.confirm.value){
    message.textContent=lang==="en"?"Passwords do not match.":"Las contraseñas no coinciden.";
    message.className="message error show";
    return;
  }
  submitButton.disabled=true;
  submitButton.classList.add("is-working");
  const originalSubmitText=submitButton.textContent;
  submitButton.textContent=lang==="es"?"Creando su acceso…":"Creating your access…";
  try{
    const email=form.email.value.trim().toLowerCase();
    if(location.pathname==="/register"){
      try{
        const response=await fetch("/api/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({fullName:form.fullName.value.trim(),phone:form.phone.value.trim(),email,password:form.password.value})});
        const contentType=response.headers.get("content-type")||"";
        if(response.ok&&contentType.includes("application/json")){
          const result=await response.json();
          sessionStorage.setItem("id-course-registration-success",form.fullName.value.trim());
          location.href=result.redirect||"/course/";
          return;
        }
        if(response.status!==404&&contentType.includes("application/json")){
          const result=await response.json();
          throw new Error(result.error||(lang==="en"?"Registration could not be completed.":"No se pudo completar el registro."));
        }
      }catch(error){
        if(error.message&&!/fetch|network/i.test(error.message))throw error;
      }
    }
    const students=readStudents();
    if(students.some(student=>student.email===email))throw new Error(lang==="en"?"An account already exists for this email.":"Ya existe una cuenta con este correo electrónico.");
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const passwordHash=await protectPassword(form.password.value,salt);
    students.push({
      id:crypto.randomUUID?crypto.randomUUID():String(Date.now()),
      fullName:form.fullName.value.trim(),
      phone:form.phone.value.trim(),
      email,
      salt:bytesToBase64(salt),
      passwordHash,
      createdAt:new Date().toISOString()
    });
    localStorage.setItem(storageKey,JSON.stringify(students));
    sessionStorage.setItem(sessionKey,JSON.stringify({email,startedAt:Date.now()}));
    sessionStorage.setItem("id-course-registration-success",form.fullName.value.trim());
    location.href="independencia-digital-ia.html";
  }catch(error){
    message.textContent=error.message||(lang==="en"?"Registration could not be completed.":"No se pudo completar el registro.");
    message.className="message error show";
    submitButton.disabled=false;
    submitButton.classList.remove("is-working");
    submitButton.textContent=originalSubmitText;
  }
});

applyLanguage();
