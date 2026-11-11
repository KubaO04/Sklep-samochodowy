(() => {
 const grid=document.getElementById('instagram-grid');if(!grid)return;
 grid.innerHTML=window.IG_MOTORS_GALLERY.map(item=>`<a class="instagram-tile" href="https://www.instagram.com/igmotors__/p/${item.source}/" target="_blank" rel="noopener noreferrer" aria-label="${window.IGUI.escape(item.alt)} — zobacz post"><img src="${item.image}" alt="${window.IGUI.escape(item.alt)}" loading="lazy" width="400" height="400">${window.IGUI.icon('instagram')}</a>`).join('');
})();
