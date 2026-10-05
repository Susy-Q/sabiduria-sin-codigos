(()=>{
  "use strict";
  const moduleView=document.getElementById("moduleView");if(!moduleView)return;
  let applying=false,scheduled=false;
  function language(){return (localStorage.getItem("id-course-language")||"en")==="es"?"es":"en"}
  function currentModuleIndex(){const match=location.hash.match(/^#module-(\d)/);return match?Number(match[1])-1:null}
  function setTopicVisibility(heading,completionButton,available){
    heading.hidden=!available;heading.classList.toggle("topic-content-locked",!available);
    let node=heading.nextElementSibling;
    while(node){
      const isBoundary=node.matches("[data-course-topic]");if(isBoundary)break;
      node.hidden=!available;node.classList.toggle("topic-content-locked",!available);
      if(node===completionButton)break;node=node.nextElementSibling;
    }
  }
  function applySequence(){
    if(applying)return;applying=true;
    const index=currentModuleIndex(),container=moduleView.querySelector(".document-content");
    if(index===null||!container){applying=false;return}
    const headings=[...container.querySelectorAll("[data-course-topic]")];
    if(!headings.length){applying=false;return}
    const reached=typeof topicProgress==="function"?topicProgress(index):0;
    headings.forEach((heading,topicIndex)=>{
      const button=moduleView.querySelector(`[data-complete-module="${index}"][data-complete-topic="${topicIndex}"]`);
      setTopicVisibility(heading,button,topicIndex<=reached);
    });
    container.querySelectorAll(".doc-section").forEach(section=>{const sectionTopics=[...section.querySelectorAll(":scope > [data-course-topic]")];section.classList.toggle("topic-section-locked",sectionTopics.length>0&&sectionTopics.every(heading=>heading.hidden))});
    const topicsComplete=reached>=headings.length;
    const gated=[moduleView.querySelector("#activities"),moduleView.querySelector("#module-review"),moduleView.querySelector("#resources"),moduleView.querySelector(".module-footer-nav")].filter(Boolean);
    gated.forEach(section=>{section.hidden=!topicsComplete;section.classList.toggle("topic-content-locked",!topicsComplete)});
    let notice=moduleView.querySelector(".topic-sequence-notice");
    if(!topicsComplete){
      if(!notice){notice=document.createElement("div");notice.className="topic-sequence-notice";container.after(notice)}
      const remaining=Math.max(0,headings.length-reached-1),lang=language();
      const noticeContent=lang==="es"?`<span aria-hidden="true">🔓</span><div><strong>Complete un tema a la vez</strong><p>Finalice el tema visible para habilitar el siguiente. Después de los temas se mostrarán las actividades y el repaso final. ${remaining?`Quedan ${remaining} temas por habilitar.`:""}</p></div>`:`<span aria-hidden="true">🔓</span><div><strong>Complete one topic at a time</strong><p>Finish the visible topic to unlock the next one. Activities and the final review will appear after the topics. ${remaining?`${remaining} topics remain to be unlocked.`:""}</p></div>`;
      if(notice.innerHTML!==noticeContent)notice.innerHTML=noticeContent;
      notice.hidden=false;
    }else if(notice)notice.remove();
    applying=false;
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;applySequence()})}
  new MutationObserver(schedule).observe(moduleView,{childList:true,subtree:true});
  document.addEventListener("click",event=>{
    const button=event.target.closest("[data-complete-topic]");if(!button)return;
    const completedIndex=Number(button.dataset.completeTopic),moduleIndex=Number(button.dataset.completeModule);
    setTimeout(()=>{applySequence();const next=document.getElementById(`module-${moduleIndex+1}-topic-${completedIndex+1}`);if(next&&!next.hidden){next.classList.add("topic-newly-unlocked");next.scrollIntoView({behavior:"smooth",block:"start"});setTimeout(()=>next.classList.remove("topic-newly-unlocked"),900)}},0);
  });
  document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>setTimeout(applySequence,0)));
  applySequence();
})();
