const slides=document.querySelector(".slides");
const totalSlides=document.querySelectorAll(".slide").length;

function mudarSlide(direcao){
slideAtual+=direcao;

if(slideAtual>=totalSlides){
slideAtual=0;
}

if(slideAtual<0){
slideAtual=totalSlides-1;
}

slides.style.transform=`translateX(-${slideAtual*100/totalSlides}%)`;
}

setInterval(function(){
mudarSlide(1);
},5000);