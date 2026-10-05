(()=>{
  "use strict";
  const moduleView=document.getElementById("moduleView");if(!moduleView)return;
  const questions={
    en:[
      [["Can AI make mistakes even when its answer sounds confident?",true],["Should a person review an AI answer before using it?",true],["Does the person keep the final decision when using AI?",true],["Does AI understand the world exactly as a person does?",false],["Is it useful to begin with a small, familiar task?",true]],
      [["Do AI tools have different strengths and uses?",true],["Should important information from an assistant be verified?",true],["Is it safe to share passwords with an AI assistant?",false],["Can ChatGPT, Gemini, and Copilot all help with everyday tasks?",true],["Should the tool be chosen according to the task and privacy needs?",true]],
      [["Does a clear instruction usually produce a more useful answer?",true],["Can context and the requested format improve an instruction?",true],["Must the first AI answer always be accepted without changes?",false],["Can you ask the AI to revise an answer?",true],["Should a prompt include private information to be effective?",false]],
      [["Is a fluent AI answer automatically correct?",false],["Should health, money, legal, and safety information be verified?",true],["Should banking codes or full identification numbers be shared with AI?",false],["Can AI prove that a suspicious message is authentic?",false],["Is it safer to verify through an official channel before responding?",true]],
      [["Should a final project solve a real personal need?",true],["Should the final result be reviewed before it is used?",true],["Does AI make the final decision instead of the student?",false],["Should the project record what the learner changed and verified?",true],["Can the project be completed independently at the learner's own pace?",true]]
    ],
    es:[
      [["¿La IA puede equivocarse aunque su respuesta parezca segura?",true],["¿Una persona debe revisar la respuesta antes de utilizarla?",true],["¿La persona conserva la decisión final cuando utiliza IA?",true],["¿La IA comprende el mundo exactamente como una persona?",false],["¿Es útil comenzar con una tarea pequeña y conocida?",true]],
      [["¿Las herramientas de IA tienen fortalezas y usos diferentes?",true],["¿La información importante de un asistente debe verificarse?",true],["¿Es seguro compartir contraseñas con un asistente de IA?",false],["¿ChatGPT, Gemini y Copilot pueden ayudar con tareas cotidianas?",true],["¿La herramienta debe elegirse según la tarea y la privacidad?",true]],
      [["¿Una instrucción clara suele producir una respuesta más útil?",true],["¿El contexto y el formato solicitado pueden mejorar una instrucción?",true],["¿Siempre debe aceptarse la primera respuesta de la IA sin cambios?",false],["¿Puede pedirle a la IA que revise una respuesta?",true],["¿Una instrucción necesita datos privados para ser efectiva?",false]],
      [["¿Una respuesta bien escrita por la IA es automáticamente correcta?",false],["¿La información de salud, dinero, leyes y seguridad debe verificarse?",true],["¿Se deben compartir códigos bancarios o identificaciones completas con la IA?",false],["¿La IA puede demostrar que un mensaje sospechoso es auténtico?",false],["¿Es más seguro verificar mediante un canal oficial antes de responder?",true]],
      [["¿El proyecto final debe resolver una necesidad personal real?",true],["¿El resultado final debe revisarse antes de utilizarlo?",true],["¿La IA toma la decisión final en lugar del estudiante?",false],["¿El proyecto debe registrar lo que el estudiante cambió y verificó?",true],["¿El proyecto puede completarse de forma independiente y al ritmo del estudiante?",true]]
    ]
  };
  const es=()=>((localStorage.getItem("id-course-language")||"en")==="es");
  function studentId(){try{const session=JSON.parse(sessionStorage.getItem("id-course-browser-session")||"null");if(session?.email)return session.email.toLowerCase()}catch{}return String(window.__COURSE_USER__||"student").toLowerCase()}
  function key(moduleIndex,questionIndex){return `id-v2-module-review-v1-${encodeURIComponent(studentId())}-${moduleIndex}-${questionIndex}`}
  function moduleIndex(){const match=location.hash.match(/^#module-(\d)/);return match?Number(match[1])-1:null}
  function enhance(){
    const index=moduleIndex(),activities=moduleView.querySelector(".activity-card"),resources=moduleView.querySelector("#resources");if(index===null||!activities||!resources||moduleView.querySelector(".module-review-card"))return;
    moduleView.querySelector("#overview")?.classList.add("module-learning-outcomes");
    const lang=es()?"es":"en",goals=typeof modules!=="undefined"?(modules[index][lang]?.goals||[]):[];
    const section=document.createElement("section");section.className="content-card module-review-card";section.id="module-review";
    section.innerHTML=`<span class="label">${lang==="es"?"REPASO FINAL":"FINAL REVIEW"}</span><h2>${lang==="es"?"Lo que aprendí":"What I learned"}</h2><p class="module-review-intro">${lang==="es"?"Responda cinco preguntas. Necesita cuatro respuestas correctas (80 %) y puede intentarlo nuevamente sin penalización.":"Answer five questions. You need four correct answers (80%) and may retry without penalty."}</p><ul class="module-review-outcomes">${goals.map(goal=>`<li>${goal[1]}</li>`).join("")}</ul><div class="module-review-questions">${questions[lang][index].map(([question,answer],questionIndex)=>{const done=localStorage.getItem(key(index,questionIndex))==="1";return `<div class="module-review-question ${done?"answered":""}" data-review-question="${questionIndex}" data-correct="${answer}"><strong>${questionIndex+1}. ${question}</strong><div class="module-review-options"><button class="module-review-option ${done&&answer?"correct":""}" type="button" data-review-answer="true">${lang==="es"?"Sí":"Yes"}</button><button class="module-review-option ${done&&!answer?"correct":""}" type="button" data-review-answer="false">${lang==="es"?"No":"No"}</button></div><p class="module-review-feedback" aria-live="polite">${done?(lang==="es"?"✓ Respuesta correcta":"✓ Correct answer"):""}</p></div>`}).join("")}</div><div class="module-review-finish"><span aria-hidden="true">🎉</span><div><strong>${lang==="es"?"¡Excelente trabajo!":"Excellent work!"}</strong><p>${lang==="es"?"Alcanzó el 80 %. Cuando termine también los temas y actividades, podrá continuar al siguiente módulo.":"You reached 80%. After finishing the topics and activities, you can continue to the next module."}</p></div></div>`;
    resources.before(section);refresh(index);
  }
  function refresh(index){const section=moduleView.querySelector(".module-review-card");if(!section)return;const complete=[0,1,2,3,4].filter(questionIndex=>localStorage.getItem(key(index,questionIndex))==="1").length>=4;section.querySelector(".module-review-finish").classList.toggle("show",complete)}
  moduleView.addEventListener("click",event=>{
    const button=event.target.closest("[data-review-answer]");if(!button)return;
    const question=button.closest("[data-review-question]"),index=moduleIndex(),questionIndex=Number(question.dataset.reviewQuestion),correct=button.dataset.reviewAnswer===question.dataset.correct;
    const wasComplete=typeof isModuleComplete==="function"?isModuleComplete(index):false;
    question.querySelectorAll(".module-review-option").forEach(option=>option.classList.remove("correct","incorrect"));button.classList.add(correct?"correct":"incorrect");
    question.querySelector(".module-review-feedback").textContent=correct?(es()?"✓ ¡Muy bien! La respuesta es correcta.":"✓ Well done! That answer is correct."):(es()?"Casi. Revise el aprendizaje e inténtelo nuevamente.":"Almost. Review the learning point and try again.");
    if(correct){localStorage.setItem(key(index,questionIndex),"1");question.classList.add("answered")}else localStorage.removeItem(key(index,questionIndex));window.dispatchEvent(new CustomEvent("course-progress-changed"));
    refresh(index);if(typeof updateProgress==="function")updateProgress();if(typeof renderMenus==="function")renderMenus();if(typeof renderHomeCourseOutline==="function")renderHomeCourseOutline();
    const nowComplete=typeof isModuleComplete==="function"?isModuleComplete(index):false;
    if(!wasComplete&&nowComplete){
      if(typeof renderModule==="function")renderModule(index,false);
      if(typeof showModuleCompletion==="function")showModuleCompletion(index);
    }
  });
  new MutationObserver(enhance).observe(moduleView,{childList:true,subtree:true});enhance();
})();
