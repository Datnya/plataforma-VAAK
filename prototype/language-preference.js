(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.VAAKLanguage=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const DEFAULT_LANGUAGE='en';
  const preferenceKey=userId=>`vaak-language-${userId||'guest'}`;
  const normalize=value=>value==='es'?'es':'en';
  const resolve=(role,storedLanguage,signedIn=true)=>!signedIn||role==='Client'?DEFAULT_LANGUAGE:normalize(storedLanguage);
  function save(storage,userId,language){const value=normalize(language);storage.setItem(preferenceKey(userId),value);return value}

  return Object.freeze({DEFAULT_LANGUAGE,preferenceKey,normalize,resolve,save});
});
