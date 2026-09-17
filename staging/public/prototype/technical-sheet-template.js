(function(root){
  'use strict';

  const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const valueOrBlank=value=>value===null||value===undefined?'':String(value);
  const quantityLabel=spec=>{let q=String(spec.quantity??'').trim(),u=String(spec.unit||'').trim();return q?(u?q+' '+u:q):u};
  const procurementLabel=spec=>`${spec.procurementTeam==='OSE'?'OS&E':'FF&E'} Procurement`;
  const itemCode=spec=>spec.code||spec.reference||spec.id||'';
  const paragraph=value=>`<p>${esc(valueOrBlank(value))}</p>`;

  function render(spec,context={}){
    const project=context.project||{},code=itemCode(spec),qty=quantityLabel(spec),issueDate=context.issueDate||new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'}),vendor=spec.vendorSource||spec.vendor||spec.source||'',status=spec.specStatus||spec.status||'',model=spec.name||'',reference=spec.reference||'',finish=spec.color||'',description=spec.description||'',itemNumber=spec.itemNumber||code;

    return `<article class="spec-preview hpg-technical-sheet notranslate" translate="no" lang="en">
      <div class="hpg-ts-content">
        <header class="hpg-ts-header">
          <img src="assets/hpg-international-reference.png" alt="HPG International Latinoamericana">
          <div class="hpg-ts-heading">
            <div class="hpg-ts-code"><span>ITEM CODE</span><strong>${esc(code)}</strong></div>
            <h1>TECHNICAL SPECIFICATION SHEET</h1>
            <p>HPG International - ${esc(procurementLabel(spec))}</p>
          </div>
        </header>

        <table class="hpg-ts-project-table"><tbody>
          <tr><th>PROJECT</th><td>${esc(project.name||'')}</td><th>CATEGORY</th><td>${esc(spec.category||'')}</td></tr>
          <tr><th>PROJECT #</th><td>${esc(project.code||'')}</td><th>VENDOR /<br>SOURCE</th><td>${esc(vendor)}</td></tr>
          <tr><th>CLIENT</th><td>${esc(project.legal||project.contact||'')}</td><th>ISSUE DATE</th><td>${esc(issueDate)}</td></tr>
          <tr><th>AREA</th><td>${esc(spec.area||'')}</td><th>STATUS</th><td>${esc(status)}</td></tr>
        </tbody></table>

        <section class="hpg-ts-specification">
          <h2>SPECIFICATION</h2>
          <div class="hpg-ts-spec-grid">
            <table><tbody>
              <tr><th>MODEL / DESCRIPTION</th><td>${esc(model)}</td></tr>
              <tr><th>PRODUCT CODE</th><td>${esc(spec.productCode||'')}</td></tr>
              <tr><th>RH REFERENCE #</th><td>${esc(reference)}</td></tr>
              <tr><th>SIZE (AS ORDERED)</th><td>${esc(spec.size||'')}</td></tr>
              <tr><th>FINISH / COLOR</th><td>${esc(finish)}</td></tr>
              <tr><th>QTY.</th><td>${esc(qty)}</td></tr>
            </tbody></table>
            <div class="hpg-ts-image">${spec.image?`<img src="${esc(spec.image)}" alt="${esc(model)}">`:''}</div>
          </div>
          <p class="hpg-ts-photo-note">Product photo: manufacturer reference image, provided for identification purposes only.</p>
        </section>

        <section class="hpg-ts-copy hpg-ts-description"><h2>DESCRIPTION</h2>${paragraph(description)}</section>
        <table class="hpg-ts-item-table"><thead><tr><th>BY</th><th>QTY.</th><th>ITEM</th><th>ITEM #</th></tr></thead><tbody><tr><td>HPG</td><td>${esc(qty)}</td><td>${esc(model)}</td><td>${esc(itemNumber)}</td></tr></tbody></table>
      </div>
      <footer class="hpg-ts-footer"><span>HPG International Latinoamericana SAC · Av. Alfredo Benavides 1180, Lima, Peru · hpgilatam.com</span><span>Page 1</span></footer>
    </article>`;
  }

  root.VAAKTechnicalSheetTemplate=Object.freeze({render});
})(typeof globalThis!=='undefined'?globalThis:this);
