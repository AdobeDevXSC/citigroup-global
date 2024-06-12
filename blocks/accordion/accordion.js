/*
 * Accordion Block
 * Recreate an accordion
 * https://www.hlx.live/developer/block-collection/accordion
 */

function hasWrapper(el) {
  return !!el.firstElementChild && window.getComputedStyle(el.firstElementChild).display === 'block';
}

export default function decorate(block) {
  const lbls = ['Press Release', 'Financial Supplement', 'Presentation'];

  [...block.children].forEach((row) => {
    const hrefs = row.querySelectorAll('a');
    const label = row.children[0];
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);
    if (!hasWrapper(summary)) {
      summary.innerHTML = `<p>${summary.innerHTML}</p>`;
    }
    // decorate accordion item body
    const body = row.children[1];
    body.className = 'accordion-item-body';
    if (!hasWrapper(body)) {
      body.innerHTML = `<p>${body.innerHTML}</p>`;
    }

    const list = document.createElement('ul');
    hrefs.forEach((href, i) => {
      const li = document.createElement('li');
      const divLbl = document.createElement('div');
      divLbl.classList.add('list-label');
      divLbl.textContent = lbls[i];
      li.appendChild(divLbl);

      const divLnk = document.createElement('divLnk');
      divLnk.classList.add('link-link');
      divLnk.appendChild(href);

      const iconName = 'pdf';
      const img = document.createElement('img');
      img.dataset.iconName = iconName;
      img.src = `${window.hlx.codeBasePath}/icons/${iconName}.svg`;
      img.alt = 'pdf icon';
      img.loading = 'lazy';

      href.className = 'document-link';
      const url = new URL(href.href);
      const {pathname} = url;
      href.href = `https://publish-p48154-e244509.adobeaemcloud.com${pathname}`;
      // href.innerHTML = `<img data-icon-name="logo" src="/icons/pdf.svg" alt="" loading="lazy">`;
      href.innerHTML = img.outerHTML;

      li.appendChild(divLnk);
      list.appendChild(li);
    });

    body.appendChild(list);

    // decorate accordion item
    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    // row.replaceWith(details);
    row.appendChild(details);
  });
}