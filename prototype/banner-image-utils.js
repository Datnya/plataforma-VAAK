(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.VAAKBannerImages=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const ASPECT_RATIO=4;
  const IDEAL_WIDTH=2880;
  const IDEAL_HEIGHT=720;
  const MIN_WIDTH=1600;
  const MIN_HEIGHT=400;
  const MAX_SOURCE_BYTES=15*1024*1024;
  const MAX_OUTPUT_BYTES=600*1024;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

  function coverCrop(sourceWidth,sourceHeight,focusX=0,focusY=0,zoom=1){
    let width=Math.max(1,Number(sourceWidth)||1),height=Math.max(1,Number(sourceHeight)||1),safeZoom=clamp(Number(zoom)||1,1,3),baseWidth,baseHeight;
    if(width/height>ASPECT_RATIO){baseHeight=height;baseWidth=height*ASPECT_RATIO}else{baseWidth=width;baseHeight=width/ASPECT_RATIO}
    let cropWidth=baseWidth/safeZoom,cropHeight=baseHeight/safeZoom,maxX=width-cropWidth,maxY=height-cropHeight;
    return {x:maxX*clamp((Number(focusX)+100)/200,0,1),y:maxY*clamp((Number(focusY)+100)/200,0,1),width:cropWidth,height:cropHeight};
  }
  function outputSize(crop){
    let width=Math.max(1,Math.min(IDEAL_WIDTH,Math.floor(crop?.width||1))),height=Math.max(1,Math.floor(width/ASPECT_RATIO));
    return {width,height};
  }
  function qualityFor(width,height){
    if(width>=IDEAL_WIDTH&&height>=IDEAL_HEIGHT)return 'ideal';
    if(width>=MIN_WIDTH&&height>=MIN_HEIGHT)return 'acceptable';
    return 'low';
  }
  function focusAfterDrag(startFocus,deltaPixels,viewportPixels){
    return clamp((Number(startFocus)||0)-(Number(deltaPixels)||0)/Math.max(1,Number(viewportPixels)||1)*200,-100,100);
  }
  const formatBytes=bytes=>{let value=Number(bytes)||0;if(value>=1024*1024)return`${(value/1024/1024).toFixed(1)} MB`;if(value>=1024)return`${Math.round(value/1024)} KB`;return`${value} B`};

  return Object.freeze({ASPECT_RATIO,IDEAL_WIDTH,IDEAL_HEIGHT,MIN_WIDTH,MIN_HEIGHT,MAX_SOURCE_BYTES,MAX_OUTPUT_BYTES,coverCrop,outputSize,qualityFor,focusAfterDrag,formatBytes});
});
