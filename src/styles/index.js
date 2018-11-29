import Vue from 'vue';

import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import {
  faArrowAltCircleUp,
  faArrowAltCircleDown,
  faCheck,
  faComments,
  faDoorOpen,
  faExclamationTriangle,
  faFire,
  faHeart,
  faImages,
  faLink,
  faLock,
  faFileDownload,
  faMinus,
  faPen,
  faPlus,
  faRedoAlt,
  faReply,
  faRetweet,
  faSync,
  faTh,
  faUsers
} from '@fortawesome/free-solid-svg-icons';

import { faTwitter } from '@fortawesome/free-brands-svg-icons';

import styles from './global.scss';

// See https://fontawesome.com/how-to-use/on-the-web/using-with/vuejs
library.add(faArrowAltCircleUp);
library.add(faArrowAltCircleDown);
library.add(faCheck);
library.add(faComments);
library.add(faDoorOpen);
library.add(faExclamationTriangle);
library.add(faFileDownload);
library.add(faFire);
library.add(faHeart);
library.add(faImages);
library.add(faLink);
library.add(faLock);
library.add(faMinus);
library.add(faPen);
library.add(faPlus);
library.add(faRedoAlt);
library.add(faReply);
library.add(faRetweet);
library.add(faSync);
library.add(faTh);
library.add(faTwitter);
library.add(faUsers);

Vue.component('font-awesome-icon', FontAwesomeIcon);

export default {
  Styles: styles,
  components: {
    'font-awesome-icon': FontAwesomeIcon
  }
};
