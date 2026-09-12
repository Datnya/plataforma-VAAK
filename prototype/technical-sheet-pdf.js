(function(root){
  'use strict';

  const encoder=new TextEncoder();
  const FOOTER_TEXT='HPG International Latinoamericana SAC · Av. Alfredo Benavides 1180, Lima, Peru · hpgilatam.com';
  const ascii=value=>encoder.encode(String(value));
  const join=parts=>{let size=parts.reduce((sum,part)=>sum+part.length,0),output=new Uint8Array(size),offset=0;for(const part of parts){output.set(part,offset);offset+=part.length}return output};

  function buildPdf(images){
    if(!images.length)throw new Error('At least one PDF page is required.');
    const objectCount=2+images.length*3,objects=new Array(objectCount+1);
    objects[1]=[ascii('<< /Type /Catalog /Pages 2 0 R >>')];
    const pageRefs=images.map((_,index)=>`${3+index*3} 0 R`).join(' ');
    objects[2]=[ascii(`<< /Type /Pages /Count ${images.length} /Kids [${pageRefs}] >>`)];
    images.forEach((image,index)=>{
      const pageObject=3+index*3,contentObject=pageObject+1,imageObject=pageObject+2,imageName=`Im${index+1}`;
      const command=ascii(`q\n595.28 0 0 841.89 0 0 cm\n/${imageName} Do\nQ\n`);
      objects[pageObject]=[ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /${imageName} ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`)];
      objects[contentObject]=[ascii(`<< /Length ${command.length} >>\nstream\n`),command,ascii('endstream')];
      objects[imageObject]=[ascii(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`),image.bytes,ascii('\nendstream')];
    });
    const chunks=[new Uint8Array([37,80,68,70,45,49,46,52,10,37,226,227,207,211,10])],offsets=new Array(objectCount+1).fill(0);
    let position=chunks[0].length;
    for(let index=1;index<=objectCount;index++){
      offsets[index]=position;
      const wrapped=[ascii(`${index} 0 obj\n`),...objects[index],ascii('\nendobj\n')];
      chunks.push(...wrapped);
      position+=wrapped.reduce((sum,part)=>sum+part.length,0);
    }
    const xrefOffset=position,xref=[`xref\n0 ${objectCount+1}\n0000000000 65535 f \n`];
    for(let index=1;index<=objectCount;index++)xref.push(`${String(offsets[index]).padStart(10,'0')} 00000 n \n`);
    xref.push(`trailer\n<< /Size ${objectCount+1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`);
    chunks.push(ascii(xref.join('')));
    return join(chunks);
  }

  const blobAsDataUrl=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob)});
  const canvasAsJpeg=canvas=>new Promise((resolve,reject)=>canvas.toBlob(async blob=>{if(!blob)return reject(new Error('The PDF page could not be encoded.'));resolve(new Uint8Array(await blob.arrayBuffer()))},'image/jpeg',0.96));
  const loadImage=source=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('The technical sheet could not be rendered.'));image.src=source});

  async function inlineImages(source,clone){
    const originals=Array.from(source.querySelectorAll('img')),copies=Array.from(clone.querySelectorAll('img'));
    await Promise.all(copies.map(async(copy,index)=>{
      const original=originals[index],url=original?.currentSrc||original?.src||copy.getAttribute('src');
      if(!url||url.startsWith('data:')){if(url)copy.setAttribute('src',url);return}
      try{copy.setAttribute('src',await blobAsDataUrl(await (await fetch(url)).blob()))}catch{copy.setAttribute('src',url)}
    }));
  }

  function documentCss(){
    const rules=[];
    for(const sheet of Array.from(document.styleSheets)){try{for(const rule of Array.from(sheet.cssRules||[]))rules.push(rule.cssText)}catch{}}
    return rules.join('\n');
  }

  async function renderSheet(element){
    if(document.fonts?.ready)await document.fonts.ready;
    await Promise.all(Array.from(element.querySelectorAll('img')).map(image=>image.complete?Promise.resolve():new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true})})));
    const width=Math.ceil(element.scrollWidth||element.getBoundingClientRect().width),clone=element.cloneNode(true);
    clone.style.margin='0';
    clone.style.width=`${width}px`;
    clone.style.minHeight='0';
    clone.style.height='auto';
    clone.querySelector('.hpg-ts-footer')?.remove();
    await inlineImages(element,clone);
    const measureHost=document.createElement('div');
    measureHost.style.cssText='position:fixed;left:-100000px;top:0;width:'+width+'px;visibility:hidden;pointer-events:none;';
    measureHost.appendChild(clone);document.body.appendChild(measureHost);
    const height=Math.max(1,Math.ceil(clone.scrollHeight||clone.getBoundingClientRect().height));
    const markup=new XMLSerializer().serializeToString(clone),css=documentCss().replace(/]]>/g,'] ]>');
    measureHost.remove();
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><style><![CDATA[${css}]]></style>${markup}</div></foreignObject></svg>`;
    const svgUrl=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));
    try{
      const image=await loadImage(svgUrl),scale=Math.max(1,Math.min(2,30000/height)),canvas=document.createElement('canvas');
      canvas.width=Math.ceil(width*scale);canvas.height=Math.ceil(height*scale);
      const context=canvas.getContext('2d',{alpha:false});context.fillStyle='#fff';context.fillRect(0,0,canvas.width,canvas.height);context.drawImage(image,0,0,canvas.width,canvas.height);
      return canvas;
    }finally{URL.revokeObjectURL(svgUrl)}
  }

  function pageCountForHeight(contentHeight,pageHeight,footerHeight){return Math.max(1,Math.ceil(contentHeight/Math.max(1,pageHeight-footerHeight)))}

  function drawFooter(context,width,height,scale,pageNumber){
    const margin=Math.round(48*scale),footerHeight=Math.round(42*scale),lineY=height-footerHeight;
    context.save();
    context.strokeStyle='#bfbfbf';context.lineWidth=Math.max(1,Math.round(.6*scale));context.beginPath();context.moveTo(margin,lineY);context.lineTo(width-margin,lineY);context.stroke();
    context.fillStyle='#9b7a5b';context.font=`${Math.max(9,Math.round(9*scale))}px Aptos, "Segoe UI", Arial, sans-serif`;context.textBaseline='middle';
    const textY=lineY+Math.round(19*scale);context.textAlign='left';context.fillText(FOOTER_TEXT,margin,textY);context.textAlign='right';context.fillText(`Page ${pageNumber}`,width-margin,textY);context.restore();
  }

  async function download(element,filename='technical-specification-sheet.pdf'){
    if(!element)throw new Error('Technical sheet not found.');
    const canvas=await renderSheet(element),pageHeight=Math.round(canvas.width*(841.89/595.28)),scale=canvas.width/794,footerHeight=Math.round(42*scale),contentPageHeight=pageHeight-footerHeight,pages=[],pageCount=pageCountForHeight(canvas.height,pageHeight,footerHeight);
    for(let pageIndex=0;pageIndex<pageCount;pageIndex++){
      const top=pageIndex*contentPageHeight;
      const page=document.createElement('canvas');page.width=canvas.width;page.height=pageHeight;
      const context=page.getContext('2d',{alpha:false});context.fillStyle='#fff';context.fillRect(0,0,page.width,page.height);
      const sliceHeight=Math.min(contentPageHeight,Math.max(0,canvas.height-top));if(sliceHeight)context.drawImage(canvas,0,top,canvas.width,sliceHeight,0,0,canvas.width,sliceHeight);drawFooter(context,page.width,page.height,scale,pageIndex+1);
      pages.push({bytes:await canvasAsJpeg(page),width:page.width,height:page.height});
    }
    const pdf=buildPdf(pages),link=document.createElement('a');
    link.href=URL.createObjectURL(new Blob([pdf],{type:'application/pdf'}));link.download=filename;document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),2000);
  }

  root.VAAKTechnicalSheetPDF=Object.freeze({FOOTER_TEXT,buildPdf,download,pageCountForHeight});
})(typeof globalThis!=='undefined'?globalThis:this);
