// Carrusel JS mejorado
const totalImages = 12;
let current = 1;
const imgEl = document.getElementById('carousel-img');
document.getElementById('prev-slide').addEventListener('click', () => {
  current = current === 1 ? totalImages : current - 1;
  imgEl.src = `/static/img/imagen${current}.jpg`;
});
document.getElementById('next-slide').addEventListener('click', () => {
  current = current === totalImages ? 1 : current + 1;
  imgEl.src = `/static/img/imagen${current}.jpg`;
});
