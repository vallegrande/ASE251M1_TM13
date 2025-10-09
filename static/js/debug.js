// Script de prueba para verificar filtros
console.log('=== DEPURACIÓN DE FILTROS ===');

// Verificar elementos DOM
const elementos = {
    'minPrice': document.getElementById('minPrice'),
    'maxPrice': document.getElementById('maxPrice'),
    'minPriceValue': document.getElementById('minPriceValue'),
    'maxPriceValue': document.getElementById('maxPriceValue'),
    'searchInput': document.getElementById('searchInput'),
    'sortBy': document.getElementById('sortBy'),
    'sizeFilterContainer': document.getElementById('sizeFilterContainer'),
    'productCount': document.getElementById('productCount'),
    'categoryBadge': document.getElementById('categoryBadge'),
    'activeFilters': document.getElementById('activeFilters')
};

console.log('Elementos encontrados:');
Object.keys(elementos).forEach(key => {
    console.log(`${key}: ${elementos[key] ? '✓' : '✗'}`);
});

// Verificar productos
const products = document.querySelectorAll('.product-card');
console.log(`Productos encontrados: ${products.length}`);

// Verificar categorías
const categoryRadios = document.querySelectorAll('input[name="category"]');
console.log(`Radio buttons de categoría: ${categoryRadios.length}`);

// Verificar tallas
const sizeRadios = document.querySelectorAll('input[name="size"]');
console.log(`Radio buttons de talla: ${sizeRadios.length}`);

// Función de prueba de filtros
window.testFilters = function() {
    console.log('=== PRUEBA DE FILTROS ===');
    if (typeof applyFilters === 'function') {
        applyFilters();
        console.log('✓ applyFilters ejecutado');
    } else {
        console.log('✗ applyFilters no encontrado');
    }
};

console.log('Ejecuta testFilters() para probar los filtros');