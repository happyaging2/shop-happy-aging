```javascript
document.addEventListener('DOMContentLoaded', function() {
  const cartDrawerToggle = document.querySelector('[aria-controls="CartDrawer"]');
  const cartDrawer = document.querySelector('cart-drawer');
  
  if (cartDrawerToggle && cartDrawer) {
    cartDrawerToggle.addEventListener('click', function() {
      cartDrawer.classList.add('active');
    });
    
    // Adicionar evento para fechar o drawer
    const closeButton = cartDrawer.querySelector('button[aria-label="Close"]');
    if (closeButton) {
      closeButton.addEventListener('click', function() {
        cartDrawer.classList.remove('active');
      });
    }
  }
});
```
