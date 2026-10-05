(()=>{
  "use strict";
  const es=()=>((localStorage.getItem("id-course-language")||"en")==="es");
  function studentId(){try{const session=JSON.parse(sessionStorage.getItem("id-course-browser-session")||"null");if(session?.email)return session.email.toLowerCase()}catch{}return String(window.__COURSE_USER__||"student").toLowerCase()}
  const guideKey=()=>`id-course-welcome-guide-v1-${encodeURIComponent(studentId())}`;
  const steps={
    en:[
      {icon:"🧭",title:"Your course navigation is on the left",text:"Use the module list to see where you are. The current module opens automatically, and completed topics display a check mark."},
      {icon:"🔓",title:"Advance one topic at a time",text:"Read the essential explanation, complete the easy practice, and select the completion button. The next topic will then become available."},
      {icon:"💾",title:"Your progress is saved automatically",text:"You can leave and return later. When signed in, your completed topics, exercises, written answers, and language selection are saved to your account, with a local copy on this device."}
    ],
    es:[
      {icon:"🧭",title:"La navegación del curso está a la izquierda",text:"Utilice la lista de módulos para saber dónde se encuentra. El módulo actual se abre automáticamente y los temas completados muestran una marca."},
      {icon:"🔓",title:"Avance un tema a la vez",text:"Lea la explicación esencial, realice la práctica sencilla y seleccione el botón de finalización. Después se habilitará el siguiente tema."},
      {icon:"💾",title:"Su progreso se guarda automáticamente",text:"Puede salir y regresar después. Al iniciar sesión, sus temas, ejercicios, respuestas escritas e idioma se guardan en su cuenta, con una copia local en este dispositivo."}
    ]
  };
  function closeGuide(markComplete=true){document.querySelector(".student-guide")?.remove();if(markComplete)localStorage.setItem(guideKey(),"1");document.querySelector(".course-help-button")?.focus()}
  function openGuide(){
    if(document.querySelector(".student-guide"))return;
    let index=0,lang=es()?"es":"en";
    const overlay=document.createElement("div");overlay.className="student-guide";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-labelledby","studentGuideTitle");
    overlay.innerHTML='<div class="student-guide-card"><div class="student-guide-progress" aria-hidden="true"><span></span><span></span><span></span></div><div class="student-guide-body"><div class="student-guide-icon" aria-hidden="true"></div><span class="student-guide-step"></span><h2 id="studentGuideTitle"></h2><p></p></div><div class="student-guide-actions"><button class="guide-skip" type="button"></button><button class="guide-back" type="button"></button><button class="guide-next" type="button"></button></div></div>';
    const render=()=>{lang=es()?"es":"en";const step=steps[lang][index];overlay.querySelector(".student-guide-icon").textContent=step.icon;overlay.querySelector(".student-guide-step").textContent=lang==="es"?`Paso ${index+1} de 3`:`Step ${index+1} of 3`;overlay.querySelector("h2").textContent=step.title;overlay.querySelector(".student-guide-body p").textContent=step.text;overlay.querySelectorAll(".student-guide-progress span").forEach((bar,i)=>bar.classList.toggle("active",i<=index));const back=overlay.querySelector(".guide-back"),next=overlay.querySelector(".guide-next");back.hidden=index===0;back.textContent=lang==="es"?"Anterior":"Back";next.textContent=index===2?(lang==="es"?"Comenzar el curso":"Start the course"):(lang==="es"?"Siguiente":"Next");overlay.querySelector(".guide-skip").textContent=lang==="es"?"Omitir guía":"Skip guide"};
    overlay.addEventListener("click",event=>{if(event.target.closest(".guide-skip")){closeGuide();return}if(event.target.closest(".guide-back")){index=Math.max(0,index-1);render();return}if(event.target.closest(".guide-next")){if(index<2){index++;render()}else closeGuide()}});
    document.body.appendChild(overlay);render();overlay.querySelector(".guide-next").focus();
  }
  const help=document.createElement("button");help.type="button";help.className="course-help-button";help.innerHTML=`<span aria-hidden="true">?</span><b>${es()?"¿Necesita ayuda?":"Need help?"}</b>`;help.setAttribute("aria-label",es()?"Abrir la guía de navegación":"Open the navigation guide");help.addEventListener("click",openGuide);document.body.appendChild(help);
  document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>setTimeout(()=>{help.querySelector("b").textContent=es()?"¿Necesita ayuda?":"Need help?";help.setAttribute("aria-label",es()?"Abrir la guía de navegación":"Open the navigation guide")},0)));
  document.addEventListener("keydown",event=>{if(event.key==="Escape"&&document.querySelector(".student-guide"))closeGuide(false)});
  function addTermExplanation(){
    const documentContent=document.querySelector("#moduleView .document-content");if(!documentContent||!location.hash.startsWith("#module-3")||documentContent.querySelector(".ai-term-note"))return;
    const note=document.createElement("div");note.className="ai-term-note";note.setAttribute("role","note");note.innerHTML=es()?'<span aria-hidden="true">💬</span><div><strong>Una palabra sencilla antes de comenzar</strong><p>“Prompt” es una palabra técnica que significa <b>instrucción para la IA</b>: es la pregunta o petición que usted escribe para indicar qué ayuda necesita.</p></div>':'<span aria-hidden="true">💬</span><div><strong>A simple term before you begin</strong><p>A <b>prompt</b> simply means an <b>instruction for the AI</b>: the question or request you write to explain what help you need.</p></div>';documentContent.prepend(note);
  }
  const moduleView=document.getElementById("moduleView");if(moduleView)new MutationObserver(addTermExplanation).observe(moduleView,{childList:true,subtree:true});addTermExplanation();
  const showFirstGuide=()=>{if(localStorage.getItem(guideKey())!=="1")openGuide()};
  if(document.querySelector(".registration-success"))document.addEventListener("course:registration-welcome-closed",showFirstGuide,{once:true});else setTimeout(showFirstGuide,450);
})();
