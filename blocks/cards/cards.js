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
  const items = articles?.data?.articlesList?.items;
  const html = createHTML(items);
  block.innerHTML = `${html.join('')}`;

  carouselId += 1;
  block.setAttribute('id', `carousel-${carouselId}`);
  const rows = block.querySelectorAll(':scope > div');
  const isSingleSlide = rows.length < 2;

  const placeholders = await fetchPlaceholders();

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', placeholders.carousel || 'Carousel');

  const container = document.createElement('div');
  container.classList.add('carousel-slides-container');

  const slidesWrapper = document.createElement('ul');
  slidesWrapper.classList.add('carousel-slides');
  container.append(slidesWrapper);

  let slideIndicators;
  if (!isSingleSlide) {
    const slideIndicatorsNav = document.createElement('nav');
    slideIndicatorsNav.setAttribute('aria-label', placeholders.carouselSlideControls || 'Carousel Slide Controls');
    slideIndicators = document.createElement('ol');
    slideIndicators.classList.add('carousel-slide-indicators');
    slideIndicatorsNav.append(slideIndicators);
    container.append(slideIndicatorsNav);

    const slideNavButtons = document.createElement('div');
    slideNavButtons.classList.add('carousel-navigation-buttons');
    slideNavButtons.innerHTML = `
      <button type="button" class="slide-prev" aria-label="${placeholders.previousSlide || 'Previous Slide'}"></button>
      <button type="button" class="slide-next" aria-label="${placeholders.nextSlide || 'Next Slide'}"></button>
    `;

    container.append(slideNavButtons);
  }

  rows.forEach((row, idx) => {
    const slide = createSlide(row, idx, carouselId);
    slidesWrapper.append(slide);

    if (slideIndicators) {
      const indicator = document.createElement('li');
      indicator.classList.add('carousel-slide-indicator');
      indicator.dataset.targetSlide = idx;
      indicator.innerHTML = `<button type="button"><span>${placeholders.showSlide || 'Show Slide'} ${idx + 1} ${placeholders.of || 'of'} ${rows.length}</span></button>`;
      slideIndicators.append(indicator);
    }
    row.remove();
  });

  // Custom code
  const navigationTitleDiv = document.createElement('div');
  navigationTitleDiv.classList.add('nav-title-container');
  const wrapperDiv = document.createElement('div');
  wrapperDiv.classList.add('wrapper-div');
  const slideNavButtonsDiv = container.querySelector('.carousel-navigation-buttons');

  wrapperDiv.append(slideNavButtonsDiv);
  navigationTitleDiv.append(wrapperDiv);

  block.prepend(container);
  block.prepend(navigationTitleDiv);

  if (!isSingleSlide) {
    bindEvents(block);
  }
}
