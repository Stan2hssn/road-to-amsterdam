import gsap from "gsap";

export default class {
  constructor() {
    this.japaneseList = null;
    this.japaneseItems = [];
    this.translatedList = null;
    this.translatedItems = [];
    this.totalItems = 0;
    this.slideWidth = 0;
    this.currentIndex = 0;
    this.isSetup = false;

    this.init();

    // Bind methods to the correct context
    this.nextSlide = this.nextSlide.bind(this);
    this.prevSlide = this.prevSlide.bind(this);
  }

  init() {
    this.cacheDOMElements();
    this.setupCarousel();
  }

  cacheDOMElements() {
    this.main = document.querySelector(".emotions");
    this.japaneseList = document.querySelector(".emotionsJapanese");
    this.japaneseItems = document.querySelectorAll(".emotionsJapanese li");
    this.translatedList = document.querySelector(".emotionsTranslated");
    this.translatedItems = document.querySelectorAll(".emotionsTranslated li");
    this.totalItems = this.japaneseItems.length;

    if (this.totalItems > 0) {
      this.slideWidth = this.japaneseItems[0].clientWidth + 24;
    }

    console.log(" this.japaneseItems", this.japaneseItems[0].clientWidth);
  }

  setupCarousel() {
    if (this.totalItems === 0) return;

    // Set widths for items and lists
    this.japaneseItems.forEach((item) => {
      this.japaneseList.style.width = `${this.slideWidth}px`;
      item.style.width = `${this.slideWidth}px`;
    });

    this.translatedItems.forEach((item) => {
      this.translatedList.style.width = `${this.slideWidth}px`;
      item.style.width = `${this.slideWidth}px`;
    });

    this.isSetup = true;
  }

  addEventListeners() {
    const nextArrow = document.querySelector(".arrow.next");
    const prevArrow = document.querySelector(".arrow.prev");

    if (nextArrow) {
      nextArrow.addEventListener("click", this.nextSlide);
    }
    if (prevArrow) {
      prevArrow.addEventListener("click", this.prevSlide);
    }
  }

  dispose() {
    // Animate and hide the main element
    gsap
      .to(this.main, {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
      })
      .then(() => {
        gsap.set(this.main, { display: "none" });
      });

    // Clean up event listeners
    const nextArrow = document.querySelector(".arrow.next");
    const prevArrow = document.querySelector(".arrow.prev");

    if (nextArrow) {
      nextArrow.removeEventListener("click", this.nextSlide);
    }
    if (prevArrow) {
      prevArrow.removeEventListener("click", this.prevSlide);
    }
  }

  nextSlide() {
    this.currentIndex += 1;
    if (this.currentIndex > this.totalItems - 1) {
      this.currentIndex = 0;
    }
    this.updateCarousel();
  }

  prevSlide() {
    this.currentIndex -= 1;
    if (this.currentIndex < 0) {
      this.currentIndex = this.totalItems - 1;
    }
    this.updateCarousel();
  }

  updateCarousel() {
    this.japaneseItems.forEach((item) => {
      item.style.transform = `translateX(-${this.currentIndex * this.slideWidth}px)`;
    });
    this.translatedItems.forEach((item) => {
      item.style.transform = `translateX(-${this.currentIndex * this.slideWidth}px)`;
    });
  }

  dispose() {
    gsap
      .to(this.main, {
        opacity: 0,
        duration: 1,
        ease: "power2.inOut",
      })
      .then(() => {
        gsap.to(this.main, {
          display: "none",
        });
      });

    // Clean up event listeners or other resources if needed
    const nextArrow = document.querySelector(".arrow.next");
    const prevArrow = document.querySelector(".arrow.prev");

    if (nextArrow) {
      nextArrow.removeEventListener("click", this.nextSlide);
    }
    if (prevArrow) {
      prevArrow.removeEventListener("click", this.prevSlide);
    }
  }

  update(step) {
    if (step === 1) {
      this.show();
    } else {
      this.dispose();
    }
  }

  show() {
    gsap
      .to(this.main, {
        display: "flex",
      })
      .then(() => {
        gsap.to(this.main, {
          opacity: 1,
          duration: 1,
          delay: 2,
          ease: "power2.inOut",
        });
      });

    this.addEventListeners();
  }

  render(t) {}

  resize() {}

  setDebug(debug) {}
}
