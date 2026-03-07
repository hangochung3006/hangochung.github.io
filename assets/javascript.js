document.addEventListener("DOMContentLoaded", () => {
  const themeToggleButton = document.getElementById("themeToggle");
  const musicToggleButton = document.getElementById("musicToggle");
  const backgroundMusic = document.getElementById("backgroundMusic");
  const cyberpunkBgVideo = document.getElementById("cyberpunkBg");
  const THEME_STORAGE_KEY = "portfolio-theme";
  let isMusicPlaying = false;

  // Theme và cập nhật giao diện nút theo trạng thái hiện tại.
  const applyTheme = (theme) => {
    const isLight = theme === "light";
    document.body.classList.toggle("light-mode", isLight);

    if (!themeToggleButton) {
      return;
    }

    const icon = themeToggleButton.querySelector("i");
    const label = themeToggleButton.querySelector("span");

    themeToggleButton.setAttribute("aria-pressed", isLight ? "true" : "false");

    if (icon) {
      icon.className = isLight ? "bi bi-moon-stars-fill" : "bi bi-sun-fill";
    }

    if (label) {
      label.textContent = isLight ? "Đang: Sáng" : "Đang: Tối";
    }

    // Chỉ chạy video nền ở dark mode để tối ưu tài nguyên.
    if (cyberpunkBgVideo) {
      if (isLight) {
        cyberpunkBgVideo.pause();
      } else {
        cyberpunkBgVideo.play().catch(() => {});
      }
    }

    // Nhạc chỉ phát và chỉ hiển thị trạng thái khi ở dark mode.
    if (isLight && backgroundMusic) {
      backgroundMusic.pause();
      isMusicPlaying = false;
      if (musicToggleButton) {
        musicToggleButton.classList.remove("is-playing");
        musicToggleButton.setAttribute("aria-pressed", "false");
        musicToggleButton.setAttribute("aria-label", "Bật nhạc nền");
        const icon = musicToggleButton.querySelector("i");
        if (icon) {
          icon.className = "bi bi-music-note-beamed";
        }
      }
    }
  };

  // Khởi tạo theme: người dùng lần đầu luôn ở light mode.
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  const initialTheme = savedTheme || "light";
  applyTheme(initialTheme);

  if (themeToggleButton) {
    themeToggleButton.addEventListener("click", () => {
      const nextTheme = document.body.classList.contains("light-mode")
        ? "dark"
        : "light";
      applyTheme(nextTheme);
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    });
  }

  // Điều khiển nhạc nền (không autoplay để tránh bị browser chặn).
  if (musicToggleButton && backgroundMusic) {
    musicToggleButton.addEventListener("click", async () => {
      if (document.body.classList.contains("light-mode")) {
        return;
      }

      if (isMusicPlaying) {
        backgroundMusic.pause();
        isMusicPlaying = false;
        musicToggleButton.classList.remove("is-playing");
        musicToggleButton.setAttribute("aria-pressed", "false");
        musicToggleButton.setAttribute("aria-label", "Bật nhạc nền");
        const icon = musicToggleButton.querySelector("i");
        if (icon) {
          icon.className = "bi bi-music-note-beamed";
        }
        return;
      }

      try {
        await backgroundMusic.play();
        isMusicPlaying = true;
        musicToggleButton.classList.add("is-playing");
        musicToggleButton.setAttribute("aria-pressed", "true");
        musicToggleButton.setAttribute("aria-label", "Tắt nhạc nền");
        const icon = musicToggleButton.querySelector("i");
        if (icon) {
          icon.className = "bi bi-pause-fill";
        }
      } catch {
        isMusicPlaying = false;
      }
    });
  }

  const normalizeText = (text) => text.replace(/\s+/g, " ").trim().toLowerCase();

  // Tạo các khối accordion cho phần mô tả kinh nghiệm dài mà không thay đổi nội dung text gốc.
  // Ưu tiên id, nếu id bị gắn nhầm thì fallback theo tiêu đề section.
  const getWorkExperienceSection = () => {
    const byId = document.getElementById("work-experience");
    if (byId && byId.querySelector(".timeline")) {
      return byId;
    }

    const sections = Array.from(document.querySelectorAll(".row-right"));
    return (
      sections.find((section) => {
        const heading = section.querySelector("h3");
        return normalizeText(heading?.textContent || "").includes("kinh nghiệm làm việc");
      }) || null
    );
  };

  const workExperienceSection = getWorkExperienceSection();

  const buildAccordionButton = () => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "accordion-toggle";
    button.innerHTML =
      '<span class="accordion-arrow">▼</span><span class="accordion-label">Xem chi tiết</span>';
    button.setAttribute("aria-expanded", "false");
    return button;
  };

  const setToggleState = (button, isOpen) => {
    const arrow = button.querySelector(".accordion-arrow");
    const label = button.querySelector(".accordion-label");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");

    if (arrow) {
      arrow.textContent = isOpen ? "▲" : "▼";
    }

    if (label) {
      label.textContent = isOpen ? "Thu gọn" : "Xem chi tiết";
    }
  };

  const setupSlideToggle = (button, panel) => {
    panel.style.maxHeight = "0px";
    panel.classList.remove("is-open");

    button.addEventListener("click", () => {
      const isOpen = panel.classList.contains("is-open");

      if (isOpen) {
        // Nếu panel đang mở với max-height không giới hạn, đưa về giá trị thực để đóng mượt.
        if (panel.style.maxHeight === "none") {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        }

        panel.style.maxHeight = `${panel.scrollHeight}px`;
        requestAnimationFrame(() => {
          panel.style.maxHeight = "0px";
          panel.classList.remove("is-open");
          setToggleState(button, false);
        });
        return;
      }

      panel.classList.add("is-open");
      panel.style.maxHeight = `${panel.scrollHeight}px`;
      setToggleState(button, true);
    });

    // Sau khi mở xong thì bỏ giới hạn chiều cao để tránh cắt nội dung dài.
    panel.addEventListener("transitionend", (event) => {
      if (event.propertyName !== "max-height") {
        return;
      }

      if (panel.classList.contains("is-open")) {
        panel.style.maxHeight = "none";
      }
    });
  };

  // Accordion cho từng dự án trong mục "Một số dự án cá nhân".
  const setupPersonalProjectAccordions = () => {
    if (!workExperienceSection) {
      return;
    }

    const personalProjectArticle = Array.from(
      workExperienceSection.querySelectorAll(".timeline-item .timeline-content"),
    ).find((content) => {
      const heading = content.querySelector(".row-infomation-item-knlv p");
      return normalizeText(heading?.textContent || "").includes("một số dự án cá nhân");
    });

    if (!personalProjectArticle) {
      return;
    }

    const projectLists = personalProjectArticle.querySelectorAll(":scope > ul");

    projectLists.forEach((list) => {
      if (list.dataset.accordionInitialized === "true") {
        return;
      }

      const heading = list.querySelector(":scope > strong");
      const detailItems = Array.from(list.querySelectorAll(":scope > li"));

      if (!heading || detailItems.length === 0) {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "accordion-group";
      list.parentNode.insertBefore(wrapper, list);

      heading.classList.add("accordion-heading");
      wrapper.appendChild(heading);

      const button = buildAccordionButton();
      const panel = document.createElement("div");
      panel.className = "accordion-panel-block";

      const detailList = document.createElement("ul");
      detailItems.forEach((item) => detailList.appendChild(item));

      wrapper.appendChild(button);
      wrapper.appendChild(panel);
      panel.appendChild(detailList);

      setupSlideToggle(button, panel);
      list.remove();
      list.dataset.accordionInitialized = "true";
    });
  };

  // Accordion theo từng đầu mục chính trong mốc "Sinh viên":
  // Các tiêu đề dự án luôn hiển thị, chỉ ẩn phần mô tả ngay sau mỗi tiêu đề.
  const setupStudentProjectsAccordion = () => {
    if (!workExperienceSection) {
      return;
    }

    const firstTimelineList = workExperienceSection.querySelector(
      ".timeline .timeline-item:first-child .timeline-content > ul",
    );

    if (!firstTimelineList) {
      return;
    }

    const listItems = Array.from(firstTimelineList.children).filter(
      (node) => node.tagName === "LI",
    );

    if (listItems.length < 2 || firstTimelineList.dataset.accordionInitialized === "true") {
      return;
    }

    const studentProjectTitleKeywords = [
      "website bán sách",
      "ứng dụng quản lý sinh viên",
      "website bán thiết bị công nghệ",
      "game đua xe 2d platformer",
      "đồ án tốt nghiệp: website xem phim trực tuyến tvchill",
    ].map(normalizeText);

    const isMainProjectTitleItem = (item) => {
      const normalizedTitle = normalizeText(item.textContent || "");
      const hasTitleTag = Boolean(item.querySelector("b, strong"));

      // Ưu tiên nhận diện các tiêu đề đầu mục có thẻ nhấn mạnh (b/strong),
      // tránh bắt nhầm các dòng mô tả có chứa cùng từ khóa.
      if (hasTitleTag) {
        return studentProjectTitleKeywords.some((keyword) =>
          normalizedTitle.includes(keyword),
        );
      }

      // Fallback khi không có thẻ b/strong: chỉ chấp nhận dòng ngắn, giống tiêu đề.
      const looksLikeShortTitle = normalizedTitle.length <= 120;
      return (
        looksLikeShortTitle &&
        studentProjectTitleKeywords.some((keyword) =>
          normalizedTitle.startsWith(keyword),
        )
      );
    };

    // Làm sạch dữ liệu chi tiết do HTML có thể chứa <li> lồng sai,
    // tránh sinh ra dòng bullet rỗng ở đầu mỗi accordion.
    const sanitizeDetailItems = (items) => {
      const sanitized = [];

      items.forEach((item) => {
        const nestedLis = Array.from(item.querySelectorAll(":scope > li"));
        const hasNestedLis = nestedLis.length > 0;

        if (hasNestedLis) {
          nestedLis.forEach((nestedItem) => {
            const text = normalizeText(nestedItem.textContent || "");
            if (text.length > 0) {
              sanitized.push(nestedItem);
            }
          });
          item.remove();
          return;
        }

        const text = normalizeText(item.textContent || "");
        if (text.length > 0) {
          sanitized.push(item);
        } else {
          item.remove();
        }
      });

      return sanitized;
    };

    const mainProjectIndices = listItems
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => isMainProjectTitleItem(item))
      .map(({ index }) => index);

    mainProjectIndices.forEach((startIndex, groupIndex) => {
      const titleItem = listItems[startIndex];
      const nextStartIndex = mainProjectIndices[groupIndex + 1] ?? listItems.length;
      const rawDetailItems = listItems.slice(startIndex + 1, nextStartIndex);
      const detailItems = sanitizeDetailItems(rawDetailItems);

      if (
        !titleItem ||
        titleItem.classList.contains("accordion-title-row") ||
        detailItems.length === 0
      ) {
        return;
      }

      const button = buildAccordionButton();
      const panelItem = document.createElement("li");
      const panelList = document.createElement("ul");

      titleItem.classList.add("accordion-title-row", "project-main-item");
      panelItem.className = "accordion-panel";
      panelList.className = "accordion-inner-list";

      detailItems.forEach((item) => panelList.appendChild(item));
      panelItem.appendChild(panelList);
      titleItem.appendChild(button);

      firstTimelineList.insertBefore(panelItem, titleItem.nextSibling);
      setupSlideToggle(button, panelItem);
    });

    firstTimelineList.dataset.accordionInitialized = "true";
  };

  const setupLongDescriptionAccordions = () => {
    if (!workExperienceSection) {
      return;
    }

    const timelineLists = workExperienceSection.querySelectorAll(
      ".timeline .timeline-content > ul",
    );

    timelineLists.forEach((list) => {
      // Bỏ qua danh sách đã tách accordion theo cặp tiêu đề/chi tiết.
      if (list.querySelector(":scope > li.accordion-title-row")) {
        return;
      }

      const textLength = normalizeText(list.textContent || "").length;
      const listItemCount = list.querySelectorAll(":scope > li").length;
      const heading = list.querySelector(":scope > strong");
      const hasImage = Boolean(list.querySelector("img"));
      const shouldCollapse = !hasImage && (textLength > 280 || listItemCount >= 6);

      if (!shouldCollapse || list.dataset.accordionInitialized === "true") {
        return;
      }

      const wrapper = document.createElement("div");
      wrapper.className = "accordion-group";

      list.parentNode.insertBefore(wrapper, list);

      const button = buildAccordionButton();
      const panel = document.createElement("div");
      panel.className = "accordion-panel-block";

      wrapper.appendChild(button);
      wrapper.appendChild(panel);
      panel.appendChild(list);

      setupSlideToggle(button, panel);
      list.dataset.accordionInitialized = "true";
    });
  };

  // Lightbox cho ảnh trong phần danh hiệu/giải thưởng.
  const setupImageLightbox = () => {
    const images = document.querySelectorAll("#work-experience .timeline-content img");
    if (!images.length) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "image-lightbox";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = `
      <div class="lightbox-content" role="dialog" aria-modal="true" aria-label="Xem ảnh lớn">
        <button type="button" class="lightbox-close" aria-label="Đóng ảnh">X</button>
        <img class="lightbox-image" alt="" />
      </div>
    `;

    document.body.appendChild(overlay);

    const closeButton = overlay.querySelector(".lightbox-close");
    const lightboxImage = overlay.querySelector(".lightbox-image");
    const content = overlay.querySelector(".lightbox-content");

    const closeLightbox = () => {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("lightbox-open");
    };

    const openLightbox = (image) => {
      if (!lightboxImage) {
        return;
      }

      lightboxImage.src = image.currentSrc || image.src;
      lightboxImage.alt = image.alt || "Ảnh phóng to";
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("lightbox-open");
    };

    images.forEach((image) => {
      image.classList.add("lightbox-trigger");
      image.addEventListener("click", () => openLightbox(image));
    });

    if (closeButton) {
      closeButton.addEventListener("click", closeLightbox);
    }

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeLightbox();
      }
    });

    if (content) {
      content.addEventListener("click", (event) => event.stopPropagation());
    }

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  };

  setupStudentProjectsAccordion();
  setupPersonalProjectAccordions();
  setupLongDescriptionAccordions();
  setupImageLightbox();

  // Parallax nhẹ cho nền vũ trụ, ưu tiên hiệu năng.
  const setupCosmicParallax = () => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      return;
    }

    const root = document.body;
    let ticking = false;

    const updateByPointer = (event) => {
      const xRatio = event.clientX / window.innerWidth - 0.5;
      const yRatio = event.clientY / window.innerHeight - 0.5;
      root.style.setProperty("--parallax-x", `${(xRatio * 12).toFixed(2)}px`);
      root.style.setProperty("--parallax-y", `${(yRatio * 10).toFixed(2)}px`);
    };

    const updateByScroll = () => {
      root.style.setProperty("--scroll-shift", `${(-window.scrollY * 0.06).toFixed(2)}px`);
      ticking = false;
    };

    window.addEventListener("mousemove", updateByPointer, { passive: true });
    window.addEventListener(
      "scroll",
      () => {
        if (ticking) {
          return;
        }
        ticking = true;
        window.requestAnimationFrame(updateByScroll);
      },
      { passive: true },
    );
  };

  // Tạo độ trễ nhẹ theo thứ tự xuất hiện để animation tự nhiên hơn.
  const setupRevealStagger = () => {
    const timelineRevealItems = document.querySelectorAll(".timeline-item.reveal");
    timelineRevealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 70, 350)}ms`;
    });

    const sectionRevealItems = document.querySelectorAll(
      ".col-right > .row-right.reveal, .col-left .reveal",
    );
    sectionRevealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 50, 250)}ms`;
    });
  };

  setupCosmicParallax();
  setupRevealStagger();

  // Kích hoạt hiệu ứng xuất hiện cho ảnh đại diện sau khi trang sẵn sàng.
  const avatar = document.querySelector(".row-img");
  if (avatar) {
    requestAnimationFrame(() => {
      avatar.classList.add("is-visible");
    });
  }

  const revealElements = document.querySelectorAll(".reveal");
  const progressBars = document.querySelectorAll(
    ".skill-progress span[data-progress]",
  );

  // Hàm chạy animation chiều rộng cho thanh kỹ năng.
  const animateProgressBars = () => {
    progressBars.forEach((bar) => {
      if (bar.dataset.animated === "true") {
        return;
      }

      const value = Number.parseInt(bar.dataset.progress || "0", 10);
      const safeValue = Number.isNaN(value)
        ? 0
        : Math.min(100, Math.max(0, value));
      bar.style.width = `${safeValue}%`;
      bar.dataset.animated = "true";
    });
  };

  // Dùng IntersectionObserver để tạo hiệu ứng fade-in khi người dùng cuộn trang.
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-show");

        // Chạy progress bar khi section chứa kỹ năng xuất hiện.
        if (entry.target.querySelector(".skill-progress")) {
          animateProgressBars();
        }

        obs.unobserve(entry.target);
      });
    },
    {
      // Dùng threshold thấp để section dài vẫn kích hoạt reveal.
      threshold: 0.01,
      rootMargin: "0px 0px -8% 0px",
    },
  );

  revealElements.forEach((element) => {
    observer.observe(element);

    // Mở sẵn các phần đã nằm trong khung nhìn để tránh bị ẩn nhầm.
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight * 0.95) {
      element.classList.add("is-show");
    }
  });
});
