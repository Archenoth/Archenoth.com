import MastoClient from "./masto/MastoClient.js";

const client = new MastoClient("https://chitter.xyz", "110793467193697541");

const statuses = [];
const lightbox = document.getElementById('lightbox');
const gallery = document.getElementById('gallery');

/**
 * @param {Number} i the index of the image you want to display in
 * the lightbox
 */
function displayLightbox(i){
  const status = statuses[i];

  // Cache the elements so we don't need to fetch them again on navigation!
  if(!status.lightbox){
    const media = status.media_attachments[0];

    const full = document.createElement(media.type === "gifv" ? "video" : "img");
    full.src = media.url;
    full.setAttribute("title", media.description);
    full.setAttribute("alt", media.description);

    const link = document.createElement("a");
    link.textContent = "Link";
    link.setAttribute("target", "_blank");
    link.href = status.url;

    status.lightbox = [full, link]
  }

  lightbox.innerHTML = "";
  for(const element of status.lightbox){
    lightbox.appendChild(element);
  }

  lightbox.setAttribute("index", i);
  lightbox.classList.remove("hidden");

  // Videos should play
  const video = lightbox.querySelector("video");
  if(video){
    video.loop = true;
    video.autoplay = true;
    video.play();
  }
}

/**
 * Sets the lightbox to switch to the the next image, wrapping around
 * when hitting the end
 */
function lightboxNext(){
  displayLightbox(
    (parseInt(lightbox.getAttribute("index")) + 1) % statuses.length
  );
}

/**
 * Sets the lightbox to switch to the previous image, wrapping to the end
 * when going before the beginning
 */
function lightboxPrev(){
  let i = parseInt(lightbox.getAttribute("index"));

  if(--i < 0){
    i = statuses.length - 1;
  }

  displayLightbox(i);
}

// Events

lightbox.addEventListener("click", function(){
  lightbox.classList.add("hidden");
});


window.addEventListener("keyup", function(e){
  if(lightbox.classList.contains("hidden")){
    return;
  }

  if(e.key === "ArrowRight"){
    lightboxNext();
  } else if (e.key === "ArrowLeft"){
    lightboxPrev();
  }
});

// Actually fetch it all now and render!
for await(const status of client.fetchStatuses({"tagged": "mastoart"})){
  if(status.sensitive){
    continue;
  }
  const i = statuses.push(status) - 1;
  const media = status.media_attachments[0];
  const article = document.createElement("article");
  const description = document.createElement("div");
  const img = document.createElement("img");

  img.src = media.preview_url;
  img.setAttribute("title", media.description);
  img.setAttribute("alt", media.description);

  article.onclick = displayLightbox.bind(article, i);
  article.appendChild(img);

  // Remove [backlog], and replace :emoji: with their actual images, which live
  // in status.emojis
  description.innerHTML = status.content.replace("[backlog]", "").replace(/:([^ ]+):/g, function(_, code){
    const [emoji] = status.emojis.filter(function({shortcode}){
      return shortcode == code;
    });

    if(!emoji){
      return code;
    }

    const img = document.createElement("img");
    img.src = emoji.url;
    img.height = 20;
    img.style.display = 'inline';

    return img.outerHTML;
  });

  // Remove all hashtag links
  description.querySelectorAll('a').forEach(function(link){
    if(link.innerText.startsWith("#")){
      link.parentElement.removeChild(link);
    }
  });

  // Only add the description if there is anything left in it
  if(description.innerText.trim().length > 0){
    article.appendChild(description);
  }

  gallery.appendChild(article);
}