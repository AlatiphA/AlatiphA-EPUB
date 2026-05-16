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
    localStorage.getItem(
      "fontSize"
    )
  ) || 100;

let touchStartX = 0;

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
    book.renderTo(
      "viewer",
      {

        width: "100%",

        height: "100%",

        spread: "none",

        manager: "default",

        flow: "paginated",

        snap: true

      }
    );

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

  setupSwipeNavigation();

  book.ready
    .then(async () => {

      toc.innerHTML = "";

      const navigation =
        book.navigation;

      navigation.toc.forEach(
        chapter => {

          const link =
            document.createElement(
              "a"
            );

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

      await book.locations.generate(
        1000
      );

    })
    .catch(error => {

      console.error(
        "Navigation error:",
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

        console.error(error);

      }

    }
  );

}

function setupSwipeNavigation() {

  rendition.on(
    "rendered",
    () => {

      const iframe =
        viewer.querySelector(
          "iframe"
        );

      if (!iframe) return;

      const iframeWindow =
        iframe.contentWindow;

      iframeWindow.onpointerup =
        e => {

          const width =
            iframeWindow.innerWidth;

          const x =
            e.clientX;

          const leftZone =
            width * 0.3;

          const rightZone =
            width * 0.7;

          if (x <= leftZone) {

            rendition.prev();

            return;

          }

          if (x >= rightZone) {

            rendition.next();

            return;

          }

          toggleControls();

        };

    }
  );

}

function toggleControls() {

  const header =
    document.querySelector(
      "header"
    );

  const footer =
    document.querySelector(
      "footer"
    );

  const hidden =
    header.classList.contains(
      "hideControls"
    );

  if (hidden) {

    header.classList.remove(
      "hideControls"
    );

    footer.classList.remove(
      "hideControls"
    );

  }

  else {

    header.classList.add(
      "hideControls"
    );

    footer.classList.add(
      "hideControls"
    );

  }

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
            : "#000",

        padding: "20px",

        "line-height": "1.7",

        "font-family":
          "Arial, sans-serif"

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

if (
  "serviceWorker" in navigator
) {

  window.addEventListener(
    "load",
    async () => {

      try {

        await navigator
          .serviceWorker
          .register(
            "./sw.js"
          );

      } catch (error) {

        console.error(
          error
        );

      }

    }
  );

}

loadBook();
