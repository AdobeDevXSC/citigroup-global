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
      // console.log(div.textContent);
      const article = articles.data.articlesList.items.reduce((accumulator, item) => { 
        console.log(item._path);
        console.log(div.textContent);
        console.log(accumulator);
        if(item._path === div.textContent) return item   
      });
      console.log(article);
      if(article) {
        div.className = 'cards-card-image';
        div.removeChild(div.querySelector('p'));
        const optimizedPic = createOptimizedPicture(`https://author-p101152-e938206.adobeaemcloud.com${article.banner._dynamicUrl}`);
        optimizedPic.querySelectorAll('source').forEach((s) => {
          s.srcset = `https://author-p101152-e938206.adobeaemcloud.com${s.srcset}`
        });
        const optImg = optimizedPic.querySelector('img');
        if(optImg) {
          optImg.src = `https://author-p101152-e938206.adobeaemcloud.com${optImg.src}`
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
