import { fetchPlaceholders } from '../../scripts/aem.js';
import { createHTML } from './helper-function.js';
import { loadFragment } from '../fragment/fragment.js';
import { moveInstrumentation } from '../../scripts/scripts.js';
import { getMetadata } from '../../scripts/aem.js';

function updateActiveSlide(block) {
  const slides = block.querySelectorAll('.carousel-slide');
  const scrollPosition = block.querySelector('.carousel-slides').scrollLeft;
  const slideIndex = Math.round(scrollPosition / slides[0].offsetWidth);
  block.dataset.activeSlide = slideIndex;

  slides.forEach((aSlide, idx) => {
    aSlide.setAttribute('aria-hidden', idx !== slideIndex);
    aSlide.querySelectorAll('a').forEach((link) => {
      if (idx !== slideIndex) {
        link.setAttribute('tabindex', '-1');
      } else {
        link.removeAttribute('tabindex');
      }
    });
  });

  const indicators = block.querySelectorAll('.carousel-slide-indicator');
  indicators.forEach((indicator, idx) => {
    if (idx !== slideIndex) {
      indicator.querySelector('button').removeAttribute('disabled');
    } else {
      indicator.querySelector('button').setAttribute('disabled', 'true');
    }
  });
}

function showSlide(block, slideIndex = 0) {
  const slides = block.querySelectorAll('.carousel-slide');
  let realSlideIndex = slideIndex < 0 ? slides.length - 1 : slideIndex;
  if (slideIndex >= slides.length) realSlideIndex = 0;
  const activeSlide = slides[realSlideIndex];

  activeSlide.querySelectorAll('a').forEach((link) => link.removeAttribute('tabindex'));
  block.querySelector('.carousel-slides').scrollTo({
    top: 0,
    left: activeSlide.offsetWidth * realSlideIndex,
    behavior: 'smooth',
  });

  setTimeout(() => {
    updateActiveSlide(block); // Ensure the active slide is updated after scrolling
  }, 500); // Adjust delay as necessary
}

function bindEvents(block) {
  const slideIndicators = block.querySelector('.carousel-slide-indicators');
  if (!slideIndicators) return;

  slideIndicators.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const slideIndicator = e.currentTarget.parentElement;
      showSlide(block, parseInt(slideIndicator.dataset.targetSlide, 10));
    });
  });

  block.querySelector('.slide-prev').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) - 1);
  });
  block.querySelector('.slide-next').addEventListener('click', () => {
    showSlide(block, parseInt(block.dataset.activeSlide, 10) + 1);
  });

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateActiveSlide(block);
      }
    });
  }, { threshold: 0.5 }); // Adjust threshold as needed

  block.querySelectorAll('.carousel-slide').forEach((slide) => {
    slideObserver.observe(slide);
  });
}

function createSlide(row, slideIndex, carouselId) {
  const slide = document.createElement('li');
  slide.dataset.slideIndex = slideIndex;
  slide.setAttribute('id', `carousel-${carouselId}-slide-${slideIndex}`);
  slide.classList.add('carousel-slide');
  moveInstrumentation(row, slide);

  row.querySelectorAll(':scope > div').forEach((column, colIdx) => {
    column.classList.add(`carousel-slide-${colIdx === 0 ? 'image' : 'content'}`);
    const isColumn = column.classList.contains('carousel-slide-content');

    if (isColumn) {
      const infoDiv = document.createElement('div');
      infoDiv.className = 'info';

      while (column.firstChild) {
        infoDiv.appendChild(column.firstChild);
      }

      column.appendChild(infoDiv);
    }

    slide.append(column);
  });

  const labeledBy = slide.querySelector('h1, h2, h3, h4, h5, h6');
  if (labeledBy) {
    slide.setAttribute('aria-labelledby', labeledBy.getAttribute('id'));
  }

  const contentWrapper = slide.querySelector('.carousel-slide-content');
  const link = contentWrapper.querySelector('a');
  const href = link?.href;

  if (href) {
    const newLink = document.createElement('a');
    newLink.href = href;

    while (slide.firstChild) {
      newLink.appendChild(slide.firstChild);
      link.parentElement.remove();
    }

    slide.appendChild(newLink);
  }

  return slide;
}

let carouselId = 0;
export default async function decorate(block) { 
  [...block.children].forEach(async(row, i) => {
    row.classList.add('article-container');

    const [link, category ] = [...row.children];
    link.classList.add('article-img-wrapper');
    category.classList.add('article-info-wrapper');

    const categoryText = document.createElement('div');
    categoryText.classList.add('categories-text');
    categoryText.appendChild(category.querySelector('p'));
    category.appendChild(categoryText);
  
    let article = link.querySelector('a');
    if(!article) throw Error('There is no article');
    
    const articleUrl = article.title.replace('/content/citigroup', '');
    const resp = await fetch(`${articleUrl}.plain.html`);

    if (resp.ok) {
      const main = document.createElement('main');
      main.innerHTML = await resp.text();
      let date = getMetadata('published-time'); //main.querySelector('p:not(:has(img))');
      if(date) date = new Date(date);
      
      const month = typeof date === 'object' ? date.toLocaleString('default', { month: 'long' }) : '';
      const day = typeof date === 'object' ? date.getDate(): '';
      const year = typeof date === 'object' ? date.getFullYear(): '';

      const heroPic = main.querySelector('picture');
      link.innerHTML = heroPic.outerHTML;

      const h1 = main.querySelector('h1');
      const h3 = document.createElement('h3');
      h3.textContent = h1.textContent;
      category.appendChild(h3);

      const dateDiv = document.createElement('div');
      dateDiv.classList.add('article-date');
      dateDiv.innerHTML = `${month} ${day}, ${year}`; //date.outerHTML;
      category.appendChild(dateDiv);
    }
  }); 

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
    console.log(row);
    // row.remove();
  });

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

//https://author-p101152-e938206.adobeaemcloud.com/content/citigroup/index/press-release/2024/citi-wealth-releases-mid-year-outlook-2024/
//https://author-p101152-e938206.adobeaemcloud.com/content/citigroup/index/press-release/2024/citi-wealth-releases-mid-year-outlook-2024.html