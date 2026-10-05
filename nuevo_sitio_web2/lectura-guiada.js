(()=>{
  "use strict";
  const moduleView=document.getElementById("moduleView");
  if(!moduleView)return;

  function isSpanish(){return document.documentElement.lang.toLowerCase().startsWith("es")}
  function meaningfulSiblings(heading,completionButton){
    const nodes=[];
    let node=heading.nextSibling;
    while(node&&node!==completionButton){
      if(node.nodeType===Node.ELEMENT_NODE)nodes.push(node);
      node=node.nextSibling;
    }
    return nodes.filter(node=>!node.matches(".guided-more,.topic-complete-button"));
  }
  function addReadingNote(container){
    if(container.querySelector(":scope > .guided-reading-note"))return;
    const note=document.createElement("div");
    note.className="guided-reading-note";
    note.setAttribute("role","note");
    note.innerHTML=isSpanish()
      ?'<span aria-hidden="true">👓</span><div><strong>Lectura sencilla, paso a paso</strong><p>Lea primero la información esencial. Si desea ampliar la explicación, seleccione “Quiero aprender más”.</p></div>'
      :'<span aria-hidden="true">👓</span><div><strong>Simple, step-by-step reading</strong><p>Read the essential information first. To see the extended explanation, select “I want to learn more”.</p></div>';
    container.prepend(note);
  }
  function enhanceTopic(heading){
    if(heading.dataset.guidedTopic==="true")return;
    heading.dataset.guidedTopic="true";
    heading.classList.add("guided-topic-heading");
    const moduleIndex=heading.closest("#moduleView")?.querySelector("[data-complete-module]")?.dataset.completeModule;
    const topicIndex=heading.dataset.courseTopic;
    const completionButton=moduleView.querySelector(`[data-complete-module="${moduleIndex}"][data-complete-topic="${topicIndex}"]`);
    if(!completionButton||completionButton.parentElement!==heading.parentElement)return;
    const blocks=meaningfulSiblings(heading,completionButton);
    if(blocks.length<=4)return;
    const details=document.createElement("details");
    details.className="guided-more";
    const summary=document.createElement("summary");
    summary.textContent=isSpanish()?"Quiero aprender más":"I want to learn more";
    const content=document.createElement("div");
    content.className="guided-more-content";
    blocks.slice(3).forEach(block=>content.appendChild(block));
    details.append(summary,content);
    completionButton.before(details);
  }
  function enhance(){
    const container=moduleView.querySelector(".document-content");
    if(!container||container.dataset.guidedReady==="true")return;
    const headings=[...container.querySelectorAll("[data-course-topic]")];
    if(!headings.length)return;
    container.dataset.guidedReady="true";
    addReadingNote(container);
    headings.forEach(enhanceTopic);
  }
  const observer=new MutationObserver(enhance);
  observer.observe(moduleView,{childList:true,subtree:true});
  enhance();
})();
