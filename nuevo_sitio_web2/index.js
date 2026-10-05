let lang=localStorage.getItem("id-course-language")||"en";

function applyLanguage(){
  document.documentElement.lang=lang;
  document.title=lang==="en"?"Wisdom Without Code | AI Course":"Sabiduría Sin Códigos | Curso de IA";
  document.querySelectorAll("[data-en]").forEach(element=>{element.textContent=element.dataset[lang]});
  document.querySelectorAll("[data-lang]").forEach(button=>button.classList.toggle("active",button.dataset.lang===lang));
  renderCourseAccordions();
}

document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>{
  lang=button.dataset.lang;
  localStorage.setItem("id-course-language",lang);
  applyLanguage();
}));

if(location.protocol==="file:"){
  document.querySelectorAll(".register-link").forEach(link=>link.href="registro.html");
  document.getElementById("loginLink").href="acceso.html";
}

const summarizedCourseTopics={
  en:[
    [
      {title:"Understanding artificial intelligence",subs:["What AI is and what it is not","The Robot Chef analogy: learning from examples"]},
      {title:"AI in everyday life",subs:["Phones, maps, email, photos and banks","Benefits and limits of automatic recommendations"]},
      {title:"Using AI with confidence",subs:["Ask, review and make the final decision","Recognize that AI can make mistakes"]},
      {title:"History and evolution of AI",subs:["From early computers to conversational assistants","Why AI became accessible to the public"]},
      {title:"Basic concepts without technical language",subs:["Data, models and training","Responses, limitations and verification"]}
    ],
    [
      {title:"AI virtual assistants",subs:["How assistants receive and process instructions","Differences between a search and a conversation"]},
      {title:"Popular everyday tools",subs:["ChatGPT and Gemini for explanations and organization","Microsoft Copilot for documents and daily work"]},
      {title:"Choosing the right tool",subs:["Match the assistant to the task","Consider ease of use, sources and privacy"]},
      {title:"ChatGPT and Gemini",subs:["Conversations, explanations and summaries","Search, organization and different types of content"]},
      {title:"Microsoft Copilot",subs:["Support for documents, email and tables","AI integrated into familiar work tools"]}
    ],
    [
      {title:"Writing clear AI instructions (prompts)",subs:["A prompt is the instruction or question written to the AI","State the goal and necessary context"]},
      {title:"Improving AI answers",subs:["Ask for simpler, shorter or clearer versions","Add examples and correct missing information"]},
      {title:"Practical and visual AI instructions",subs:["Messages, summaries, tables and comparisons","Images, documents and multimodal AI"]},
      {title:"Improving an instruction step by step",subs:["Review the first result","Adjust clarity, length, examples and format"]},
      {title:"Research and sources",subs:["Request and review supporting sources","Verify citations and important information"]}
    ],
    [
      {title:"Errors and verification",subs:["Recognize AI hallucinations","Confirm important facts with reliable sources"]},
      {title:"Privacy and personal information",subs:["Data that should never be shared","Safe ways to remove private details"]},
      {title:"Scams and manipulated content",subs:["Warning signs in suspicious messages","Verification of images, videos and voices"]},
      {title:"Reliable information",subs:["Compare answers with official sources","Verify dates, prices, procedures and health guidance"]},
      {title:"Digital trust",subs:["Pause before clicking or sharing","Use observation and critical judgment"]}
    ],
    [
      {title:"Planning a useful project",subs:["Choose a real personal need","Move from the idea to a reviewed result"]},
      {title:"Everyday practical projects",subs:["Travel plans, letters and personal organization","Health questions without sharing private records"]},
      {title:"Final project and safe use",subs:["Apply verification and security habits","Save and use a useful final result"]},
      {title:"Travel and personal planning",subs:["Itineraries, transportation and budgets","Confirm schedules, prices and reservations"]},
      {title:"Writing and organizing information",subs:["Letters, messages and family stories","Health questions without exposing private data"]}
    ]
  ],
  es:[
    [
      {title:"Comprender la inteligencia artificial",subs:["Qué es la IA y qué no es","La analogía del Chef Robot: aprender de ejemplos"]},
      {title:"La IA en la vida cotidiana",subs:["Teléfonos, mapas, correos, fotografías y bancos","Beneficios y límites de las recomendaciones automáticas"]},
      {title:"Utilizar la IA con confianza",subs:["Preguntar, revisar y tomar la decisión final","Reconocer que la IA puede equivocarse"]},
      {title:"Historia y evolución de la IA",subs:["De las primeras computadoras a los asistentes conversacionales","Por qué la IA llegó a ser accesible para el público"]},
      {title:"Conceptos básicos sin tecnicismos",subs:["Datos, modelos y entrenamiento","Respuestas, limitaciones y verificación"]}
    ],
    [
      {title:"Asistentes virtuales de IA",subs:["Cómo reciben y procesan instrucciones","Diferencias entre una búsqueda y una conversación"]},
      {title:"Herramientas populares",subs:["ChatGPT y Gemini para explicar y organizar","Microsoft Copilot para documentos y tareas cotidianas"]},
      {title:"Escoger la herramienta correcta",subs:["Relacionar el asistente con la tarea","Considerar facilidad de uso, fuentes y privacidad"]},
      {title:"ChatGPT y Gemini",subs:["Conversaciones, explicaciones y resúmenes","Búsqueda, organización y distintos tipos de contenido"]},
      {title:"Microsoft Copilot",subs:["Apoyo para documentos, correos y tablas","IA integrada en herramientas de trabajo conocidas"]}
    ],
    [
      {title:"Escribir códigos o instrucciones claras",subs:["Indicar el objetivo y el contexto necesario","Solicitar el formato y tono deseados"]},
      {title:"Mejorar las respuestas de la IA",subs:["Pedir versiones más sencillas, breves o claras","Agregar ejemplos y corregir información faltante"]},
      {title:"Códigos prácticos y visuales",subs:["Mensajes, resúmenes, tablas y comparaciones","Imágenes, documentos e IA multimodal"]},
      {title:"Mejorar códigos paso a paso",subs:["Revisar el primer resultado","Ajustar claridad, extensión, ejemplos y formato"]},
      {title:"Investigación y fuentes",subs:["Solicitar y revisar fuentes de apoyo","Verificar citas e información importante"]}
    ],
    [
      {title:"Errores y verificación",subs:["Reconocer las alucinaciones de la IA","Confirmar datos importantes con fuentes confiables"]},
      {title:"Privacidad e información personal",subs:["Datos que nunca deben compartirse","Formas seguras de eliminar detalles privados"]},
      {title:"Estafas y contenido manipulado",subs:["Señales de alerta en mensajes sospechosos","Verificación de imágenes, videos y voces"]},
      {title:"Información confiable",subs:["Comparar respuestas con fuentes oficiales","Verificar fechas, precios, trámites y orientación de salud"]},
      {title:"Confianza digital",subs:["Detenerse antes de hacer clic o compartir","Utilizar observación y criterio crítico"]}
    ],
    [
      {title:"Planificar un proyecto útil",subs:["Escoger una necesidad personal real","Pasar de la idea a un resultado revisado"]},
      {title:"Proyectos prácticos cotidianos",subs:["Viajes, cartas y organización personal","Preguntas de salud sin compartir expedientes privados"]},
      {title:"Proyecto final y uso seguro",subs:["Aplicar hábitos de verificación y seguridad","Guardar y utilizar un resultado final útil"]},
      {title:"Viajes y planificación personal",subs:["Itinerarios, transporte y presupuestos","Confirmar horarios, precios y reservaciones"]},
      {title:"Redacción y organización de información",subs:["Cartas, mensajes e historias familiares","Preguntas de salud sin exponer datos privados"]}
    ]
  ]
};
const currentCourseTopicTitles={
  en:[
    ["1.1 Take the first steps with confidence","1.2 A journey from the origins of technology to today","1.3 The Robot Chef analogy","1.4 Basic concepts without technicalities","1.5 Where do we use AI without realizing it?","1.6 Companies that gave rise to AI","1.7 More milestones that help understand the revolution","1.8 History in the news: the ChatGPT moment","1.9 Step-by-step practice: explain AI in simple words","1.10 Step-by-step practice: finding AI in my routine","1.11 Everyday case: understanding a new word","1.12 Everyday case: compare before and after","1.13 Module Summary","1.14 Mini stories to practice comprehension","1.15 Closing exercise"],
    ["2.1 What is an AI virtual assistant?","2.2 ChatGPT: conversation and explanation","2.3 Google Gemini: search, organization and content","2.4 Microsoft Copilot: documents, emails and tables","2.5 Perplexity, Canva and creative tools","2.6 Choose the right tool","2.7 Case study: organizing a busy week","2.8 Practical case: understanding a complicated letter or email","2.9 Case study: preparing an important call","2.10 Story in the news: when a chatbot makes a mistake","2.11 Where we are going in daily life","2.12 Extended Tool Comparison","2.13 Closing exercise"],
    ["3.1 What is a code or command?","3.2 Four parts of good code","3.3 From basic code to excellent code","3.4 Step-by-step exercise: improving code","3.5 Codes for text","3.6 Practical code bank","3.7 Codes for images","3.8 Image exercise: review a capture","3.9 Codes in ChatGPT, Gemini and Copilot","3.10 Introduction to bibliographic search","3.11 Story in the news: fake quotes in a legal case","3.12 Where are we going: multimodal AI and personal assistants","3.13 Closing exercise"],
    ["4.1 What are AI hallucinations?","4.2 How to verify information","4.3 Privacy: what you should not share","4.4 Real news about AI and security","4.5 Warning signs in suspicious messages","4.6 Verification of images, videos and voices","4.7 Where we are going: digital trust","4.8 Safety as a habit, not fear","4.9 Closing exercise"],
    ["5.1 Preparation for independent practice","5.2 Challenge 1: Plan a quiet trip","5.3 Challenge 2: Write an important letter","5.4 Challenge 3: Organize health information without sharing sensitive data","5.5 Challenge 4: Detect a possible scam","5.6 Challenge 5: Create a family history","5.7 Independent scenario: the suspicious message","5.8 Final personal project","5.9 Project templates","5.10 Closing: where we are going","5.11 Final List of Favorite Prompts","5.12 Closing"]
  ],
  es:[
    ["1.1 Dar los primeros pasos con confianza","1.2 Un viaje desde los orígenes de la tecnología hasta hoy","1.3 La analogía del Chef Robot","1.4 Conceptos básicos sin tecnicismos","1.5 ¿Dónde usamos IA sin darnos cuenta?","1.6 Compañías que dieron origen a la IA","1.7 Más hitos que ayudan a entender la revolución","1.8 Historia en las noticias: el momento ChatGPT","1.9 Práctica paso a paso: explicar IA con palabras sencillas","1.10 Práctica paso a paso: encontrar IA en mi rutina","1.11 Caso cotidiano: entender una palabra nueva","1.12 Caso cotidiano: comparar antes y después","1.13 Resumen del módulo","1.14 Mini historias para practicar comprensión","1.15 Ejercicio de cierre"],
    ["2.1 ¿Qué es un asistente virtual de IA?","2.2 ChatGPT: conversación y explicación","2.3 Google Gemini: búsqueda, organización y contenido","2.4 Microsoft Copilot: documentos, correos y tablas","2.5 Perplexity, Canva y herramientas creativas","2.6 Escoger la herramienta correcta","2.7 Caso práctico: organizar una semana ocupada","2.8 Caso práctico: entender una carta o correo complicado","2.9 Caso práctico: preparar una llamada importante","2.10 Historia en las noticias: cuando un chatbot se equivoca","2.11 Hacia dónde vamos en la vida diaria","2.12 Comparación extendida de herramientas","2.13 Ejercicio de cierre"],
    ["3.1 ¿Qué es un código o comando?","3.2 Cuatro partes de un buen código","3.3 De código básico a código excelente","3.4 Ejercicio paso a paso: mejorar un código","3.5 Códigos para texto","3.6 Banco de códigos prácticos","3.7 Códigos para imágenes","3.8 Ejercicio con imagen: revisar una captura","3.9 Códigos en ChatGPT, Gemini y Copilot","3.10 Introducción a búsqueda bibliográfica","3.11 Historia en las noticias: citas falsas en un caso legal","3.12 Hacia dónde vamos: IA multimodal y asistentes personales","3.13 Ejercicio de cierre"],
    ["4.1 ¿Qué son las alucinaciones de IA?","4.2 Cómo verificar información","4.3 Privacidad: lo que no debe compartir","4.4 Noticias reales sobre IA y seguridad","4.5 Señales de alerta en mensajes sospechosos","4.6 Verificación de imágenes, videos y voces","4.7 Hacia dónde vamos: confianza digital","4.8 Seguridad como hábito, no como miedo","4.9 Ejercicio de cierre"],
    ["5.1 Preparación para la práctica independiente","5.2 Reto 1: Planificar un viaje tranquilo","5.3 Reto 2: Redactar una carta importante","5.4 Reto 3: Organizar información de salud sin compartir datos sensibles","5.5 Reto 4: Detectar una posible estafa","5.6 Reto 5: Crear una historia familiar","5.7 Escenario independiente: el mensaje sospechoso","5.8 Proyecto personal final","5.9 Plantillas de proyectos","5.10 Cierre: hacia dónde estamos yendo","5.11 Lista Final de Códigos favoritos","5.12 Cierre"]
  ]
};
const courseTopics=Object.fromEntries(Object.entries(currentCourseTopicTitles).map(([language,modules])=>[language,modules.map(titles=>titles.map(title=>({title,subs:[]})))]));

