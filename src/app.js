function addToWishlist(name, brand, price, productType) {
    const item = { name, brand, price, productType };
    wishlist.push(item);
    displayWishlist();
    showPopup('Wishlist item added successfully.');
    ipcRenderer.send('save-wishlist-item', item);

    ipcRenderer.once('save-success', (event, message) => {
        showPopup(message);
    });
    ipcRenderer.once('save-error', (event, errorMessage) => {
        showPopup(errorMessage);
    });
}

// Toggle between pages
function showPage(pageId) {
    const pages = ['homepage', 'recommendations-page', 'wishlist-page'];
    pages.forEach(page => document.getElementById(page).style.display = 'none');
    document.getElementById(pageId).style.display = 'block';
  }
  
  // API search function (from api.js)
  async function searchProducts() {
    const brand = document.getElementById('brand').value;
    const productType = document.getElementById('product-type').value;
    const maxPrice = document.getElementById('price').value;
  
    try {
        const response = await fetch(`https://makeup-api.herokuapp.com/api/v1/products.json?brand=${brand}&product_type=${productType}`);
        const products = await response.json();
  
        const filteredProducts = products.filter(product => parseFloat(product.price) * 4.18 <= maxPrice);
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = ""; // Clear previous results
  
        if (filteredProducts.length > 0) {
            filteredProducts.forEach(product => {
                const productPriceRM = (parseFloat(product.price) * 4.18).toFixed(2);
                const productElement = document.createElement("div");
                productElement.classList.add('product');
                
                // Escape special characters in the strings
                const escapedName = product.name.replace(/'/g, "\\'");
                const escapedBrand = product.brand.replace(/'/g, "\\'");
                const escapedType = product.product_type.replace(/'/g, "\\'");
                
                productElement.innerHTML = `
                    <img src="${product.image_link}" alt="${escapedName}">
                    <div>
                        <h3>${product.name}</h3>
                        <p>Brand: ${product.brand}</p>
                        <p>Price: RM${productPriceRM}</p>
                        <button onclick="addToWishlist('${escapedName}', '${escapedBrand}', '${productPriceRM}', '${escapedType}')">
                            Add to Wishlist
                        </button>
                    </div>
                `;
                resultsDiv.appendChild(productElement);
            });
        } else {
            resultsDiv.innerHTML = "<p>No products found within the specified criteria.</p>";
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        document.getElementById("results").innerHTML = "<p>Error fetching products. Please try again later.</p>";
    }
  }


  