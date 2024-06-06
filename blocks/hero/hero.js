export default async function decorate(block) {
  //Modify section class
  const sectionClassDiv = block.children[4];
  const sectionClass = sectionClassDiv.querySelector('p').textContent;
  block.classList.add(sectionClass);
  sectionClassDiv.remove();

  //Modify button-container html
  const buttonContainerDiv = block.children[3];
  const pElement = buttonContainerDiv.querySelector('.button-container');
  buttonContainerDiv.parentNode.insertBefore(pElement, buttonContainerDiv);
  buttonContainerDiv.remove();

  //Modify button text content
  const buttonTextDiv = block.children[2];
  const buttonText = buttonTextDiv.querySelector('p').textContent;
  pElement.querySelector('a').textContent = buttonText;
  pElement.querySelector('a').title = buttonText;
  buttonTextDiv.remove();

  //Modify title html
  const titleDiv = block.children[1];
  const title = titleDiv.querySelector('h1, h2').textContent;
  const p = document.createElement('p');
  p.textContent = title;

  const wrapperDiv = document.createElement('div');
  wrapperDiv.classList.add('desc-info-wrapper');
  wrapperDiv.append(p);
  wrapperDiv.append(pElement);
  block.append(wrapperDiv);
  titleDiv.remove();

  //Modify image html
  const imageParentDiv = block.children[0];
  imageParentDiv.classList.add('image-container');
}