export default async function decorate(block) {
  // console.log("block: ", block);
  const childrenDivs = block.children;
  console.log("childrenDivs: ", childrenDivs);

  const sectionClassDiv = block.children[4];
  const sectionClass = sectionClassDiv.querySelector('p').textContent;

  console.log("sectionClass: ", sectionClass);
  block.classList.add(sectionClass);
  sectionClassDiv.remove();
}