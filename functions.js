// functions.js
let currentImageIndex = 0;
let images = [];
let categoryFilter;

let searchInput = document.getElementById("searchInput");
searchInput.addEventListener("keyup", search);
searchInput.setAttribute("autocomplete", "off");

let searchTimeout;

export function search() {
  clearTimeout(searchTimeout);
  const searchTerm = searchInput.value.toLowerCase();
  const titles = document.querySelectorAll(".title");
  let resultsCount = 0;

  const resultsCountElement = document.getElementById("resultsCount");

  if (!searchTerm.trim()) { // If the search term is empty or just whitespace
    titles.forEach((title) => {
      title.parentElement.style.display = ""; // Show all the art elements
    });
    resultsCountElement.textContent = ""; // Clear the results count
  } else {
    searchTimeout = setTimeout(() => {
      titles.forEach((title) => {
        const titleText = title.textContent.toLowerCase();
        const yearElement = title.nextElementSibling.querySelector('.year');
        const sizeElement = title.nextElementSibling.querySelector('.size');
        const priceElement = title.nextElementSibling.querySelector('.price');
        const yearText = yearElement ? yearElement.textContent.toLowerCase() : '';
        const sizeText = sizeElement ? sizeElement.textContent.toLowerCase() : '';
        const priceText = priceElement ? priceElement.textContent.toLowerCase() : '';
        const matchFound = titleText.includes(searchTerm) ||
          yearText.includes(searchTerm) ||
          sizeText.includes(searchTerm) ||
          priceText.includes(searchTerm);
        if (matchFound) {
          title.parentElement.style.display = "";
          resultsCount++;
        } else {
          title.parentElement.style.display = "none";
        }
      });
      resultsCountElement.textContent = `${resultsCount} results found`;
    }, 200); // Debounce time in milliseconds
  }

  // Call the filterByCategory function to update the count of visible results based on the selected categories
  window.scrollTo(0,0); filterByCategory();

}




export function resetSearch() {
  document.getElementById("searchInput").value = "";
  search();
  const resultsCountElement = document.getElementById("resultsCount");
  resultsCountElement.textContent = ""; // Clear the results count
  resetFilter(); // Clear the filters
}

export function resetFilter() {
  const categoryFilter = document.getElementById("categoryFilter");
  for(let i = 0; i < categoryFilter.options.length; i++) {
    categoryFilter.options[i].selected = false;
  }
  filterByCategory(); // Apply the filter (which should now show all results because no categories are selected)
}




export function getUniqueCategories(artData) {
  const categoriesCount = {};
  artData.forEach(art => {
    if (art.categories) {
      art.categories.forEach(category => {
        if (categoriesCount.hasOwnProperty(category)) {
          categoriesCount[category]++;
        } else {
          categoriesCount[category] = 1;
        }
      });
    }
  });
  const sortedCategories = Object.keys(categoriesCount)
    .filter(category => categoriesCount[category] >= 3)
    .sort((a, b) => a.localeCompare(b, 'es')); // Compare strings based on Spanish rules
  return sortedCategories;
}


export function filterByCategory() {
  const selectedCategories = Array.from(
    document.getElementById("categoryFilter").selectedOptions
  ).map(option => option.value);
  const titles = document.querySelectorAll(".title");
  titles.forEach((title) => {
    const categories = title.dataset.categories ? title.dataset.categories.split(';') : [];
    const matchFound = selectedCategories.every(category => categories.includes(category));
    const parentDiv = title.parentElement;
    parentDiv.style.display = matchFound ? "block" : "none";
  });
  window.scrollTo(0, 0);
  const resultsCountElement = document.getElementById("resultsCount");
  const visibleParents = Array.from(document.querySelectorAll('.title')).filter(title => title.parentElement.style.display !== 'none');
  const visibleCount = visibleParents.length;
  resultsCountElement.textContent = `${visibleCount} results found`;
}


function populateCategories(uniqueCategories, artData, categoryFilterElement) {
  uniqueCategories.forEach((category) => {
    if (!categoryFilterElement.querySelector(`[value="${category}"]`)) {
      const categoryCount = artData.filter(art => art.categories && art.categories.includes(category)).length;
      if (categoryCount >= 3) {
        const optionElement = document.createElement('option');
        optionElement.value = category;
        optionElement.textContent = category;
        categoryFilterElement.appendChild(optionElement);
      }
    }
  });
}

