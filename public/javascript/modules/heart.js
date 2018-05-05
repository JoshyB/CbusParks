import axios from "axios";
import { $ } from './bling'; 

function ajaxHeart(e) {
  e.preventDefault();

  axios
   .post(this.action)
   .then(res => {
       const isHearted = this.heart.classList.toggle('user__hearted');
       $('.heart__count').textContent = res.data.hearts.length;
   })
   .catch(console.error);
}

export default ajaxHeart;
