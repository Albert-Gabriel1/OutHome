const destinos = [
    { code:'GIG', city:'Rio de Janeiro', tag:'Praia', img:'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=700&q=80&auto=format&fit=crop' },
    { code:'LIS', city:'Lisboa', tag:'Cidade', img:'https://images.unsplash.com/photo-1585208798174-6cedd86e019a?w=700&q=80&auto=format&fit=crop' },
    { code:'KYO', city:'Kyoto', tag:'Cultura', img:'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=700&q=80&auto=format&fit=crop' },
    { code:'SAT', city:'Santorini', tag:'Ilha', img:'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=700&q=80&auto=format&fit=crop' },
    { code:'PEN', city:'Patagônia', tag:'Aventura', img:'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=700&q=80&auto=format&fit=crop' },
    { code:'MRK', city:'Marrakech', tag:'Deserto', img:'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=700&q=80&auto=format&fit=crop' },
  ];
 
  const track = document.getElementById('track');
  const dotsWrap = document.getElementById('dots');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const carousel = document.getElementById('carousel');
 
  const total = destinos.length;
  const visible = window.innerWidth <= 640 ? 2 : 3;
  let index = 0;
  let autoplay;
 
  // duplica os slides no fim para permitir loop sem "pulo"
  const renderList = [...destinos, ...destinos.slice(0, visible)];
 
  renderList.forEach(d => {
    const slide = document.createElement('div');
    slide.className = 'slide';
    slide.innerHTML = `
      <img src="${d.img}" alt="${d.city}" loading="lazy">
      <div class="tag">${d.tag}</div>
      <div class="slide-label">
        <div class="flip-code">${d.code}</div>
        <div class="flip-city">${d.city}</div>
      </div>
    `;
    track.appendChild(slide);
  });
 
  destinos.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (i === 0 ? ' active' : '');
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });
 
  function update(withTransition = true){
    const slideWidth = track.children[0].getBoundingClientRect().width + 14;
    track.style.transition = withTransition ? '' : 'none';
    track.style.transform = `translateX(-${index * slideWidth}px)`;
 
    document.querySelectorAll('.dot').forEach((d, i) => {
      d.classList.toggle('active', i === index % total);
    });
  }
 
  function goTo(i, manual = false){
    index = i;
    update();
    if(manual) restartAutoplay();
  }
 
  function next(){
    index++;
    update();
    if(index >= total){
      setTimeout(() => {
        index = 0;
        update(false);
      }, 700);
    }
  }
 
  function prev(){
    index--;
    if(index < 0){
      index = total - 1;
      update(false);
      requestAnimationFrame(() => requestAnimationFrame(() => {
        index = total - 1;
      }));
    } else {
      update();
    }
  }
 
  function restartAutoplay(){
    clearInterval(autoplay);
    autoplay = setInterval(next, 3200);
  }
 
  nextBtn.addEventListener('click', () => { next(); restartAutoplay(); });
  prevBtn.addEventListener('click', () => { prev(); restartAutoplay(); });
 
  carousel.addEventListener('mouseenter', () => clearInterval(autoplay));
  carousel.addEventListener('mouseleave', restartAutoplay);
 
  window.addEventListener('resize', () => update(false));
 
  update(false);
  restartAutoplay();