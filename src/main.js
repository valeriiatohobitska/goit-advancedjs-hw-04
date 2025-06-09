import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

import { fetchImages } from './js/pixabay-api.js';
import { renderGallery, clearGallery } from './js/render-functions.js';

import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.form');
const input = form.querySelector('input[name="search"]');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreBtn = document.querySelector('.load-more');

let query = '';
let page = 1;
let totalPages = 0;
let lightbox = null;

form.addEventListener('submit', async event => {
  event.preventDefault();
  const newQuery = input.value.trim();

  if (newQuery === '') {
    iziToast.warning({
      message: 'Please enter a search query.',
      position: 'topRight',
    });
    return;
  }

  query = newQuery;
  page = 1;
  totalPages = 0;
  clearGallery();
  loadMoreBtn.classList.add('hidden');

  await loadImages();
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;
  await loadImages(true);
});

async function loadImages(isLoadMore = false) {
  try {
    loader.classList.add('active');

    const data = await fetchImages(query, page);
    totalPages = Math.ceil(data.totalHits / 15);

    if (data.hits.length === 0) {
      if (isLoadMore) {
        iziToast.info({
          message: "You've reached the end of search results.",
          position: 'topRight',
        });
      } else {
        iziToast.error({
          message: 'Sorry, there are no images matching your search query.',
          position: 'topRight',
        });
      }
      loadMoreBtn.classList.add('hidden');
      return;
    }

    renderGallery(data.hits);

    if (!lightbox) {
      lightbox = new SimpleLightbox('.gallery a', {
        captionsData: 'alt',
        captionDelay: 250,
      });
    } else {
      lightbox.refresh();
    }

    if (page >= totalPages) {
      loadMoreBtn.classList.add('hidden');
    } else {
      loadMoreBtn.classList.remove('hidden');
    }

    if (isLoadMore) {
      const { height } = gallery.firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: height * 2,
        behavior: 'smooth',
      });
    }
  } catch (error) {
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
    });
    loadMoreBtn.classList.add('hidden');
  } finally {
    loader.classList.remove('active');
  }
}
