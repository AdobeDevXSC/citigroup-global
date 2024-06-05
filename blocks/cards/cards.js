import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default async function decorate(block) {
  const headers = new Headers({
    'Content-Type': 'text/html',
  });

  const obj = {
    method: 'get',
    headers: headers,
    credentials: 'include'
  };
  let articles = await fetch('https://author-p101152-e938206.adobeaemcloud.com/graphql/execute.json/citigroup/articles', obj);
  articles = await articles.json();
  console.log(articles.data.articlesList.items);
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    console.log(row);
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      console.log(div.textContent);
      const article = articles.data.articlesList.items.filter((item) => item._path === div.textContent);
      console.log(article);
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
