(()=>{
  "use strict";
  const key="id-course-registration-success";
  const studentName=sessionStorage.getItem(key);if(!studentName)return;
  sessionStorage.removeItem(key);
  const es=(localStorage.getItem("id-course-language")||"en")==="es";
  const overlay=document.createElement("div");overlay.className="registration-success";overlay.setAttribute("role","dialog");overlay.setAttribute("aria-modal","true");overlay.setAttribute("aria-labelledby","registrationSuccessTitle");
  const card=document.createElement("div");card.className="registration-success-card";
  const icon=document.createElement("div");icon.className="registration-success-icon";icon.setAttribute("aria-hidden","true");icon.textContent="✓";
  const title=document.createElement("h2");title.id="registrationSuccessTitle";title.textContent=es?"¡Registro completado!":"Registration complete!";
  const message=document.createElement("p");message.textContent=es?`Bienvenido, ${studentName}. Su acceso fue creado correctamente. Puede comenzar con el Módulo 1 y su progreso se guardará automáticamente.`:`Welcome, ${studentName}. Your access was created successfully. You can begin Module 1, and your progress will be saved automatically.`;
  const button=document.createElement("button");button.type="button";button.textContent=es?"Comenzar el Módulo 1":"Start Module 1";
  card.append(icon,title,message,button);overlay.appendChild(card);document.body.appendChild(overlay);button.focus();
  button.addEventListener("click",()=>{overlay.remove();document.dispatchEvent(new CustomEvent("course:registration-welcome-closed"))});
})();
