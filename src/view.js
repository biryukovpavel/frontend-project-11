const handleFormState = (i18nInstance, elements, state) => {
  const {
    form, input, submitButton, feedback,
  } = elements;
  switch (state) {
    case 'filling':
      input.removeAttribute('readonly');
      input.removeAttribute('disabled');
      submitButton.disabled = false;
      break;
    case 'processing':
      input.setAttribute('readonly', 'true');
      submitButton.disabled = true;
      break;
    case 'finished':
      input.removeAttribute('readonly');
      input.removeAttribute('disabled');
      submitButton.disabled = false;
      form.reset();
      input.focus();
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
      feedback.textContent = i18nInstance.t('feedAddingProcess.finished');
      break;
    case 'failed':
      input.removeAttribute('readonly');
      input.removeAttribute('disabled');
      submitButton.disabled = false;
      break;
    default:
      throw new Error(`Unknown state: ${state}`);
  }
};

const handleFormValidationState = (elements, validationState) => {
  const { input } = elements;
  switch (validationState) {
    case 'valid':
      input.classList.remove('is-invalid');
      break;
    case 'invalid':
      input.classList.add('is-invalid');
      break;
    default:
      throw new Error(`Unknown validation state: ${validationState}`);
  }
};

const renderError = (i18nInstance, elements, error) => {
  const { feedback } = elements;
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  feedback.textContent = error === null ? '' : i18nInstance.t([`errors.${error}`, 'errors.unknown']);
};

const renderFeeds = (i18nInstance, elements, feeds) => {
  const { feedsContainer } = elements;
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const divHeader = document.createElement('div');
  divHeader.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nInstance.t('feeds');
  divHeader.append(h2);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  const feedsList = feeds.map((feed) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');

    const h3 = document.createElement('h3');
    h3.classList.add('h6', 'm-0');
    h3.textContent = feed.title;

    const p = document.createElement('p');
    p.classList.add('m-0', 'small', 'text-black-50');
    p.textContent = feed.description;

    li.append(h3, p);
    return li;
  });
  ul.append(...feedsList);

  div.append(divHeader, ul);
  feedsContainer.replaceChildren(div);
};

const renderPosts = (state, i18nInstance, elements) => {
  const { posts, uiState } = state;
  const { postsContainer } = elements;
  const div = document.createElement('div');
  div.classList.add('card', 'border-0');

  const divHeader = document.createElement('div');
  divHeader.classList.add('card-body');
  const h2 = document.createElement('h2');
  h2.classList.add('card-title', 'h4');
  h2.textContent = i18nInstance.t('posts');
  divHeader.append(h2);

  const ul = document.createElement('ul');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  const postsList = posts.map((post) => {
    const li = document.createElement('li');
    li.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const a = document.createElement('a');
    a.setAttribute('href', post.link);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    const classes = uiState.readPosts.has(post.id) ? 'fw-normal' : 'fw-bold';
    a.classList.add(classes);
    a.dataset.id = post.id;
    a.textContent = post.title;

    const button = document.createElement('button');
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.dataset.id = post.id;
    button.dataset.bsToggle = 'modal';
    button.dataset.bsTarget = '#modal';
    button.textContent = i18nInstance.t('view');

    li.append(a, button);
    return li;
  });
  ul.append(...postsList);

  div.append(divHeader, ul);
  postsContainer.replaceChildren(div);
};

const handleModal = (state, elements, postId) => {
  const currentPost = state.posts.find(({ id }) => id === postId);
  const { modal } = elements;
  const title = modal.querySelector('.modal-title');
  const body = modal.querySelector('.modal-body');
  const fullArticle = modal.querySelector('.full-article');
  title.textContent = currentPost.title;
  body.textContent = currentPost.description;
  fullArticle.href = currentPost.link;
};

const initView = (i18nInstance, elements, state) => (path, value) => {
  switch (path) {
    case 'feedAddingProcess.state':
      handleFormState(i18nInstance, elements, value);
      break;
    case 'feedAddingProcess.validationState':
      handleFormValidationState(elements, value);
      break;
    case 'feedAddingProcess.error':
      renderError(i18nInstance, elements, value);
      break;
    case 'feeds':
      renderFeeds(i18nInstance, elements, value);
      break;
    case 'posts':
    case 'uiState.readPosts':
      renderPosts(state, i18nInstance, elements);
      break;
    case 'uiState.modal.postId':
      handleModal(state, elements, value);
      break;
    default:
      break;
  }
};

export default initView;
