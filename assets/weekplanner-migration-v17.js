(()=>{
  'use strict';
  const original=window.periodisation;
  if(typeof original!=='function')return;
  window.periodisation=function(){
    try{
      const active=typeof team==='function'?team():null;
      const weeks=ws?.data?.smartPeriodisation?.[active?.id]?.weeks;
      if(weeks){
        let changed=false;
        for(const [key,plan] of Object.entries(weeks)){
          if(!plan?.theme?.titleNl&&!plan?.theme?.titleEn){delete weeks[key];changed=true}
        }
        if(changed&&typeof save==='function')save();
      }
    }catch(error){console.warn('Weekplanner migration',error)}
    return original();
  };
})();