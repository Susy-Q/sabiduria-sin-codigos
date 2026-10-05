(()=>{
  "use strict";
  const moduleView=document.getElementById("moduleView"),homeView=document.getElementById("homeView");
  if(!moduleView||!homeView)return;
  const isEs=()=>document.documentElement.lang.toLowerCase().startsWith("es");
  const moduleTimes={en:["3–4 hours","3–4 hours","4–5 hours","4–5 hours","4 hours"],es:["3–4 horas","3–4 horas","4–5 horas","4–5 horas","4 horas"]};
  const learnerId=()=>typeof currentStudentProgressId==="function"?currentStudentProgressId():String(window.__COURSE_USER__||"student").toLowerCase();
  const projectPrefix=()=>`id-v2-final-project-data-v1-${encodeURIComponent(learnerId())}`;
  const projectDoneKey=()=>`id-v2-final-project-v1-${encodeURIComponent(learnerId())}`;
  const projectFields=["objective","tool","firstPrompt","improvedPrompt","result","verification","reflection"];
  function normalizeLegacyLanguage(root){
    const replacements=new Map([
      ["Workshop preparation","Independent practice preparation"],["Preparación para el taller","Preparación para la práctica independiente"]
    ]);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode()))for(const [from,to] of replacements)if(node.nodeValue.includes(from))node.nodeValue=node.nodeValue.replaceAll(from,to);
  }
  function addPacing(index){
    const hero=moduleView.querySelector(".module-hero-grid>div");if(!hero||hero.querySelector(".self-paced-pacing"))return;
    const lang=isEs()?"es":"en",box=document.createElement("p");box.className="self-paced-pacing";
    box.textContent=lang==="es"?`Tiempo estimado: ${moduleTimes.es[index]}. Sugerencia: sesiones personales de 30 a 45 minutos, con pausas y repeticiones cuando las necesite.`:`Estimated time: ${moduleTimes.en[index]}. Suggested pace: personal 30–45 minute sessions, with breaks and repetition whenever needed.`;
    hero.appendChild(box);
  }
  function addPracticeFallback(index){
    const activities=moduleView.querySelector("#activities");if(!activities||activities.querySelector(".independent-practice-note"))return;
    const note=document.createElement("aside");note.className="independent-practice-note";
    note.innerHTML=isEs()?`<strong>Práctica independiente</strong><p>Puede usar ChatGPT, Gemini o Copilot. Estas herramientas requieren internet. Si no puede abrirlas, lea la respuesta modelo, escriba qué aprendió y complete la actividad sin esperar a un instructor o grupo.</p>`:`<strong>Independent practice</strong><p>You may use ChatGPT, Gemini, or Copilot. These tools require internet. If you cannot open them, study the model answer, write what you learned, and complete the activity without waiting for an instructor or group.</p>`;
    if(index===3)note.innerHTML+=isEs()?`<p><strong>Regla de seguridad:</strong> la IA no puede confirmar que un mensaje sea auténtico. No responda, no abra enlaces y no comparta datos. Verifique mediante un canal oficial o con una persona de confianza.</p>`:`<p><strong>Safety rule:</strong> AI cannot prove that a message is authentic. Do not reply, open links, or share data. Verify through an official channel or with a trusted person.</p>`;
    activities.querySelector("h2")?.after(note);
  }
  function savedField(name){return localStorage.getItem(`${projectPrefix()}-${name}`)||""}
  function updateProjectStatus(card){
    const textComplete=projectFields.every(name=>savedField(name).trim().length>=5);
    const checksComplete=[...card.querySelectorAll("[data-project-check]")].every(box=>box.checked);
    const complete=textComplete&&checksComplete;
    localStorage.setItem(projectDoneKey(),complete?"1":"0");
    const status=card.querySelector(".project-status");
    status.textContent=complete?(isEs()?"✓ Proyecto personal completo. Ya puede cumplir el criterio final del curso.":"✓ Personal project complete. You now meet the final project criterion."):(isEs()?"Complete todos los campos y las tres verificaciones de seguridad.":"Complete every field and all three safety confirmations.");
    status.classList.toggle("complete",complete);window.dispatchEvent(new CustomEvent("course-progress-changed"));
    if(typeof updateProgress==="function")updateProgress();
  }
  function addFinalProject(){
    const resources=moduleView.querySelector("#resources");if(!resources||moduleView.querySelector(".final-project-card"))return;
    const card=document.createElement("section");card.className="content-card final-project-card";card.id="final-project";
    const labels=isEs()?{title:"Proyecto personal final",intro:"Complete este proyecto de forma independiente. Su trabajo se guarda automáticamente.",objective:"Objetivo y necesidad personal",tool:"Herramienta elegida y por qué",firstPrompt:"Primera instrucción",improvedPrompt:"Instrucción mejorada",result:"Resultado obtenido o resumen",verification:"Datos y fuentes que verificó",reflection:"Qué cambió usted y qué aprendió",privacy:"No incluí contraseñas, códigos, números de cuenta ni identificaciones completas.",facts:"Verifiqué la información importante mediante fuentes o canales oficiales.",decision:"La decisión final y los cambios fueron míos."}:{title:"Final personal project",intro:"Complete this project independently. Your work is saved automatically.",objective:"Objective and personal need",tool:"Chosen tool and why",firstPrompt:"First prompt",improvedPrompt:"Improved prompt",result:"Result or a summary",verification:"Facts and sources you verified",reflection:"What you changed and learned",privacy:"I did not include passwords, codes, account numbers, or complete identification.",facts:"I verified important information through official sources or channels.",decision:"The final decision and changes were mine."};
    card.innerHTML=`<span class="label">${isEs()?"PROYECTO FINAL":"FINAL PROJECT"}</span><h2>${labels.title}</h2><p>${labels.intro}</p><div class="final-project-fields">${projectFields.map(name=>`<label><strong>${labels[name]}</strong><textarea data-project-field="${name}" rows="3">${escapeProject(savedField(name))}</textarea></label>`).join("")}</div><fieldset><legend>${isEs()?"Lista de seguridad y autoría":"Safety and authorship checklist"}</legend>${[["privacy",labels.privacy],["facts",labels.facts],["decision",labels.decision]].map(([name,label])=>`<label><input type="checkbox" data-project-check="${name}" ${savedField(name)==="1"?"checked":""}> ${label}</label>`).join("")}</fieldset><p class="project-status" role="status"></p>`;
    card.addEventListener("input",event=>{const name=event.target.dataset.projectField;if(!name)return;localStorage.setItem(`${projectPrefix()}-${name}`,event.target.value);updateProjectStatus(card)});
    card.addEventListener("change",event=>{const name=event.target.dataset.projectCheck;if(!name)return;localStorage.setItem(`${projectPrefix()}-${name}`,event.target.checked?"1":"0");updateProjectStatus(card)});
    resources.before(card);updateProjectStatus(card);
  }
  function escapeProject(value){return String(value).replace(/[&<>]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[char]))}
  function addHelpCenter(){
    if(homeView.querySelector(".self-paced-help"))return;
    const section=document.createElement("section");section.className="home-section self-paced-help";
    section.innerHTML=isEs()?`<div class="wrap"><span class="label">AYUDA AUTODIDÁCTICA</span><h2>Aprenda con apoyo, sin horarios ni sesiones en vivo.</h2><details><summary>¿Cómo continúo donde quedé?</summary><p>Ingrese con la misma cuenta. El curso guarda su progreso automáticamente. En este equipo también conserva una copia local.</p></details><details><summary>¿Qué hago si no puedo usar una herramienta de IA?</summary><p>Lea la respuesta modelo de la actividad y escriba una reflexión. Puede continuar sin esperar a otra persona.</p></details><details><summary>¿Cómo solicito ayuda?</summary><p>Use el formulario de contacto para preguntas de acceso, contenido o funcionamiento. La meta de respuesta es de dos días hábiles.</p></details><p><a href="/contact">Contactar al equipo del curso</a> · Glosario: IA = herramienta que genera respuestas; instrucción o prompt = petición escrita; alucinación = respuesta inventada o incorrecta.</p></div>`:`<div class="wrap"><span class="label">SELF-PACED HELP</span><h2>Learn with support, without schedules or live sessions.</h2><details><summary>How do I continue where I stopped?</summary><p>Sign in with the same account. The course saves progress automatically and also keeps a local copy on this computer.</p></details><details><summary>What if I cannot use an AI tool?</summary><p>Study the model answer and write a reflection. You can continue without waiting for another person.</p></details><details><summary>How do I ask for help?</summary><p>Use the contact form for access, content, or technical questions. The response target is two business days.</p></details><p><a href="/contact">Contact the course team</a> · Glossary: AI = a tool that generates responses; prompt = a written request; hallucination = an invented or incorrect answer.</p></div>`;
    homeView.appendChild(section);
  }
  function enhance(){
    addHelpCenter();normalizeLegacyLanguage(document.body);
    const match=location.hash.match(/^#module-(\d)$/);if(!match)return;
    const index=Number(match[1])-1;addPacing(index);addPracticeFallback(index);if(index===4)addFinalProject();
  }
  new MutationObserver(()=>requestAnimationFrame(enhance)).observe(moduleView,{childList:true,subtree:true});
  document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>setTimeout(()=>location.reload(),0)));
  enhance();
})();
