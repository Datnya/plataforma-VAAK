/* Exportador XLSX local basado en los formatos maestros HPG proporcionados. */
(() => {
  const enc = new TextEncoder();
  const Money=window.VAAKMoney||{round:value=>Math.round((Number(String(value??'').replace(/[^0-9.-]/g,''))||0)*1000)/1000};
  const assetCache = new Map();
  const REPORT_ASSETS = {
    logo: 'assets/reports/hpg-report-logo.png',
    poStyles: 'assets/reports/po-styles.xml?v=2',
    invoiceStyles: 'assets/reports/invoice-styles.xml?v=2'
  };

  const escapeXml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;' }[char]));
  const col = index => { let result=''; for(index++; index; index=Math.floor((index-1)/26)) result=String.fromCharCode(65+(index-1)%26)+result; return result; };
  const crcTable = (() => { const table=[]; for(let i=0;i<256;i++){let value=i;for(let bit=0;bit<8;bit++) value=value&1 ? 0xedb88320^(value>>>1) : value>>>1;table[i]=value>>>0;} return table; })();
  const crc32 = bytes => { let value=0xffffffff; for(const byte of bytes)value=crcTable[(value^byte)&255]^(value>>>8); return (value^0xffffffff)>>>0; };
  const u16 = value => new Uint8Array([value&255,(value>>>8)&255]);
  const u32 = value => new Uint8Array([value&255,(value>>>8)&255,(value>>>16)&255,(value>>>24)&255]);
  const concat = parts => { const length=parts.reduce((total,part)=>total+part.length,0),result=new Uint8Array(length);let offset=0;for(const part of parts){result.set(part,offset);offset+=part.length;}return result; };
  const zip = files => { let offset=0,local=[],central=[]; for(const [name,content] of files){const nameBytes=enc.encode(name),bytes=typeof content==='string'?enc.encode(content):content,crc=crc32(bytes);local.push(concat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(bytes.length),u32(bytes.length),u16(nameBytes.length),u16(0),nameBytes,bytes]));central.push(concat([u32(0x02014b50),u16(20),u16(20),u16(0),u16(0),u16(0),u16(0),u32(crc),u32(bytes.length),u32(bytes.length),u16(nameBytes.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),nameBytes]));offset+=local.at(-1).length;}const body=concat(local),directory=concat(central);return concat([body,directory,u32(0x06054b50),u16(0),u16(0),u16(files.length),u16(files.length),u32(directory.length),u32(body.length),u16(0)]); };

  const loadAsset = async (path,type) => {
    const key=`${type}:${path}`;
    if(!assetCache.has(key))assetCache.set(key,fetch(path).then(response=>{if(!response.ok)throw new Error(`No se pudo cargar ${path}`);return type==='text'?response.text():response.arrayBuffer();}).then(value=>type==='text'?value:new Uint8Array(value)));
    return assetCache.get(key);
  };

  const drawingXml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><xdr:wsDr xmlns:xdr="http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><xdr:oneCellAnchor><xdr:from><xdr:col>0</xdr:col><xdr:colOff>76200</xdr:colOff><xdr:row>0</xdr:row><xdr:rowOff>57150</xdr:rowOff></xdr:from><xdr:ext cx="2207419" cy="971550"/><xdr:pic><xdr:nvPicPr><xdr:cNvPr id="2" name="HPG International"/><xdr:cNvPicPr><a:picLocks noChangeAspect="1"/></xdr:cNvPicPr></xdr:nvPicPr><xdr:blipFill><a:blip xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></xdr:blipFill><xdr:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="2207419" cy="971550"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></xdr:spPr></xdr:pic><xdr:clientData/></xdr:oneCellAnchor></xdr:wsDr>';
  const drawingRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image1.png"/></Relationships>';
  const sheetRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/drawing" Target="../drawings/drawing1.xml"/></Relationships>';
  const contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="png" ContentType="image/png"/><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/drawings/drawing1.xml" ContentType="application/vnd.openxmlformats-officedocument.drawing+xml"/></Types>';
  const rootRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>';
  const workbookRels = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>';

  const packageFile = async (name,xml,stylesPath) => {
    const [styles,logo]=await Promise.all([loadAsset(stylesPath,'text'),loadAsset(REPORT_ASSETS.logo,'bytes')]);
    return zip([
      ['[Content_Types].xml',contentTypes],
      ['_rels/.rels',rootRels],
      ['xl/workbook.xml',`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><bookViews><workbookView/></bookViews><sheets><sheet name="${escapeXml(name)}" sheetId="1" r:id="rId1"/></sheets><calcPr calcId="0"/></workbook>`],
      ['xl/_rels/workbook.xml.rels',workbookRels],
      ['xl/styles.xml',styles],
      ['xl/worksheets/sheet1.xml',xml],
      ['xl/worksheets/_rels/sheet1.xml.rels',sheetRels],
      ['xl/drawings/drawing1.xml',drawingXml],
      ['xl/drawings/_rels/drawing1.xml.rels',drawingRels],
      ['xl/media/image1.png',logo]
    ]);
  };

  const isBlank = value => value===null||value===undefined||value==='';
  const numberValue = value => Number(String(value ?? '').replace(/[^0-9.-]/g,'')) || 0;
  const moneyValue = value => Money.round(value);
  const normalizeCurrency = value => {const raw=String(value??'').trim(),api=window.VAAKMoney;if(raw&&api){const found=api.currencyFrom(raw,'');if(found)return api.codeOf(found);if(/^[A-Z]{3}$/i.test(raw))return raw.toUpperCase()}const text=raw.toUpperCase();if(text.includes('USD')||text.includes('$'))return 'USD';if(text.includes('EUR')||text.includes('€'))return 'EUR';if(text.includes('COP'))return 'COP';return 'PEN';};
  const excelDate = value => {
    if(isBlank(value))return null;
    if(typeof value==='number')return value;
    const text=String(value).trim();
    let match=text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/),date;
    if(match)date=new Date(Date.UTC(Number(match[3]),Number(match[2])-1,Number(match[1])));
    else if(/^\d{4}-\d{2}-\d{2}/.test(text)){const [year,month,day]=text.slice(0,10).split('-').map(Number);date=new Date(Date.UTC(year,month-1,day));}
    else date=new Date(text);
    return Number.isNaN(date.getTime())?null:(Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate())-Date.UTC(1899,11,30))/86400000;
  };
  const displayNumber = value => new Intl.NumberFormat('en-US',{maximumFractionDigits:3}).format(Number(value)||0);
  const uniqueText = (...values) => [...new Set(values.flatMap(value=>String(value??'').split('|')).map(value=>value.trim()).filter(Boolean))].join(' | ');
  const safeName = value => String(value||'Project').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'_').replace(/^_+|_+$/g,'');
  // El item de la orden guarda el id interno del spec; aqui se traduce al
  // codigo visible (SPEC-682). Sin esto el Excel imprimia sp-1789657319006.
  const unidadDeSpec = (specs,specId) => {
    const spec=Array.isArray(specs)&&specId?specs.find(item=>item.id===specId):null;
    return spec?String(spec.unit||'').trim():'';
  };
  const codigoDeSpec = (specs,specId) => {
    if(!specId||!Array.isArray(specs))return '';
    const spec=specs.find(item=>item.id===specId);
    if(!spec)return '';
    if(spec.code)return spec.code;
    // Misma regla que specCode() en app.js, para que el Excel diga lo mismo que la pantalla.
    const raw=String(spec.id||''),digits=raw.replace(/\D/g,'');
    if(digits)return 'SPEC-'+digits.slice(-3).padStart(3,'0');
    let h=0;for(let i=0;i<raw.length;i++)h=(h*31+raw.charCodeAt(i))>>>0;
    return 'SPEC-'+String(h%900+100);
  };
  const projectHeading = project => `${project.code||'—'} · ${String(project.name||'PROJECT').toUpperCase()}`;

  const cell = (row,column,value,style,kind='text') => {
    const reference=`${col(column)}${row}`;
    if(isBlank(value))return `<c r="${reference}" s="${style}"/>`;
    if(kind==='number')return `<c r="${reference}" s="${style}"><v>${Number(value)||0}</v></c>`;
    if(kind==='date'){
      const serial=excelDate(value);
      return serial===null?`<c r="${reference}" s="${style}"/>`:`<c r="${reference}" s="${style}"><v>${serial}</v></c>`;
    }
    return `<c r="${reference}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
  };

  const sheet = ({kind,project,metrics,headers,rows,widths}) => {
    const isPo=kind==='po',columnCount=headers.length,lastColumn=col(columnCount-1),title=isPo?'PO Item Listing':'Payment Request Details';
    const titleStyle=isPo?23:21,projectStyle=isPo?25:23,subtitleStyle=isPo?26:24,metricLabelStyle=isPo?21:26,metricValueStyle=isPo?22:27;
    const metricColumns=isPo?[7,9,11,13,15,17]:[5,7,9,11,13];
    const mergedTitleEnd=isPo?'M':'K',mergedSubtitleEnd=isPo?'S':'Q';
    const rowXml=[];
    rowXml.push(`<row r="1" ht="30" customHeight="1">${cell(1,3,title,titleStyle)}</row>`);
    rowXml.push(`<row r="2" ht="15" customHeight="1">${cell(2,3,projectHeading(project),projectStyle)}</row>`);
    rowXml.push(`<row r="3" ht="12" customHeight="1">${cell(3,3,'HPG INTERNATIONAL LATINOAMERICANA SAC · REPORT GENERATED BY VAAK',subtitleStyle)}</row>`);
    rowXml.push(`<row r="4" ht="13.05" customHeight="1">${metrics.map((metric,index)=>cell(4,metricColumns[index],metric.label,metricLabelStyle)).join('')}</row>`);
    rowXml.push(`<row r="5" ht="16.95" customHeight="1">${metrics.map((metric,index)=>cell(5,metricColumns[index],displayNumber(metric.value),metricValueStyle)).join('')}</row>`);
    rowXml.push('<row r="6" ht="6" customHeight="1"/>');
    rowXml.push(`<row r="7" ht="25.95" customHeight="1">${headers.map((header,index)=>cell(7,index,header,[4,7,8].includes(index)?2:1)).join('')}</row>`);
    rows.forEach((record,index)=>{
      const row=index+8;
      rowXml.push(`<row r="${row}">${record.map((entry,column)=>cell(row,column,entry.value,entry.style,entry.kind)).join('')}</row>`);
    });
    const dataLast=rows.length+7,totalRow=dataLast+1,noteRow=dataLast+3,totalLabel=isPo?`TOTAL · ${displayNumber(rows.length)} line items`:`TOTAL · ${displayNumber(rows.length)} invoices`;
    const totalCells=Array.from({length:columnCount},(_,index)=>cell(totalRow,index,index===0?totalLabel:'',19));
    rowXml.push(`<row r="${totalRow}" ht="18" customHeight="1">${totalCells.join('')}</row>`);
    rowXml.push(`<row r="${totalRow+1}" ht="7.95" customHeight="1"/>`);
    const note=isPo?'SUB = Submitted · POC = PO Confirmed · blank cells = no data / pending · dates in dd/mm/yy format':'FF&E = Furniture, Fixtures & Equipment · OS&E = Operating Supplies & Equipment · blank cells = no data / pending · dates in dd/mm/yy format · totals by currency';
    rowXml.push(`<row r="${noteRow}">${cell(noteRow,0,note,isPo?27:25)}</row>`);
    const columns=widths.map((width,index)=>`<col min="${index+1}" max="${index+1}" width="${width}" customWidth="1"/>`).join('');
    const filterLast=Math.max(7,dataLast);
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheetPr><pageSetUpPr fitToPage="1"/></sheetPr><dimension ref="A1:${lastColumn}${noteRow}"/><sheetViews><sheetView showGridLines="0" tabSelected="1" workbookViewId="0"><pane ySplit="7" topLeftCell="A8" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft" activeCell="A7" sqref="A7"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="13.8"/><cols>${columns}</cols><sheetData>${rowXml.join('')}</sheetData><autoFilter ref="A7:${lastColumn}${filterLast}"/><mergeCells count="4"><mergeCell ref="D1:${mergedTitleEnd}1"/><mergeCell ref="D2:${mergedTitleEnd}2"/><mergeCell ref="D3:${mergedSubtitleEnd}3"/><mergeCell ref="A${noteRow}:${lastColumn}${noteRow}"/></mergeCells><pageMargins left="0.25" right="0.25" top="0.35" bottom="0.35" header="0.3" footer="0.3"/><pageSetup paperSize="9" scale="40" fitToHeight="0" orientation="landscape"/><drawing r:id="rId1"/></worksheet>`;
  };

  const textEntry = (value,style) => ({value,style,kind:'text'});
  const numberEntry = (value,style) => ({value,style,kind:'number'});
  const dateEntry = (value,style) => ({value,style,kind:'date'});
  const alternating = (index,odd,even) => index%2?even:odd;
  const download = (name,bytes) => { const url=URL.createObjectURL(new Blob([bytes],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})),link=document.createElement('a');link.href=url;link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1500); };
  const exportableOrder = order => ['approved','cancelled'].includes(String(order.status||'approved').toLowerCase())&&!order.isDraft;

  const purchaseOrders = async (project,orders,specs) => {
    const selected=orders.filter(order=>order.projectId===project.id&&exportableOrder(order));
    const records=[];
    selected.forEach(order=>{
      const items=order.items?.length?order.items:[{}];
      items.forEach((item,itemIndex)=>{
        const index=records.length,alt=(odd,even)=>alternating(index,odd,even),quantity=Number(item.quantity||1),orderCurrency=normalizeCurrency(item.currency||order.currency||order.amount),unitCost=moneyValue(item.unitCost??item.cost??(items.length===1?numberValue(order.amount)/quantity:0));
        const status=String(order.status).toLowerCase()==='cancelled'?'CANCELLED':'POC';
        records.push([
          textEntry(order.number||'',alt(5,6)),
          textEntry(item.reference||item.code||item.specCode||codigoDeSpec(specs,item.specId)||`${order.number||'PO'}-${String(itemIndex+1).padStart(3,'0')}`,alt(7,8)),
          textEntry(item.description||item.name||item.productName||'',alt(3,4)),
          textEntry(uniqueText(order.manufacturer,item.manufacturer,order.source,item.source,order.supplier),alt(9,10)),
          numberEntry(quantity,alt(3,4)),
          textEntry(item.unit||item.unitMeasure||unidadDeSpec(specs,item.specId)||'ea',alt(9,10)),
          textEntry(orderCurrency,alt(9,10)),
          numberEntry(unitCost,alt(11,12)),
          numberEntry(moneyValue(quantity*unitCost),alt(13,14)),
          dateEntry(item.deliveryDate||order.deliveryDate||order.estimatedDelivery,alt(15,16)),
          dateEntry(item.shipDate||order.shipDate||order.actualShipDate,alt(15,16)),
          dateEntry(item.receivedDate||order.receivedDate,alt(15,16)),
          dateEntry(item.deliveredDate||order.deliveredDate,alt(15,16)),
          dateEntry(item.installedDate||order.installedDate,alt(15,16)),
          textEntry(status,status==='POC'?18:17),
          dateEntry(order.status==='cancelled'?order.voidedAt:(order.trackingUpdatedAt||order.date),alt(15,16)),
          textEntry(order.currentLocation||'',alt(3,4)),
          textEntry(order.leadTime||item.leadTime||'',alt(9,10)),
          textEntry(item.area||order.area||project.areas||'',alt(3,4)),
          textEntry(order.poArea||order.area||'',alt(3,4))
        ]);
      });
    });
    const totals=records.reduce((all,row)=>{const curr=row[6].value;all[curr]=(all[curr]||0)+Number(row[8].value||0);return all;},{});
    const xml=sheet({kind:'po',project,metrics:[{label:'LINE ITEMS',value:records.length},{label:'SUBMITTED',value:selected.length},{label:'PO CONFIRMED',value:selected.filter(order=>String(order.status||'approved').toLowerCase()==='approved').length},{label:'EXT. COST PEN',value:totals.PEN||0},{label:'EXT. COST USD',value:totals.USD||0},{label:'EXT. COST EUR',value:totals.EUR||0}],headers:['PO NUM','ITEM #','ITEM DESCRIPTION','MANUFACTURER | SOURCE','QTY','UM','CUR','UN COST','EXT COST','EST DELIVERY','ACTUAL SHIP DT','RECEIVED','DELIVERED FINAL','INSTALLED','STATUS','STATUS DT','CURR LOC','LEAD TIME','AREAS','PO AREA'],rows:records,widths:[16,15,44,34,7,6,6,15,17.88671875,13,13,13,13,13,9,13,11,10,10,10]});
    const bytes=await packageFile('PO Item Listing',xml,REPORT_ASSETS.poStyles);
    download(`VAAK_Reporte PO Item Listing_${safeName(project.name)}.xlsx`,bytes);
    return {rows:records.length,orders:selected.length};
  };

  const invoices = async (project,orders) => {
    const selected=(project.invoices||[]).filter(invoice=>!['draft','pending','borrador'].includes(String(invoice.status||'').toLowerCase()));
    const findOrder=invoice=>orders.find(order=>order.projectId===project.id&&(order.number===invoice.poNumber||order.id===invoice.orderId));
    const records=selected.map((invoice,index)=>{
      const order=findOrder(invoice),alt=(odd,even)=>alternating(index,odd,even),curr=normalizeCurrency(invoice.invoiceCurrency||invoice.currency||order?.currency||order?.amount),team=invoice.type||((order?.ocTeam||'FFE')==='OSE'?'OS&E':'FF&E');
      return [
        textEntry(team,String(team).includes('OS&E')?18:17),
        textEntry(invoice.poNumber||order?.number||'',alt(5,6)),
        dateEntry(order?.date,alt(15,16)),
        textEntry(invoice.sourceManufacturer||order?.manufacturer||order?.supplier||'',alt(9,10)),
        numberEntry(moneyValue(order?.amount),alt(11,12)),
        textEntry(invoice.invoiceNumber||'',alt(7,8)),
        dateEntry(invoice.invoiceDate,alt(15,16)),
        numberEntry(moneyValue(invoice.invoiceTotal||invoice.totalRequest),alt(13,14)),
        textEntry(curr,alt(9,10)),
        dateEntry(invoice.requestDate,alt(15,16)),
        textEntry(invoice.number||'',alt(7,8)),
        textEntry(invoice.transferNumber||invoice.paymentEvidence||'',alt(3,4)),
        numberEntry(moneyValue(invoice.paidAmount??invoice.paymentAmount??invoice.invoiceTotal??invoice.totalRequest),alt(11,12)),
        dateEntry(invoice.paymentDate||invoice.transferDate||invoice.approvalDate,alt(15,16)),
        textEntry(invoice.invoiceNote||'',alt(3,4)),
        textEntry(invoice.paymentComments||invoice.hpgComments||invoice.requestDetail||'',alt(3,4)),
        textEntry(invoice.deliveryLocation||project.warehouse||'',alt(3,4)),
        textEntry(invoice.destination||uniqueText(project.city,project.country)||'',alt(3,4)),
        numberEntry(invoice.paymentRegisteredAt?moneyValue(invoice.pendingAmount):'',alt(11,12)),
        textEntry(invoice.paymentRegisteredByName||'',alt(3,4)),
        dateEntry(invoice.paymentRegisteredAt,alt(15,16))
      ];
    });
    const totals=records.reduce((all,row)=>{const curr=row[8].value;all[curr]=(all[curr]||0)+Number(row[7].value||0);return all;},{});
    const xml=sheet({kind:'invoice',project,metrics:[{label:'INVOICES',value:selected.length},{label:'PAYMENT REQ.',value:selected.filter(invoice=>invoice.number).length},{label:'INVOICED PEN',value:totals.PEN||0},{label:'INVOICED USD',value:totals.USD||0},{label:'INVOICED EUR',value:totals.EUR||0}],headers:['TYPE','PO NUMBER','PO DATE','MANUFACTURER','TOTAL ORDER VALUE','INVOICE #','INV. DATE','INV. AMOUNT','CUR','PR DATE','PR NUMBER','PAYMENT EVIDENCE','AMOUNT PAID','TRANSFER DATE','INVOICE NOTE','HPG COMMENTS','DELIVERY LOCATION','DESTINATION','PENDING BALANCE','PAYMENT REGISTERED BY','REGISTERED ON'],rows:records,widths:[10,17,12,32,19,17,12,17,7,13.88671875,17,24,17,13,52,20,17,15,18,26,16]});
    const bytes=await packageFile('InvoiceList',xml,REPORT_ASSETS.invoiceStyles);
    download(`VAAK_Reporte Requerimientos de Pago Details_${safeName(project.name)}.xlsx`,bytes);
    return {rows:records.length,invoices:selected.length};
  };

  window.VAAKReports={purchaseOrders,invoices};
})();