function renderCourseAccordions(){
  document.querySelectorAll(".module").forEach((module,moduleIndex)=>{
    module.querySelector(".module-num").textContent=`${lang==="en"?"Module":"Módulo"} ${String(moduleIndex+1).padStart(2,"0")}`;
    module.querySelector(":scope > ul")?.remove();
    let toggle=module.querySelector(".module-toggle");
    let details=module.querySelector(".module-details");
    if(!toggle){
      toggle=document.createElement("button");toggle.type="button";toggle.className="module-toggle";toggle.innerHTML="<span></span><b aria-hidden=\"true\">+</b>";
      details=document.createElement("div");details.className="module-details";
      module.append(toggle,details);
      toggle.addEventListener("click",()=>{const open=module.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open))});
    }
    toggle.setAttribute("aria-expanded",String(module.classList.contains("open")));
    toggle.setAttribute("aria-label",lang==="en"?`Show topics for module ${moduleIndex+1}`:`Mostrar temas del módulo ${moduleIndex+1}`);
    toggle.querySelector("span").textContent=lang==="en"?"View topics and subtopics":"Ver temas y subtemas";
    details.replaceChildren();
    let sequence=1;
    const addOutlineRow=(text,isSubtopic=false)=>{
      const row=document.createElement("div");row.className=`topic-row${isSubtopic?" subtopic":""}`;
      const number=document.createElement("span");number.className="topic-row-number";number.textContent=`${moduleIndex+1}.${sequence++}`;
      const label=document.createElement("span");label.className="topic-row-text";label.textContent=text.replace(/^\d+\.(?:\d+|[A-Z])\s*/i,"");
      row.append(number,label);details.appendChild(row);
    };
    const sourceTopics=courseTopics[lang][moduleIndex];
    let visibleTopics=moduleIndex===0
      ?[
        ...sourceTopics.slice(0,7),
        {...sourceTopics[7],subs:[]},
        {title:lang==="en"?"Practices":"Prácticas",subs:[]},
        ...sourceTopics.slice(8,10),
        {title:lang==="en"?"History and Reading on AI":"Historia y Lectura de la IA",subs:[]},
        ...sourceTopics.slice(12,-1)
      ]
      :sourceTopics;
    if(moduleIndex===1){
      const flatTopics=[];
      sourceTopics.forEach(topic=>{
        flatTopics.push({title:topic.title,subs:[]});
        topic.subs.forEach(subtopic=>flatTopics.push({title:subtopic,subs:[]}));
      });
      visibleTopics=[
        flatTopics[0],flatTopics[1],flatTopics[5],flatTopics[9],flatTopics[12],flatTopics[13],
        {title:lang==="en"?"Practical Case":"Caso Práctico",subs:[]},
        flatTopics[18],flatTopics[19],
        {title:lang==="en"?"History of AI Apps":"Historia de las Apps de IA",subs:[]},
        flatTopics[23],flatTopics[24],flatTopics[30]
      ];
    }
    if(moduleIndex===2){
      const flatTopics=[];
      sourceTopics.forEach(topic=>{
        flatTopics.push({title:topic.title,subs:[]});
        topic.subs.forEach(subtopic=>flatTopics.push({title:subtopic,subs:[]}));
      });
      visibleTopics=[
        flatTopics[0],flatTopics[1],flatTopics[2],flatTopics[8],flatTopics[9],
        flatTopics[11],flatTopics[12],flatTopics[13],flatTopics[14],flatTopics[15],
        flatTopics[22],flatTopics[23],flatTopics[24],flatTopics[25]
      ];
    }
    if(moduleIndex===3){
      const flatTopics=[];
      sourceTopics.forEach(topic=>{
        flatTopics.push({title:topic.title,subs:[]});
        topic.subs.forEach(subtopic=>flatTopics.push({title:subtopic,subs:[]}));
      });
      visibleTopics=[
        flatTopics[0],flatTopics[1],flatTopics[2],flatTopics[3],flatTopics[8],
        flatTopics[10],flatTopics[11],flatTopics[12],flatTopics[13],flatTopics[14],
        {title:lang==="en"?"Real Stories":"Historias Reales",subs:[]},flatTopics[17],flatTopics[22],flatTopics[23]
      ];
    }
    if(moduleIndex===4){
      const flatTopics=[];
      sourceTopics.forEach(topic=>{
        flatTopics.push({title:topic.title,subs:[]});
        topic.subs.forEach(subtopic=>flatTopics.push({title:subtopic,subs:[]}));
      });
      visibleTopics=[
        flatTopics[0],
        {title:lang==="en"?"AI Challenge":"Reto de la IA",subs:[]},
        flatTopics[6],flatTopics[7],flatTopics[9],flatTopics[10],
        {title:lang==="en"?"Project":"Proyecto",subs:[]},
        {title:lang==="en"?"Independent Practice":"Práctica independiente",subs:[]},
        flatTopics[19],
        {title:lang==="en"?"Closing":"Cierre",subs:[]}
      ];
    }
    const removedDisplayedPositions=[
      [8,10,11,12,14,15],
      [9,10],
      [7,13],
      [4,8,11],
      [10]
    ];
    visibleTopics=sourceTopics;
    visibleTopics.forEach(topic=>{addOutlineRow(topic.title);topic.subs.forEach(subtopic=>addOutlineRow(subtopic,true))});
  });
}

applyLanguage();
