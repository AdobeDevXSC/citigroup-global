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
      // console.log(div.textContent);
      let article = articles.data.articlesList.items.filter((item) => { 
        if (item._path === div.textContent) return item;
      });
      article = article[0];

      if (article) {
        div.className = 'cards-card-image';
        div.removeChild(div.querySelector('p'));
        const optimizedPic = createOptimizedPicture(aemInstance + article.banner['_dynamicUrl']);
        optimizedPic.querySelectorAll('source').forEach((s) => {
          s.srcset = aemInstance + s.srcset;
        });
        const optImg = optimizedPic.querySelector('img');
        if(optImg) {
          optImg.src = aemInstance + optImg.src;
        }
        console.log(optimizedPic);
        div.appendChild(optimizedPic);
        const body = document.createElement('div');
        body.classList.add('cards-card-body');
        const title = document.createElement('h3');
        title.textContent = article.title;
        const subtitle = document.createElement('p');
        subtitle.textContent = article.subTitle;
        const pubDate = document.createElement('p');
        pubDate.textContent = article.date;
        body.appendChild(subtitle);
        body.appendChild(title);

        li.appendChild(body);
      }
      // if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      // else div.className = 'cards-card-body';
    });
    ul.append(li);
  });
  // ul.querySelectorAll('picture > img').forEach((img) => {
  //   const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
  //   moveInstrumentation(img, optimizedPic.querySelector('img'));
  //   img.closest('picture').replaceWith(optimizedPic);
  // });
  block.textContent = '';
  block.append(ul);
}