export async function createArt(container, artDataList, categoryFilterElement) {
  container.innerHTML = ""; // Clear the container
  window.scrollTo(0, 0);

  artDataList.sort((a, b) => a.title.localeCompare(b.title));
  const artData = artDataList;
  const uniqueCategories = getUniqueCategories(artDataList);
  populateCategories(uniqueCategories, artData, categoryFilterElement);

  const visibleArt = artData.slice();
  createArtDivs(visibleArt, container);
  Prism.highlightAll();

  // Filter the snippets based on the selected category
  filterByCategory();

  // Scroll the container to the top
  container.scrollIntoView({ behavior: 'smooth' });
}



function createArtDivs(visibleArt, container) {
  visibleArt.forEach((art, index) => {
    const artDiv = document.createElement('div');

    artDiv.innerHTML = ` 
    <div>
      <h3 class="title" data-categories="${art.categories.join(';')}">${art.title}</h3>
      <p class="year"><span style="color:black">Año:</span> ${art.year}</p>
      <p class="size"><span style="color:black">Medidas:</span> ${art.size}</p>
      <p class="price"><span style="color:black">Precio:</span> ${art.price}</p>
    </div>
    `;

    const imagePath = art.image;

    const img = new Image();
    img.src = imagePath;
    img.alt = `${art.title} image`;
    img.id = `image-${index}`;
    img.classList.add("imageFormat");
    img.addEventListener("click", () => {
      openImagePopup(imagePath, index);
    });

    img.onerror = function () {
      this.style.display = 'none';
    };

    const title = artDiv.querySelector('.title');

    const categories = art.categories;

    const matchFound = Array.from(
      document.getElementById("categoryFilter").selectedOptions
    ).every(option => categories.includes(option.value));

    title.style.display = matchFound ? "block" : "none";
    artDiv.style.display = matchFound ? "block" : "none";

    const yearElement = artDiv.querySelector('.year');
    if (yearElement) yearElement.style.display = matchFound ? "block" : "none";

    const sizeElement = artDiv.querySelector('.size');
    if (sizeElement) sizeElement.style.display = matchFound ? "block" : "none";

    const priceElement = artDiv.querySelector('.price');
    if (priceElement) priceElement.style.display = matchFound ? "block" : "none";

    title.after(img);

    container.appendChild(artDiv);
    // Update the images array
    images = Array.from(document.querySelectorAll(".imageFormat"));
  });
}


function moveToImage(direction) {
  const newIndex = currentImageIndex + direction;
  if (newIndex >= 0 && newIndex < images.length) {
    const newImage = images[newIndex];
    const newImagePath = newImage.src;
    document.querySelector('.image-popup').remove(); // Close the current popup
    openImagePopup(newImagePath, newIndex); // Open the new image
  }
}

function openImagePopup(imagePath, index) {
  currentImageIndex = index;
  const popup = document.createElement('div');
  popup.classList.add('image-popup');

  const image = new Image();
  image.src = imagePath;
  image.alt = 'Popup Image';

  const closeButton = document.createElement('button');
  closeButton.className = "closeButton";
  closeButton.textContent = 'Close';
  closeButton.addEventListener('click', () => {
    popup.remove();
    // No need to remove the keydown event listener here
  });

  const nextButton = document.createElement('button');
  nextButton.className = "buttonNext";
  nextButton.textContent = 'Next';
  nextButton.addEventListener('click', (event) => {
    event.stopPropagation(); // To prevent the popup from closing
    moveToImage(1);
  });

  const prevButton = document.createElement('button');
  prevButton.className = "buttonPrevious";
  prevButton.textContent = 'Previous';
  prevButton.addEventListener('click', (event) => {
    event.stopPropagation(); // To prevent the popup from closing
    moveToImage(-1);
  });

  // Close the popup when the background is clicked
  popup.addEventListener('click', (event) => {
    if (event.target === popup) {
      popup.remove();
    }
  });

  popup.appendChild(closeButton);
  popup.appendChild(prevButton);
  popup.appendChild(nextButton);
  popup.appendChild(image);
  document.body.appendChild(popup);

  // Close the popup when the escape key is pressed
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      popup.remove();
    }
  });
}

// Listen for arrow keys
window.addEventListener('keydown', function(event) {
  const popup = document.querySelector('.image-popup');
  if (!popup) {
    // No popup is open, so don't do anything
    return;
  }

  if (event.key === 'ArrowRight') {
    // Move to the next image
    moveToImage(+1);
  } else if (event.key === 'ArrowLeft') {
    // Move to the previous image
    moveToImage(-1);
  }
});



