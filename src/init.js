// import * as bootstrap from 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import i18next from 'i18next';
import initView from './view.js';
import resources from './locales/index.js';

yup.setLocale({
  string: {
    url: 'invalidUrl',
  },
  mixed: {
    notOneOf: 'exists',
  },
});

const schema = yup.object().shape({
  url: yup.string().url().notOneOf([yup.ref('$feeds')]),
});

const validate = (fields, feeds) => schema.validate(fields, { context: { feeds } });

export default () => {
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
  };

  const i18nInstance = i18next.createInstance();
  i18nInstance
    .init({
      lng: 'ru',
      debug: false,
      resources,
    })
    .then(() => {
      const elements = {
        form: document.querySelector('.rss-form'),
        input: document.querySelector('#url-input'),
        feedback: document.querySelector('.feedback'),
      };

      const watchedState = onChange(state, initView(i18nInstance, elements));

      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        watchedState.rssForm.data.url = formData.get('url');

        validate(watchedState.rssForm.data, watchedState.feeds)
          .then(() => {
            watchedState.rssForm.validationState = 'valid';
            watchedState.rssForm.error = null;
            watchedState.feeds.push(watchedState.rssForm.data.url);
            watchedState.rssForm.state = 'finished';
          })
          .catch((error) => {
            watchedState.rssForm.validationState = 'invalid';
            watchedState.rssForm.error = error.message;
          });
      });
    });
};
