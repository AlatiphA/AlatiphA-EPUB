const viewer = document.getElementById("viewer");
const toc = document.getElementById("toc");
const progressText = document.getElementById("progressText");
const sidebar = document.getElementById("sidebar");

const menuBtn = document.getElementById("menuBtn");
const themeBtn = document.getElementById("themeBtn");

const nextPage = document.getElementById("nextPage");
const prevPage = document.getElementById("prevPage");

const increaseFont = document.getElementById("increaseFont");
const decreaseFont = document.getElementById("decreaseFont");

let fontSize =
  Number(localStorage.getItem("fontSize")) || 100;

async function loadBook() {

  try {

    const response = await fetch(
      "./library/sample.epub"
    );

    if (!response.ok) {

      throw new Error(
        "EPUB file not found."
      );

    }

    const blob = await response.blob();

    const book = ePub(blob);

    startReader(book);

  } catch (error) {

    alert(error.message);

    console.error(error);

  }

}

loadBook();

const rendition = book.renderTo("viewer", {
  width: "100%",
  height: "100%",
  spread: "none"
});

const savedLocation =
  localStorage.getItem("epub-location");

rendition.display(savedLocation || undefined);

rendition.themes.fontSize(fontSize + "%");

book.ready
  .then(() => {

    const navigation = book.navigation;

    navigation.toc.forEach(chapter => {

      const link = document.createElement("a");

      link.textContent = chapter.label;

      link.href = "#";

      link.addEventListener("click", e => {

        e.preventDefault();

        rendition.display(chapter.href);

        sidebar.classList.remove("active");
      });

      toc.appendChild(link);

    });

  })
  .catch(error => {
    console.error("Book navigation error:", error);
  });

nextPage.addEventListener("click", () => {
  rendition.next();
});

prevPage.addEventListener("click", () => {
  rendition.prev();
});

menuBtn.addEventListener("click", () => {
  sidebar.classList.toggle("active");
});

increaseFont.addEventListener("click", () => {

  fontSize += 10;

  rendition.themes.fontSize(fontSize + "%");

  localStorage.setItem("fontSize", fontSize);

});

decreaseFont.addEventListener("click", () => {

  if (fontSize <= 70) return;

  fontSize -= 10;

  rendition.themes.fontSize(fontSize + "%");

  localStorage.setItem("fontSize", fontSize);

});

function applyTheme() {

  const darkMode =
    localStorage.getItem("darkMode") === "true";

  document.body.classList.toggle("dark", darkMode);

  rendition.themes.default({
    body: {
      background: darkMode ? "#111" : "#fff",
      color: darkMode ? "#fff" : "#000"
    }
  });

}

applyTheme();

themeBtn.addEventListener("click", () => {

  const darkMode =
    localStorage.getItem("darkMode") === "true";

  localStorage.setItem("darkMode", !darkMode);

  applyTheme();

});

book.ready
  .then(() => {
    return book.locations.generate(1000);
  })
  .catch(error => {
    console.error("Location generation error:", error);
  });

rendition.on("relocated", location => {

  try {

    const percentage =
      book.locations.percentageFromCfi(
        location.start.cfi
      );

    const percent =
      Math.floor(percentage * 100);

    progressText.textContent =
      percent + "%";

    localStorage.setItem(
      "epub-location",
      location.start.cfi
    );

  } catch (error) {

    console.error(
      "Progress calculation error:",
      error
    );

  }

});

let touchStartX = 0;
let touchEndX = 0;

viewer.addEventListener("touchstart", e => {

  touchStartX =
    e.changedTouches[0].screenX;

});

viewer.addEventListener("touchend", e => {

  touchEndX =
    e.changedTouches[0].screenX;

  handleSwipe();

});

function handleSwipe() {

  const difference =
    touchStartX - touchEndX;

  if (difference > 50) {
    rendition.next();
  }

  if (difference < -50) {
    rendition.prev();
  }

}

if ("serviceWorker" in navigator) {

  window.addEventListener("load", async () => {

    try {

      await navigator.serviceWorker.register(
        "./sw.js"
      );

      console.log(
        "Service Worker Registered"
      );

    } catch (error) {

      console.error(
        "Service Worker Failed:",
        error
      );

    }

  });

}
