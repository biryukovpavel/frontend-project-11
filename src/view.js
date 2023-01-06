const handleFormState = (elements, state) => {
  switch (state) {
    case 'filling':
      break;
    case 'finished':
      elements.form.reset();
      elements.input.focus();
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
  feedback.textContent = error === null ? '' : i18nInstance.t(`rssForm.errors.${error}`);
};

const initView = (i18nInstance, elements) => (path, value) => {
  switch (path) {
    case 'rssForm.state':
      handleFormState(elements, value);
      break;
    case 'rssForm.validationState':
      handleFormValidationState(elements, value);
      break;
    case 'rssForm.error':
      renderError(i18nInstance, elements, value);
      break;
    default:
      break;
  }
};

export default initView;
