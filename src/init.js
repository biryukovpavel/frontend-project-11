import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import axios from 'axios';
import uniqueId from 'lodash/uniqueId.js';
import differenceBy from 'lodash/differenceBy.js';
import initView from './view.js';
import resources from './locales/index.js';
import parse from './parser.js';

yup.setLocale({
  string: {
    url: 'invalidUrl',
  },
  mixed: {
    required: 'required',
    notOneOf: 'exists',
  },
});

const schema = yup.object().shape({
  url: yup
    .string()
    .required()
    .url()
    .notOneOf([yup.ref('$feedUrls')]),
});

const validate = (fields, feedUrls) => schema
    .validate(fields, { context: { feedUrls } })
    .then(() => null)
    .catch((e) => {
      e.isValidationError = true;
      throw e;
    });

const getFullUrl = (rssUrl) => {
  const url = new URL('/get', 'https://allorigins.hexlet.app');
  const { searchParams } = url;
  searchParams.set('url', rssUrl);
  searchParams.set('disableCache', 'true');
  return url.toString();
};

const updatePosts = (watchedState) => {
  const { feeds } = watchedState;
  const feedPromises = feeds.map((feed) => {
    const url = getFullUrl(feed.url);
    return axios.get(url)
      .then((response) => {
        const rssData = parse(response.data.contents);
        const posts = rssData.items.map((item) => ({
          ...item,
          id: uniqueId(),
          channelId: feed.id,
        }));
        const currentPosts = watchedState.posts.filter(({ channelId }) => channelId === feed.id);
        const newPosts = differenceBy(posts, currentPosts, 'title');
        watchedState.posts.unshift(...newPosts);
      })
      .catch((error) => {
        console.error(error); // eslint-disable-line no-console
      });
  });

  Promise.all(feedPromises).finally(() => setTimeout(() => updatePosts(watchedState), 5000));
};

const app = (i18nInstance) => {
  const state = {
    rssForm: {
      state: 'filling',
      validationState: 'valid',
      data: {
        url: '',
      },
      error: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      modal: { postId: null },
      readPosts: new Set(),
    },
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    submitButton: document.querySelector('button[type="submit"]'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };

  const watchedState = onChange(state, initView(i18nInstance, elements, state));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    watchedState.rssForm.state = 'processing';

    const formData = new FormData(e.target);
    watchedState.rssForm.data.url = formData.get('url');

    const feedUrls = watchedState.feeds.map((feed) => feed.url);
    validate(watchedState.rssForm.data, feedUrls)
      .then(() => {
        watchedState.rssForm.validationState = 'valid';
        watchedState.rssForm.error = null;

        const url = getFullUrl(watchedState.rssForm.data.url);
        return axios.get(url);
      })
      .then((response) => {
        const rssData = parse(response.data.contents);
        const feed = {
          id: uniqueId(),
          url: watchedState.rssForm.data.url,
          title: rssData.title,
          description: rssData.description,
        };
        const posts = rssData.items.map((item) => ({
          ...item,
          id: uniqueId(),
          channelId: feed.id,
        }));
        watchedState.feeds.unshift(feed);
        watchedState.posts.unshift(...posts);
        watchedState.rssForm.state = 'finished';
      })
      .catch((error) => {
        console.log(error); // eslint-disable-line no-console
        if (error.isValidationError) {
          watchedState.rssForm.validationState = 'invalid';
          watchedState.rssForm.error = error.message;
        } else if (error.isAxiosError) {
          watchedState.rssForm.error = 'network';
        } else if (error.isParsingError) {
          watchedState.rssForm.error = 'invalidRss';
        } else {
          watchedState.rssForm.error = 'unknown';
        }
        watchedState.rssForm.state = 'failed';
      });
  });

  elements.postsContainer.addEventListener('click', (e) => {
    const { dataset } = e.target;
    if (!('id' in dataset)) {
      return;
    }
    watchedState.uiState.modal.postId = dataset.id;
    watchedState.uiState.readPosts.add(dataset.id);
  });

  setTimeout(() => updatePosts(watchedState), 5000);
};

export default () => {
  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => app(i18nInstance));
};
