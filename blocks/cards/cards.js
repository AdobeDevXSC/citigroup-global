import { fetchPlaceholders } from '../../scripts/aem.js';
import { createHTML } from './helper-function.js';
import { loadFragment } from '../fragment/fragment.js';

export default async function decorate(block) { 
  [...block.children].forEach(async(row, i) => {
    let article = row.querySelector('a');
    if(!article) throw Error('There is no article');
    const articleUrl = article.title.replace('/content/citigroup', '');
    const category = [...row.children][1];
    const resp = await fetch(articleUrl);
    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();

      const heroPic = main.querySelector('picture');
      const h1 = main.querySelector('h1');
      const date = main.querySelector('p');
      const articleContainer = document.createElement('div');
      articleContainer.classList.add('article-container');
      articleContainer.innerHTML = 
      articleContainer.innerHTML = `
        <div class="article-img-wrapper">${heroPic.outerHTML}</div>
        <div class="article-info-wrapper">
          <div class="categories-text">${category.innerHTML}</div>
          <h3>${h1.textContent}</h3>
          <div class="article-date">${date.outerHTML}</div>
        </div>`;
      row.appendChild(articleContainer);
    }
    article.remove();
  }); 
}