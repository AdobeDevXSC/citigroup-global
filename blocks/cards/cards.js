import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

const aemInstance = 'https://author-p101152-e938206.adobeaemcloud.com';

export default async function decorate(block) {
  const obj = {
    method: 'get',
    headers: new Headers({
      'Content-Type': 'text/html',
    }),
    credentials: 'include',
  };

  let articles = await fetch(`${aemInstance}/graphql/execute.json/citigroup/articles`, obj);
  articles = await articles.json();

  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      let article = articles.data.articlesList.items.filter((item) => {
        if (item.path === div.textContent) return item;
        else return;
      });
      article = article[0];

      if (article) {
        const {
          banner,
          title,
          categories,
          date,
        } = article;
        div.className = 'cards-card-image';
        div.removeChild(div.querySelector('p'));
        const optimizedPic = createOptimizedPicture(aemInstance + banner.dynamicUrl);
        optimizedPic.querySelectorAll('source').forEach((s) => {
          s.srcset = aemInstance + s.srcset;
        });
        const optImg = optimizedPic.querySelector('img');
        if (optImg) {
          optImg.src = aemInstance + optImg.src;
        }

        div.appendChild(optimizedPic);

        const body = document.createElement('div');
        body.classList.add('cards-card-body');

        const h3 = document.createElement('h3');
        h3.textContent = title;

        const subtitle = document.createElement('p');
        subtitle.textContent = categories;

        const pubDate = document.createElement('p');
        pubDate.textContent = date;

        body.appendChild(subtitle);
        body.appendChild(h3);

        li.appendChild(body);
      }
    });
    ul.append(li);
  });
  block.textContent = '';
  block.append(ul);
}
