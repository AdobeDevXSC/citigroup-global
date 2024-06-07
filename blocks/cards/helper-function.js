import { createOptimizedPicture } from '../../scripts/aem.js';

export function createHTML(articles) {
  const updatedArticles = [];
  const aemInstance = 'https://author-p101152-e938206.adobeaemcloud.com';

  articles.forEach((article) => {
    const optimizedPic = createOptimizedPicture(aemInstance + article.banner.dynamicUrl, article.title, true);
      optimizedPic.querySelectorAll('source').forEach((s) => {
        s.srcset = aemInstance + s.srcset;
    });

    updatedArticles.push(`
      <div class="article-container">
        <div class="article-img-wrapper">${optimizedPic.outerHTML}</div>
        <div class="article-info-wrapper">
          <div class="categories-text">${article.categories}</div>
          <h3>${article.title}</h3>
          <div class="article-date">${article.date}</div>
        </div>
      </div>
    `);
  });

  return updatedArticles;
}