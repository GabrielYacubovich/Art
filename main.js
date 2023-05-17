// main.js
import {
  search,
  resetSearch,
  createArt,
  getUniqueCategories,
  filterByCategory,
} from './functions.js';
import { 
  fetchCSVData,
} from './extraFeatures.js';

const container = document.querySelector('#art-container');
// Register event listeners and initialize the page

document.addEventListener("DOMContentLoaded", async () => {
  
  document.getElementById("resetButton").addEventListener("click", () => {
    resetSearch();
    createArt(container, artData, categoryFilterElement);
    window.scrollTo(0, 0);
  });
 /* document.getElementById("resetButtonBottom").addEventListener("click", () => {
    resetSearch();
    createArt(container, artData, categoryFilterElement);
    window.scrollTo(0, 0);
  });*/
  document.getElementById("generatePDFButton").addEventListener("click", generatePDF);
  
  
  const categoryFilterElement = document.querySelector('#categoryFilter');
  const artData = await fetchCSVData('art.csv');
  const uniqueCategories = getUniqueCategories(artData);
  uniqueCategories.forEach(category => {
    if (!categoryFilterElement.querySelector(`[value="${category}"]`)) {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categoryFilterElement.appendChild(option);
    }
  });
  // Register filter event listener
  categoryFilterElement.addEventListener("change", filterByCategory);
  // Pass artData to createArt() function
  await createArt(container, artData, categoryFilterElement);
});


async function generatePDF() {
  const artContainer = document.getElementById("art-container");
  const artPieces = Array.from(artContainer.children);

  const pdf = new jsPDF('p', 'mm', 'a4');
  const title = "My Custom PDF Title";
  pdf.setFontSize(20);

  let paddingFromTop = 30;
  let marginRight = 13; // Adjust the right margin here (in pixels)
  let scalePercentage = 2; // if browser/screen width change, need to correct/
  const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (windowWidth > 1700) {
    scalePercentage = 1.8; // Adjust the scale percentage as per your requirement
  }
    else if (windowWidth > 1500) {
    scalePercentage = 2.1; // Adjust the scale percentage as per your requirement
  } else if (windowWidth > 1300) {
    scalePercentage = 2; // Adjust the scale percentage as per your requirement
  }
    else if (windowWidth > 1100) {
    scalePercentage = 1.7; // Adjust the scale percentage as per your requirement
  }
  else if (windowWidth > 900) {
    scalePercentage = 1.4; // Adjust the scale percentage as per your requirement
  }
  else if (windowWidth > 700) {
    scalePercentage = 1.1; // Adjust the scale percentage as per your requirement
  }
  else if (windowWidth > 500) {
    scalePercentage = 0.9; // Adjust the scale percentage as per your requirement
  }
  for (let i = 0; i < artPieces.length; i += 2) {
    let clone1 = artPieces[i].cloneNode(true);
    document.body.appendChild(clone1);

    let clone2 = null;
    if (artPieces[i + 1]) {
      clone2 = artPieces[i + 1].cloneNode(true);
      document.body.appendChild(clone2);
    }

    const canvas1 = await html2canvas(clone1, { useCORS: true });
    const imgData1 = canvas1.toDataURL('image/png');
// Resize the image if its height is greater than 800px
if (canvas1.height > 800) {
  const aspectRatio1 = canvas1.width / canvas1.height;
  const resizedWidth1 = 800 * aspectRatio1;
  const resizedCanvas1 = document.createElement('canvas');
  resizedCanvas1.width = resizedWidth1;
  resizedCanvas1.height = 800;
  const resizedCtx1 = resizedCanvas1.getContext('2d');
  resizedCtx1.drawImage(canvas1, 0, 0, resizedWidth1, 800);
  imgData1 = resizedCanvas1.toDataURL('image/png');
}
    // Only add title for the first page
    if (i == 0) {
      pdf.text(title, 35, 20); // Adjust the y-position of the title
      paddingFromTop += 10; // Increase the padding by 20 for the first page
    }

    // Calculate aspect ratio and adjust height
    let aspectRatio1 = canvas1.width / canvas1.height;
    let pdfWidth1 = pdf.internal.pageSize.getWidth() - marginRight; // Full PDF width - right margin
    let pdfHeight1 = (pdfWidth1 / aspectRatio1);

    // Scale image dimensions
    pdfWidth1 *= scalePercentage;
    pdfHeight1 *= scalePercentage;

    pdf.addImage(
      imgData1,
      'PNG',
      marginRight, // Add right margin here
      paddingFromTop, // Apply padding directly here
      pdfWidth1,
      pdfHeight1,
      null,
      'FAST'
    );
    document.body.removeChild(clone1);

    if (clone2) {
      const canvas2 = await html2canvas(clone2, { useCORS: true });
      const imgData2 = canvas2.toDataURL('image/png');

      // Calculate aspect ratio and adjust height
      let aspectRatio2 = canvas2.width / canvas2.height;
      let pdfWidth2 = pdf.internal.pageSize.getWidth() - marginRight; // Full PDF width - right margin
      let pdfHeight2 = (pdfWidth2 / aspectRatio2);

      // Scale image dimensions
      pdfWidth2 *= scalePercentage;
      pdfHeight2 *= scalePercentage;

      pdf.addImage(
        imgData2,
        'PNG',
        marginRight, // Add right margin here
        paddingFromTop + pdfHeight1, // Apply padding directly here
        pdfWidth2,
        pdfHeight2,
        null,
        'FAST'
      );
      document.body.removeChild(clone2);
    }

    if (i + 2 < artPieces.length) {
      // Adjust the padding for the next page
      paddingFromTop = 30;
      pdf.addPage();
    }
  }

  pdf.save("results.pdf");
}

