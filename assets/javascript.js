document.addEventListener("DOMContentLoaded", () => {
  const themeToggleButton = document.getElementById("themeToggle");
  const THEME_STORAGE_KEY = "portfolio-theme";

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
  };

  // Khởi tạo theme ưu tiên giá trị đã lưu, nếu chưa có thì theo hệ điều hành.
  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  const prefersLight = window.matchMedia(
    "(prefers-color-scheme: light)",
  ).matches;
  const initialTheme = savedTheme || (prefersLight ? "light" : "dark");
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
      threshold: 0.2,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealElements.forEach((element) => observer.observe(element));
});
