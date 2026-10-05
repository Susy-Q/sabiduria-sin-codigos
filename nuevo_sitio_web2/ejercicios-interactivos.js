(()=>{
  "use strict";
  const moduleView=document.getElementById("moduleView");if(!moduleView)return;
  const content={
    es:[
      [
        ["Ayúdame a identificar tres formas en que ya utilizo Inteligencia Artificial en mi vida diaria. Primero pregúntame qué aplicaciones uso.","Ejemplo: uso mapas para encontrar rutas, el correo filtra mensajes no deseados y el teléfono organiza mis fotografías."],
        ["Explícame cómo aprende una Inteligencia Artificial usando la analogía de un Chef Robot. Utiliza palabras sencillas y tres pasos.","Ejemplo: el Chef Robot observa muchas recetas, reconoce patrones y propone una receta nueva que una persona debe revisar."],
        ["Explícame la palabra ‘algoritmo’ sin tecnicismos y dame un ejemplo relacionado con la cocina.","Ejemplo: un algoritmo se parece a una receta porque presenta instrucciones ordenadas para alcanzar un resultado."]
      ],
      [
        ["Compara ChatGPT, Gemini y Copilot en una tabla sencilla. Indica para qué tarea cotidiana podría usar cada herramienta.","Ejemplo: ChatGPT para redactar, Gemini para trabajar con servicios de Google y Copilot para apoyar tareas en productos de Microsoft."],
        ["Ayúdame a redactar un mensaje amable para confirmar una cita mañana a las 10:00 a. m. Que sea breve y claro.","Ejemplo: Buenos días. Deseo confirmar nuestra cita de mañana a las 10:00 a. m. Muchas gracias."],
        ["Organiza estas tareas por prioridad y sugiere cuáles debería realizar hoy. Preséntalas en una tabla sencilla: [escriba aquí sus tareas].","Ejemplo: la tabla puede separar las tareas urgentes, importantes y aquellas que pueden esperar."]
      ],
      [
        ["Quiero una explicación sencilla sobre [tema], para una persona que está comenzando, en tono amable y usando cinco puntos breves.","Ejemplo de estructura: objetivo, contexto, tono y formato claramente indicados en una sola instrucción."],
        ["Mejora esta instrucción para que una IA la entienda claramente: ‘Háblame de viajes’. Primero hazme dos preguntas para conocer lo que necesito.","Ejemplo: planifica un viaje tranquilo de tres días, con presupuesto moderado, descansos y transporte sencillo."],
        ["Describe esta imagen en lenguaje sencillo y señala los elementos importantes que debería revisar. No inventes detalles que no sean visibles.","Ejemplo: una buena respuesta distingue lo que realmente aparece de cualquier interpretación o suposición."]
      ],
      [
        ["Analiza este mensaje sin datos personales. Dime si parece una estafa, qué señales de alerta tiene y qué pasos seguros debería seguir: [pegue el mensaje].","Ejemplo: revisar urgencia, enlaces extraños, solicitudes de dinero y confirmar mediante un canal oficial."],
        ["Lee esta afirmación y dime qué partes requieren verificación. Sugiere una fuente confiable para comprobar cada una: [escriba la afirmación].","Ejemplo: verificar fecha, autor, institución responsable y comparar con una segunda fuente independiente."],
        ["Ayúdame a crear cinco reglas personales para utilizar IA sin compartir información privada.","Ejemplo: no compartir contraseñas, códigos bancarios, documentos de identidad ni expedientes médicos completos."]
      ],
      [
        ["Planifica un viaje de tres días a [ciudad], con actividades tranquilas, descansos, transporte sencillo y presupuesto aproximado.","Ejemplo: un itinerario por días que indique qué precios, horarios y requisitos deben verificarse oficialmente."],
        ["Ayúdame a crear un documento útil sobre [tema]. Primero pregúntame el propósito, el destinatario y el tono que deseo.","Ejemplo: una carta breve y respetuosa que el estudiante revisa y adapta antes de utilizar."],
        ["Ayúdame a revisar mi proyecto final. Separa en una lista lo que creó la IA, lo que modifiqué y los datos que todavía debo verificar.","Ejemplo: una lista final con resultado, cambios personales, fuentes consultadas y aprendizaje obtenido."]
      ]
    ],
    en:[
      [["Help me identify three ways I already use Artificial Intelligence in daily life. First ask which apps I use.","Example: maps suggest routes, email filters unwanted messages, and my phone organizes photographs."],["Explain how Artificial Intelligence learns using the Robot Chef analogy. Use simple words and three steps.","Example: the Robot Chef observes recipes, recognizes patterns, and suggests a new recipe that a person must review."],["Explain the word ‘algorithm’ without technical terms and give me a cooking example.","Example: an algorithm resembles a recipe because it gives ordered instructions to reach a result."]],
      [["Compare ChatGPT, Gemini, and Copilot in a simple table. Include one everyday use for each tool.","Example: ChatGPT for drafting, Gemini for Google services, and Copilot for Microsoft products."],["Help me write a friendly message confirming an appointment tomorrow at 10:00 a.m. Keep it short and clear.","Example: Good morning. I would like to confirm our appointment tomorrow at 10:00 a.m. Thank you."],["Organize these tasks by priority and suggest which ones I should do today. Use a simple table: [write tasks here].","Example: group tasks as urgent, important, and able to wait."]],
      [["I want a simple explanation of [topic] for a beginner, in a friendly tone and five short points.","Example structure: goal, context, tone, and format stated clearly in one instruction."],["Improve this instruction so an AI understands it clearly: ‘Tell me about travel.’ First ask two questions about my needs.","Example: plan a calm three-day trip with a moderate budget, rest breaks, and simple transportation."],["Describe this image in simple language and identify important elements I should review. Do not invent details that are not visible.","Example: a good answer separates visible facts from interpretations or assumptions."]],
      [["Analyze this message without personal data. Tell me whether it may be a scam, the warning signs, and safe next steps: [paste message].","Example: examine urgency, unusual links, money requests, and verify through an official channel."],["Read this claim and identify what needs verification. Suggest a reliable source for each item: [write claim].","Example: verify date, author, responsible institution, and compare with an independent second source."],["Help me create five personal rules for using AI without sharing private information.","Example: never share passwords, banking codes, identification documents, or full medical records."]],
      [["Plan a three-day trip to [city] with calm activities, rest breaks, simple transportation, and an estimated budget.","Example: a daily itinerary noting which prices, schedules, and requirements need official verification."],["Help me create a useful document about [topic]. First ask about its purpose, recipient, and desired tone.","Example: a short respectful letter that the student reviews and adapts before use."],["Help me review my final project. Separate what AI created, what I changed, and what I still need to verify.","Example: a final list with the result, personal changes, checked sources, and lesson learned."]]
    ]
  };
  const moduleAnswers={es:[false,false,true,true,true],en:[false,false,true,true,true]};
  const moduleQuestions={
    es:["¿La IA es una persona que vive dentro de la computadora?","¿Una sola herramienta de IA es siempre la mejor para todas las tareas?","¿Una instrucción clara ayuda a obtener una respuesta más útil?","¿Debe verificar información importante antes de actuar?","¿La decisión final sobre el proyecto pertenece al estudiante?"],
    en:["Is AI a person living inside the computer?","Is one AI tool always best for every task?","Does a clear instruction help produce a more useful answer?","Should important information be verified before acting?","Does the final decision about the project belong to the student?"]
  };
  function language(){return document.documentElement.lang.toLowerCase().startsWith("es")?"es":"en"}
  function parseIndexes(key){const match=key.match(/-(\d+)-(\d+)$/);return match?[Number(match[1]),Number(match[2])]:[0,0]}
  function escapeHtml(value){return String(value).replace(/[&<>"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]))}
  function enhance(){
    const list=moduleView.querySelector(".activity-list");if(!list||list.dataset.interactiveReady==="true")return;
    list.dataset.interactiveReady="true";
    const firstCheckbox=list.querySelector("[data-activity]"),[openingModuleIndex]=parseIndexes(firstCheckbox?.dataset.activity||"-0-0"),openingLang=language(),openingAnswer=moduleAnswers[openingLang][openingModuleIndex];
    const openingQuestion=document.createElement("div");openingQuestion.className="exercise-question activity-opening-question";openingQuestion.dataset.correctAnswer=String(openingAnswer);openingQuestion.innerHTML=`<span class="activity-opening-label">${openingLang==="es"?"Pregunta antes de comenzar":"Question before you begin"}</span><strong>${escapeHtml(moduleQuestions[openingLang][openingModuleIndex])}</strong><div class="exercise-options"><button class="exercise-answer" type="button" data-answer="true">${openingLang==="es"?"Sí":"Yes"}</button><button class="exercise-answer" type="button" data-answer="false">${openingLang==="es"?"No":"No"}</button></div><p class="exercise-feedback" aria-live="polite"></p>`;list.before(openingQuestion);
    [...list.querySelectorAll(":scope > .activity")].forEach(original=>{
      const checkbox=original.querySelector("[data-activity]"),key=checkbox.dataset.activity,[moduleIndex,activityIndex]=parseIndexes(key),lang=language();
      const title=original.querySelector("strong")?.textContent||"",description=original.querySelector("strong + span")?.textContent||"";
      const [prompt,model]=content[lang][moduleIndex]?.[activityIndex]||[description,description];
      const responseKey=`${key}-response-v1`,saved=localStorage.getItem(responseKey)||"",answer=moduleAnswers[lang][moduleIndex];
      const card=document.createElement("article");card.className=`activity exercise-card ${checkbox.checked?"done":""}`;
      card.innerHTML=`<div class="exercise-head"><div><strong class="exercise-title">${escapeHtml(title)}</strong><span class="exercise-description">${escapeHtml(description)}</span></div></div><div class="exercise-steps"><div class="exercise-step"><b>1</b>${lang==="es"?"Copie":"Copy"}</div><div class="exercise-step"><b>2</b>${lang==="es"?"Abra la IA":"Open AI"}</div><div class="exercise-step"><b>3</b>${lang==="es"?"Pegue y pruebe":"Paste and try"}</div><div class="exercise-step"><b>4</b>${lang==="es"?"Revise":"Review"}</div></div><div class="exercise-prompt"><span class="exercise-prompt-label">${lang==="es"?"Instrucción para la IA lista para copiar":"Ready-to-copy instruction for the AI (prompt)"}</span><p>${escapeHtml(prompt)}</p><button class="exercise-copy" type="button" data-copy-exercise>${lang==="es"?"Copiar esta instrucción":"Copy this instruction"}</button></div><label class="exercise-response-label" for="exercise-response-${moduleIndex}-${activityIndex}">${lang==="es"?"Escriba aquí lo que aprendió o la respuesta que recibió":"Write what you learned or the answer you received"}</label><textarea class="exercise-response" id="exercise-response-${moduleIndex}-${activityIndex}" data-exercise-response="${escapeHtml(responseKey)}" placeholder="${lang==="es"?"Puede escribir con sus propias palabras…":"You can write in your own words…"}">${escapeHtml(saved)}</textarea><p class="exercise-save-status" aria-live="polite">${saved?(lang==="es"?"✓ Respuesta guardada en este dispositivo":"✓ Answer saved on this device"):""}</p><details class="exercise-model"><summary>${lang==="es"?"Ver una respuesta modelo":"View a model answer"}</summary><div class="exercise-model-content">${escapeHtml(model)}</div></details><div class="exercise-question" data-correct-answer="${answer}"><strong>${escapeHtml(moduleQuestions[lang][moduleIndex])}</strong><div class="exercise-options"><button class="exercise-answer" type="button" data-answer="true">${lang==="es"?"Sí":"Yes"}</button><button class="exercise-answer" type="button" data-answer="false">${lang==="es"?"No":"No"}</button></div><p class="exercise-feedback" aria-live="polite"></p></div><label class="exercise-completion"></label>`;
      card.querySelector(".exercise-question")?.remove();
      const completion=card.querySelector(".exercise-completion");completion.append(checkbox,document.createTextNode(lang==="es"?"Marcar actividad como completada":"Mark activity as completed"));
      original.replaceWith(card);
    });
  }
  async function copyText(text){
    try{await navigator.clipboard.writeText(text);return true}catch{}
    const area=document.createElement("textarea");area.value=text;area.style.position="fixed";area.style.opacity="0";document.body.appendChild(area);area.select();const copied=document.execCommand("copy");area.remove();return copied;
  }
  moduleView.addEventListener("click",async event=>{
    const copyButton=event.target.closest("[data-copy-exercise]");
    if(copyButton){const text=copyButton.closest(".exercise-prompt").querySelector("p").textContent,ok=await copyText(text);copyButton.textContent=ok?(language()==="es"?"✓ Código copiado":"✓ Prompt copied"):(language()==="es"?"Seleccione y copie el texto":"Select and copy the text");copyButton.classList.toggle("copied",ok);return}
    const answerButton=event.target.closest(".exercise-answer");
    if(answerButton){const question=answerButton.closest(".exercise-question"),correct=String(question.dataset.correctAnswer)===answerButton.dataset.answer;question.querySelectorAll(".exercise-answer").forEach(button=>button.classList.remove("correct","incorrect"));answerButton.classList.add(correct?"correct":"incorrect");question.querySelector(".exercise-feedback").textContent=correct?(language()==="es"?"¡Muy bien! La respuesta es correcta.":"Well done! That answer is correct."):(language()==="es"?"Casi. Revise la explicación e inténtelo nuevamente.":"Almost. Review the explanation and try again.")}
  });
  moduleView.addEventListener("input",event=>{if(!event.target.matches("[data-exercise-response]"))return;localStorage.setItem(event.target.dataset.exerciseResponse,event.target.value);event.target.nextElementSibling.textContent=language()==="es"?"✓ Respuesta guardada automáticamente":"✓ Answer saved automatically";window.dispatchEvent(new CustomEvent("course-progress-changed"))});
  const observer=new MutationObserver(enhance);observer.observe(moduleView,{childList:true,subtree:true});enhance();
})();
