(function(root,factory){
  const api=factory(root.VAAKMoney||(typeof module==='object'&&module.exports?require('./money-utils.js'):null));
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.VAAKPaymentRequestTemplate=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Money){
  'use strict';

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const value=value=>value===null||value===undefined||String(value).trim()===''?'-':String(value);
  const number=value=>{const parsed=Number(String(value??'').replace(/[^0-9.-]/g,''));return Number.isFinite(parsed)?parsed:0};
  const rounded=value=>Money?Money.round(value):Math.round(number(value)*10)/10;
  const amount=value=>value===null||value===undefined||String(value).trim()===''?'-':rounded(value).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  const displayDate=input=>{const match=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(input||''));return match?`${match[2]}/${match[3]}/${match[1].slice(-2)}`:value(input)};
  const projectLine=project=>[project.code,project.name].filter(Boolean).join(' · ');
  const currencyCode=invoice=>String(invoice.currency||invoice.invoiceCurrency||'PEN').replace(/^S\/$/,'PEN').replace(/^\$$/,'USD');
  const money=(currency,input)=>input===null||input===undefined||String(input).trim()===''?'-':`${esc(currency)} ${esc(amount(input))}`;
  const field=(invoice,name)=>esc(value(invoice[name]));

  function render(project={},invoice={}){
    const currency=currencyCode(invoice),requestTotal=invoice.totalRequest||invoice.paymentAmount||invoice.invoiceTotal||'',invoiceTotal=invoice.invoiceTotal||requestTotal,paymentAmount=invoice.paymentAmount||requestTotal,paymentPayableTo=invoice.paymentPayableTo||invoice.payableTo||'',requestedBy=invoice.requestedBy||'HPG International Latinoamericana SAC',heading=projectLine(project),labels=['TOTAL','GOODS','FREIGHT','PACKING',"ADD'L CHARGES",'OVERAGE','CUSTOMS','SALES TAX'],amountNames=['goods','freight','packing','additionalCharges','overage','customs','salesTax'],entryAmounts=[invoiceTotal,...amountNames.map(name=>invoice[name])],requestAmounts=[requestTotal,...amountNames.map(name=>invoice[name])];
    return `<article class="payment-request-preview hpg-payment-request notranslate" translate="no" lang="en">
      <header class="pr-doc-header">
        <img src="assets/hpg-international-reference.png" alt="HPG International Latinoamericana">
        <div><span>AS AGENT</span><h1>PAYMENT REQUEST</h1><strong>${esc(heading.toUpperCase())}</strong></div>
      </header>
      <section class="pr-doc-summary">
        <article class="pr-summary-number"><span>REQUEST #</span><strong>${field(invoice,'number')}</strong></article>
        <article><span>PROJECT</span><strong>${esc(heading)}</strong><p>PO #: ${field(invoice,'poNumber')}</p></article>
        <article><span>REQUEST DATE</span><strong>${esc(displayDate(invoice.requestDate))}</strong><p>Currency: ${esc(currency)}</p></article>
      </section>
      <section class="pr-doc-section pr-request-section">${(globalThis.VAAKRevisionBlock&&globalThis.VAAKRevisionBlock.html(invoice))||''}<h2>REQUEST DETAIL</h2><div class="pr-request-box"><p>${esc(value(invoice.requestDetail))}</p><aside><span>TOTAL FOR THIS REQUEST</span><strong>${money(currency,requestTotal)}</strong></aside></div></section>
      <section class="pr-doc-section pr-parties-section"><h2>PARTIES</h2><div class="pr-parties-box"><article><span>SOURCE / MANUFACTURER</span><strong>${field(invoice,'sourceManufacturer')}</strong></article><article><span>PAYABLE TO</span><strong>${field(invoice,'payableTo')}</strong><p>${field(invoice,'payableAddress')}</p><p>Contact: ${field(invoice,'payableContact')}</p></article></div></section>
      <section class="pr-doc-section pr-entry-section"><h2>INVOICE ENTRY DETAILS</h2><div class="pr-entry-table"><div class="pr-entry-head"><span>INVOICE #</span><span>PO REF #</span><span>INV. DATE</span><span>DUE DATE</span><span>PAYMENT<br>TERMS</span><span>PAYABLE TO</span><span>CURR</span><span>TOTAL AMOUNT</span></div><div class="pr-entry-values"><strong>${field(invoice,'invoiceNumber')}</strong><span>${field(invoice,'poReferenceArea')}</span><span>${esc(displayDate(invoice.invoiceDate))}</span><span>${esc(displayDate(invoice.dueDate))}</span><span>${field(invoice,'paymentTerms')}</span><span>${field(invoice,'payableTo')}</span><span>${esc(currency)}</span><strong>${money(currency,invoiceTotal)}</strong></div><div class="pr-breakdown-row">${entryAmounts.map((entry,index)=>`<span><b>${labels[index]}</b><em>${esc(amount(entry))}</em></span>`).join('')}</div></div></section>
      <section class="pr-doc-section pr-totals-section"><h2>PAYMENT REQUEST TOTALS</h2><div class="pr-totals-row">${requestAmounts.map((entry,index)=>`<span class="${index===0?'pr-total-primary':''}"><b>${labels[index]}</b><em>${esc(amount(entry))}</em></span>`).join('')}</div></section>
      <section class="pr-payment-line"><p>Please make payments payable to <strong>${esc(value(paymentPayableTo))}</strong> in the amount of:</p><strong>${money(currency,paymentAmount)}</strong></section>
      <section class="pr-doc-section pr-approvals-section"><h2>APPROVALS</h2><div class="pr-approvals-box"><article><span>REQUESTED BY / AGENT</span><p>${esc(requestedBy)}</p><i></i><small>Signature <b>Date</b></small></article><article><span>APPROVED BY / CLIENT</span><i></i><small>Signature (Title) <b>Date</b></small></article></div></section>
      <footer class="pr-doc-footer"><span>HPG International Latinoamericana SAC · RUC 20600893123</span><span>${field(invoice,'number')} · Page 1 · ${esc(displayDate(invoice.requestDate))}</span></footer>
    </article>`;
  }

  return Object.freeze({render,displayDate,amount,currencyCode,projectLine});
});
