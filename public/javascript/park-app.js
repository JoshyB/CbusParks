import { $, $$ } from './modules/bling';

import autoComplete from './modules/autocomplete';
import typeAhead from './modules/typeAhead';
import makeMap from './modules/map';
import ajaxHeart from './modules/heart';

autoComplete( $('#address'), $('#lat'), $('#lng'))

typeAhead( $('.search__bar') );

makeMap( $( '#map') );

const heartForms = $$('form.heart');
heartForms.on('submit', ajaxHeart);