import './styles.scss';
import * as bootstrap from 'bootstrap';

const button = document.querySelector('button');
const popover = new bootstrap.Popover(button);
button.addEventListener('click', (e) => {
  e.preventDefault();

  popover.show();
});
