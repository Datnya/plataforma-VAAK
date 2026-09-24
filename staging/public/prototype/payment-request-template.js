(function(root,factory){
  const api=factory(root.VAAKMoney||(typeof module==='object'&&module.exports?require('./money-utils.js'):null));
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.VAAKPaymentRequestTemplate=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Money){
  'use strict';

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const value=value=>value===null||value===undefined||String(value).trim()===''?'-':String(value);
  const number=value=>{const parsed=Number(String(value??'').replace(/[^0-9.-]/g,''));return Number.isFinite(parsed)?parsed:0};
  const rounded=value=>Money?Money.round(value):Math.round(number(value)*1000)/1000;
  const amount=value=>value===null||value===undefined||String(value).trim()===''?'-':rounded(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const displayDate=input=>{const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(input||''));return match?`${match[2]}/${match[3]}/${match[1].slice(-2)}`:value(input)};
  const projectLine=project=>[project.code,project.name].filter(Boolean).join(' · ');
  const currencyCode=invoice=>String(invoice.currency||invoice.invoiceCurrency||'PEN').replace(/^S\/$/,'PEN').replace(/^\$$/,'USD');
  const money=(currency,input)=>input===null||input===undefined||String(input).trim()===''?'-':`${esc(currency)} ${esc(amount(input))}`;
  const field=(invoice,name)=>esc(value(invoice[name]));

  function render(project={},invoice={}){
    // Valores cambiados en la última revisión, en azul (VAAKRevisionBlock).
    const RB=globalThis.VAAKRevisionBlock,ch=(...fields)=>Boolean(RB&&RB.changed(invoice,fields)),mk=(on,html)=>on?`<span class="rev-mark">${html}</span>`:html,fm=name=>mk(ch(name),field(invoice,name));
    const currency=currencyCode(invoice),requestTotal=invoice.totalRequest||invoice.paymentAmount||invoice.invoiceTotal||'',invoiceTotal=invoice.invoiceTotal||requestTotal,paymentAmount=invoice.paymentAmount||requestTotal,paymentPayableTo=invoice.paymentPayableTo||invoice.payableTo||'',requestedBy=invoice.requestedBy||'HPG International Latinoamericana SAC',heading=projectLine(project),labels=['TOTAL','GOODS','FREIGHT','PACKING',"ADD'L CHARGES",'OVERAGE','CUSTOMS','SALES TAX'],amountNames=['goods','freight','packing','additionalCharges','overage','customs','salesTax'],
      // Desglose: solo los conceptos llenos (con monto distinto de cero) + los conceptos propios (breakdownExtras).
      lineFilled=entry=>String(entry??'').trim()!==''&&Number(String(entry).replace(/[^0-9.-]/g,''))!==0,
      extrasBefore=String((RB?RB.lastChanges(invoice):[]).find(change=>change.field==='breakdownExtras')?.from??'').split(' | '),extras=String(invoice.breakdownExtras||'').split(' | ').map(part=>{let cut=part.lastIndexOf(': ');return cut<0?null:{label:part.slice(0,cut).trim().toUpperCase(),value:part.slice(cut+2).trim(),changed:ch('breakdownExtras')&&!extrasBefore.includes(part.trim())}}).filter(item=>item&&item.label&&lineFilled(item.value)),
      breakdown=[...amountNames.map((name,index)=>({label:labels[index+1],value:invoice[name],changed:ch(name)})).filter(item=>lineFilled(item.value)),...extras],
      entryAmounts=[invoiceTotal,...breakdown.map(item=>item.value)],requestAmounts=[requestTotal,...breakdown.map(item=>item.value)],rowLabels=['TOTAL',...breakdown.map(item=>item.label)],entryMarks=[ch('invoiceTotal'),...breakdown.map(item=>item.changed)],requestMarks=[ch('totalRequest'),...breakdown.map(item=>item.changed)],rowStyle=`grid-template-columns:repeat(${Math.min(rowLabels.length,8)},minmax(0,1fr))`;
    return `<article class="payment-request-preview hpg-payment-request notranslate" translate="no" lang="en">
      <header class="pr-doc-header">
        <img src="assets/hpg-international-reference.png" alt="HPG International Latinoamericana">
        <div><span>AS AGENT</span><h1>PAYMENT REQUEST</h1><strong>${esc(heading.toUpperCase())}</strong></div>
      </header>
      <section class="pr-doc-summary">
        <article class="pr-summary-number"><span>REQUEST #</span><strong>${field(invoice,'number')}</strong></article>
        <article><span>PROJECT</span><strong>${esc(heading)}</strong><p>PO #: ${fm('poNumber')}</p></article>
        <article><span>REQUEST DATE</span><strong>${mk(ch('requestDate'),esc(displayDate(invoice.requestDate)))}</strong><p>Currency: ${mk(ch('currency'),esc(currency))}</p></article>
      </section>
      <section class="pr-doc-section pr-request-section">${(globalThis.VAAKRevisionBlock&&globalThis.VAAKRevisionBlock.html(invoice))||''}<h2>REQUEST DETAIL</h2><div class="pr-request-box"><p>${mk(ch('requestDetail'),esc(value(invoice.requestDetail)))}</p><aside><span>TOTAL FOR THIS REQUEST</span><strong>${mk(ch('totalRequest'),money(currency,requestTotal))}</strong></aside></div></section>
      <section class="pr-doc-section pr-parties-section"><h2>PARTIES</h2><div class="pr-parties-box"><article><span>SOURCE / MANUFACTURER</span><strong>${fm('sourceManufacturer')}</strong></article><article><span>PAYABLE TO</span><strong>${fm('payableTo')}</strong><p>${fm('payableAddress')}</p><p>Contact: ${fm('payableContact')}</p></article></div></section>
      <section class="pr-doc-section pr-entry-section"><h2>INVOICE ENTRY DETAILS</h2><div class="pr-entry-table"><div class="pr-entry-head"><span>INVOICE #</span><span>PO REF #</span><span>INV. DATE</span><span>DUE DATE</span><span>PAYMENT TERMS</span><span>CURR</span><span>TOTAL AMOUNT</span></div><div class="pr-entry-values"><strong>${fm('invoiceNumber')}</strong><span>${fm('poReferenceArea')}</span><span>${mk(ch('invoiceDate'),esc(displayDate(invoice.invoiceDate)))}</span><span>${mk(ch('dueDate'),esc(displayDate(invoice.dueDate)))}</span><span>${fm('paymentTerms')}</span><span>${mk(ch('currency'),esc(currency))}</span><strong>${mk(ch('invoiceTotal','totalRequest'),money(currency,invoiceTotal))}</strong></div><div class="pr-breakdown-row" style="${rowStyle}">${entryAmounts.map((entry,index)=>`<span><b>${esc(rowLabels[index])}</b><em>${mk(entryMarks[index],esc(amount(entry)))}</em></span>`).join('')}</div></div></section>
      <section class="pr-doc-section pr-totals-section"><h2>PAYMENT REQUEST TOTALS</h2><div class="pr-totals-row" style="${rowStyle}">${requestAmounts.map((entry,index)=>`<span class="${index===0?'pr-total-primary':''}"><b>${esc(rowLabels[index])}</b><em>${mk(requestMarks[index],esc(amount(entry)))}</em></span>`).join('')}</div></section>
      <section class="pr-payment-line"><p>Please make payments payable to <strong>${mk(ch('paymentPayableTo'),esc(value(paymentPayableTo)))}</strong> in the amount of:</p><strong>${mk(ch('paymentAmount','goods','freight','packing','additionalCharges','overage','customs','salesTax','breakdownExtras'),money(currency,paymentAmount))}</strong></section>
      <section class="pr-doc-section pr-approvals-section"><h2>APPROVALS</h2><div class="pr-approvals-box"><article><span>REQUESTED BY / AGENT</span><p>${esc(requestedBy)}</p><i></i><small>Signature <b>Date</b></small></article><article><span>APPROVED BY / CLIENT</span><i></i><small>Signature (Title) <b>Date</b></small></article></div></section>
      <footer class="pr-doc-footer"><span>HPG International Latinoamericana SAC · RUC 20600893123</span><span>${field(invoice,'number')} · Page 1 · ${esc(displayDate(invoice.requestDate))}</span></footer>
    </article>`;
  }

  return Object.freeze({render,displayDate,amount,currencyCode,projectLine});
});
