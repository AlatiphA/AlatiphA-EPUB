const viewer =
  document.getElementById("viewer");

const toc =
  document.getElementById("toc");

const progressText =
  document.getElementById("progressText");

const sidebar =
  document.getElementById("sidebar");

const menuBtn =
  document.getElementById("menuBtn");

const themeBtn =
  document.getElementById("themeBtn");

const nextPage =
  document.getElementById("nextPage");

const prevPage =
  document.getElementById("prevPage");

const increaseFont =
  document.getElementById("increaseFont");

const decreaseFont =
  document.getElementById("decreaseFont");

let rendition;
let book;

let fontSize =
  Number(
    localStorage.getItem("fontSize")
  ) || 100;

async function loadBook() {

  try {

    const response =
      await fetch(
        "./library/sample.epub"
      );

    if (!response.ok) {

      throw new Error(
        "EPUB file not found."
      );

    }

    const blob =
      await response.blob();

    book = ePub(blob);

    startReader();

  } catch (error) {

    console.error(error);

    alert(
      "Failed to load EPUB."
    );

  }

}

function startReader() {

  rendition =
    book.renderTo("viewer", {

      width: "100%",
      height: "100%",
      spread: "none"

    });

  const savedLocation =
    localStorage.getItem(
      "epub-location"
    );

  rendition.display(
    savedLocation || undefined
  );

  rendition.themes.fontSize(
    fontSize + "%"
  );

  applyTheme();

  book.ready
    .then(() => {

      const navigation =
        book.navigation;

      toc.innerHTML = "";

      navigation.toc.forEach(
        chapter => {

          const link =
            document.createElement("a");

          link.textContent =
            chapter.label;

          link.href = "#";

          link.addEventListener(
            "click",
            e => {

              e.preventDefault();

              rendition.display(
                chapter.href
              );

              sidebar.classList.remove(
                "active"
              );

            }
          );

          toc.appendChild(link);

        }
      );

      return book.locations.generate(
        1000
      );

    })
    .catch(error => {

      console.error(
        "Book setup error:",
        error
      );

    });

  rendition.on(
    "relocated",
    location => {

      try {

        const percentage =
          book.locations.percentageFromCfi(
            location.start.cfi
          );

        const percent =
          Math.floor(
            percentage * 100
          );

        progressText.textContent =
          percent + "%";

        localStorage.setItem(
          "epub-location",
          location.start.cfi
        );

      } catch (error) {

        console.error(
          "Progress error:",
          error
        );

      }

    }
  );

}

function applyTheme() {

  const darkMode =
    localStorage.getItem(
      "darkMode"
    ) === "true";

  document.body.classList.toggle(
    "dark",
    darkMode
  );

  if (rendition) {

    rendition.themes.default({

      body: {

        background:
          darkMode
            ? "#111"
            : "#fff",

        color:
          darkMode
            ? "#fff"
            : "#000"

      }

    });

  }

}

menuBtn.addEventListener(
  "click",
  () => {

    sidebar.classList.toggle(
      "active"
    );

  }
);

themeBtn.addEventListener(
  "click",
  () => {

    const darkMode =
      localStorage.getItem(
        "darkMode"
      ) === "true";

    localStorage.setItem(
      "darkMode",
      !darkMode
    );

    applyTheme();

  }
);

nextPage.addEventListener(
  "click",
  () => {

    if (rendition) {
      rendition.next();
    }

  }
);

prevPage.addEventListener(
  "click",
  () => {

    if (rendition) {
      rendition.prev();
    }

  }
);

increaseFont.addEventListener(
  "click",
  () => {

    fontSize += 10;

    if (rendition) {

      rendition.themes.fontSize(
        fontSize + "%"
      );

    }

    localStorage.setItem(
      "fontSize",
      fontSize
    );

  }
);

decreaseFont.addEventListener(
  "click",
  () => {

    if (fontSize <= 70) return;

    fontSize -= 10;

    if (rendition) {

      rendition.themes.fontSize(
        fontSize + "%"
      );

    }

    localStorage.setItem(
      "fontSize",
      fontSize
    );

  }
);

let touchStartX = 0;
let touchEndX = 0;

viewer.addEventListener(
  "touchstart",
  e => {

    touchStartX =
      e.changedTouches[0].screenX;

  }
);

viewer.addEventListener(
  "touchend",
  e => {

    touchEndX =
      e.changedTouches[0].screenX;

    handleSwipe();

  }
);

function handleSwipe() {

  const difference =
    touchStartX - touchEndX;

  if (
    difference > 50 &&
    rendition
  ) {

    rendition.next();

  }

  if (
    difference < -50 &&
    rendition
  ) {

    rendition.prev();

  }

}

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    async () => {

      try {

        await navigator
          .serviceWorker
          .register("./sw.js");

        console.log(
          "Service Worker Registered"
        );

      } catch (error) {

        console.error(
          "SW Error:",
          error
        );

      }

    }
  );

}

loadBook();
