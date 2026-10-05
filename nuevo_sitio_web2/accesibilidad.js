(()=>{
  "use strict";
  if(!document.querySelector('link[href$="accesibilidad.css"]')){
    const stylesheet=document.createElement("link");
    stylesheet.rel="stylesheet";
    stylesheet.href="accesibilidad.css";
    document.head.appendChild(stylesheet);
  }
  const storageKey="id-course-text-size-v1";
  const sizes=[{value:"normal",scale:1,label:"A−"},{value:"large",scale:1.125,label:"A"},{value:"larger",scale:1.25,label:"A+"}];
  const stored=localStorage.getItem(storageKey);
  const saved=sizes.some(size=>size.value===stored)?stored:"large";
  function language(){return (localStorage.getItem("id-course-language")||document.documentElement.lang||"es").toLowerCase().startsWith("es")?"es":"en"}
  function apply(value,announce=false){
    const selected=sizes.find(size=>size.value===value)||sizes[1];
    document.documentElement.style.setProperty("--access-font-scale",String(selected.scale));
    document.documentElement.dataset.textSize=selected.value;
    localStorage.setItem(storageKey,selected.value);
    document.querySelectorAll("[data-text-size]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.textSize===selected.value)));
    if(announce){const status=document.getElementById("textSizeStatus");if(status)status.textContent=language()==="es"?`Tamaño de texto cambiado a ${selected.value==="normal"?"normal":selected.value==="large"?"grande":"muy grande"}.`:`Text size changed to ${selected.value}.`}
  }
  function createControl(){
    if(document.querySelector(".text-size-control"))return;
    const host=document.querySelector(".top-actions,.actions,.header-tools");if(!host)return;
    const es=language()==="es",control=document.createElement("div");
    control.className="text-size-control";control.setAttribute("role","group");control.setAttribute("aria-label",es?"Tamaño del texto":"Text size");
    control.innerHTML=`<span class="text-size-label">${es?"Texto":"Text"}</span>${sizes.map(size=>`<button class="text-size-button" type="button" data-text-size="${size.value}" aria-label="${es?"Cambiar a texto":"Change to"} ${size.value==="normal"?(es?"normal":"normal"):size.value==="large"?(es?"grande":"large"):(es?"muy grande":"extra large")}" aria-pressed="false">${size.label}</button>`).join("")}<span id="textSizeStatus" class="visually-hidden" aria-live="polite"></span>`;
    const languageControl=host.querySelector(".language,.lang-switch");if(languageControl)host.insertBefore(control,languageControl);else host.prepend(control);
    control.addEventListener("click",event=>{const button=event.target.closest("[data-text-size]");if(button)apply(button.dataset.textSize,true)});apply(saved);
    document.addEventListener("click",event=>{
      if(!event.target.closest("[data-lang]"))return;
      setTimeout(()=>{
        const currentEs=language()==="es";
        control.setAttribute("aria-label",currentEs?"Tamaño del texto":"Text size");
        const label=control.querySelector(".text-size-label");if(label)label.textContent=currentEs?"Texto":"Text";
      },0);
    });
  }
  apply(saved);if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",createControl);else createControl();
})();
