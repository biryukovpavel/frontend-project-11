// import * as bootstrap from 'bootstrap';
import * as yup from 'yup';
import onChange from 'on-change';
import initView from './view.js';

const validate = (fields, values) => {
  const schema = yup.object().shape({
    url: yup.string().url().notOneOf(values),
  });

  return schema.validate(fields);
};

export default () => {
  const state = {
    rssForm: {
      state: 'filling',
      validationState: 'valid',
      data: {
        url: '',
      },
    },
    feeds: [],
  };

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
  };

  const watchedState = onChange(state, initView(elements));

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    watchedState.rssForm.data.url = formData.get('url');

    validate(watchedState.rssForm.data, watchedState.feeds)
      .then(() => {
        watchedState.rssForm.validationState = 'valid';
        watchedState.feeds.push(watchedState.rssForm.data.url);
        watchedState.rssForm.state = 'finished';
      })
      .catch(() => {
        watchedState.rssForm.validationState = 'invalid';
      });
  });
};
