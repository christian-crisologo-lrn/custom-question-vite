import { runAuthoring } from './authoring';
import { runPlayer } from './player';
import { getQueryParam } from './util';

const mode = getQueryParam('mode');

if (mode === 'assess') {
  runPlayer();
} else {
  runAuthoring();
} 
