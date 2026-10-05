(()=>{
  "use strict";
  if(!location.pathname.startsWith("/course")||window.__COURSE_REVIEW__)return;
  const timestampKey="id-course-progress-local-updated-at";
  const managedKey=key=>key.startsWith("id-v2-")||key==="id-course-language";
  const snapshot=()=>{const result={};for(let index=0;index<localStorage.length;index++){const key=localStorage.key(index);if(key&&managedKey(key))result[key]=localStorage.getItem(key)||""}return result};
  let timer=null,saving=false,pending=false;
  async function save(){
    if(saving){pending=true;return}saving=true;
    try{const response=await fetch("/api/progress",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({progress:snapshot()})});if(response.ok){const data=await response.json();localStorage.setItem(timestampKey,String(data.updatedAt||Date.now()))}}
    catch{}finally{saving=false;if(pending){pending=false;schedule()}}
  }
  function schedule(){clearTimeout(timer);localStorage.setItem(timestampKey,String(Date.now()));timer=setTimeout(save,700)}
  async function restore(){
    try{
      const response=await fetch("/api/progress",{headers:{"Accept":"application/json"}});if(!response.ok)return;
      const data=await response.json(),localUpdated=Number(localStorage.getItem(timestampKey)||0),remoteUpdated=Number(data.updatedAt||0);
      if(remoteUpdated>localUpdated&&data.progress&&Object.keys(data.progress).length){
        Object.entries(data.progress).forEach(([key,value])=>{if(managedKey(key)&&typeof value==="string")localStorage.setItem(key,value)});
        localStorage.setItem(timestampKey,String(remoteUpdated));
        if(!sessionStorage.getItem("id-course-progress-restored")){sessionStorage.setItem("id-course-progress-restored","1");location.reload()}
      }else if(Object.keys(snapshot()).length)save();
    }catch{}
  }
  window.addEventListener("course-progress-changed",schedule);
  window.addEventListener("storage",event=>{if(event.key&&managedKey(event.key))schedule()});
  restore();
})();
