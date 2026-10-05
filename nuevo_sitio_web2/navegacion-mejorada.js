(()=>{
  "use strict";
  const sidebar=document.querySelector(".course-sidebar"),sidebarNav=document.getElementById("courseSidebarNav"),headerTools=document.querySelector(".header-tools"),moduleView=document.getElementById("moduleView");
  if(!sidebar||!sidebarNav)return;
  const es=()=>((localStorage.getItem("id-course-language")||"en")==="es");
  function destination(){
    let moduleIndex=0;
    if(typeof isModuleUnlocked==="function"){for(let index=0;index<5;index++){if(isModuleUnlocked(index))moduleIndex=index;else break}}
    const topicIndex=typeof topicProgress==="function"?Math.max(0,topicProgress(moduleIndex)):0;
    const topics=typeof getModuleNavigationTopics==="function"?getModuleNavigationTopics(moduleIndex):[];
    return {moduleIndex,topicIndex:Math.min(topicIndex,Math.max(0,topics.length-1)),topicTotal:topics.length};
  }
  function goToDestination(){const target=destination();if(typeof goToModuleTopic==="function")goToModuleTopic(target.moduleIndex,target.topicIndex);else if(typeof renderModule==="function")renderModule(target.moduleIndex)}
  const continueButton=document.createElement("button");continueButton.type="button";continueButton.className="sidebar-continue";continueButton.innerHTML='<span class="sidebar-continue-icon" aria-hidden="true">▶</span><span><strong></strong><small></small></span>';continueButton.addEventListener("click",goToDestination);
  sidebarNav.before(continueButton);
  const mobileButton=document.createElement("button");mobileButton.type="button";mobileButton.className="mobile-continue-course";mobileButton.innerHTML='<span aria-hidden="true">▶</span><span></span>';mobileButton.addEventListener("click",goToDestination);if(headerTools)headerTools.prepend(mobileButton);
  function shortDescription(){
    const active=sidebarNav.querySelector(".sidebar-topic-item.active");if(!active)return "";
    const topicIndex=[...sidebarNav.querySelectorAll(".sidebar-topic-item")].indexOf(active);
    const activeHeading=moduleView?.querySelector(`[data-course-topic="${typeof currentTopicIndex==="number"?currentTopicIndex:topicIndex}"]`);
    if(!activeHeading)return "";
    let node=activeHeading.nextElementSibling;
    while(node&&node.matches(".topic-complete-button,.guided-more"))node=node.nextElementSibling;
    const text=node?.textContent?.replace(/\s+/g," ").trim()||"";
    return text.length>145?`${text.slice(0,142).trim()}…`:text;
  }
  let updating=false,sidebarObserver;
  function update(){
    if(updating)return;updating=true;sidebarObserver?.disconnect();
    const target=destination(),moduleLabel=es()?"Módulo":"Module",topicLabel=es()?"Tema":"Topic";
    continueButton.querySelector("strong").textContent=es()?"Continuar donde quedé":"Continue where I left off";
    continueButton.querySelector("small").textContent=`${moduleLabel} ${target.moduleIndex+1} · ${topicLabel} ${target.topicIndex+1}`;
    continueButton.setAttribute("aria-label",`${continueButton.querySelector("strong").textContent}. ${continueButton.querySelector("small").textContent}`);
    mobileButton.querySelector("span:last-child").textContent=es()?"Continuar donde quedé":"Continue where I left off";
    sidebarNav.querySelectorAll(".sidebar-lock-label,.sidebar-active-description").forEach(element=>element.remove());
    sidebarNav.querySelectorAll(".sidebar-topic-item:disabled").forEach(item=>{const topicText=item.textContent.trim(),label=document.createElement("small");label.className="sidebar-lock-label";label.textContent=es()?"Bloqueado · Complete el tema anterior":"Locked · Complete the previous topic";item.appendChild(label);item.setAttribute("aria-label",`${topicText}. ${label.textContent}`)});
    const active=sidebarNav.querySelector(".sidebar-topic-item.active"),description=shortDescription();
    if(active&&description){const panel=document.createElement("div");panel.className="sidebar-active-description";panel.innerHTML=`<strong>${es()?"Tema actual":"Current topic"}</strong><span></span>`;panel.querySelector("span").textContent=description;active.after(panel)}
    sidebarObserver?.observe(sidebarNav,{childList:true,subtree:true});updating=false;
  }
  let scheduled=false;const schedule=()=>{if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;update()})};
  sidebarObserver=new MutationObserver(schedule);sidebarObserver.observe(sidebarNav,{childList:true,subtree:true});if(moduleView)new MutationObserver(schedule).observe(moduleView,{childList:true,subtree:true});
  document.querySelectorAll("[data-lang]").forEach(button=>button.addEventListener("click",()=>setTimeout(update,0)));
  update();
})();
