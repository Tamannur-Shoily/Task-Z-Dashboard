/* =========================================
   TaskEase Dashboard JavaScript
========================================= */

document.addEventListener("DOMContentLoaded", () => {

  function renderIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  renderIcons();

  const sidebar = document.getElementById("sidebar");
  const menuButton = document.getElementById("menuButton");
  const backdrop = document.getElementById("sidebarBackdrop");
  const toast = document.getElementById("toast");

  // Toast notifications
  let toastTimer;

  function showToast(message) {
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("visible");
    }, 2600);
  }

  document.querySelectorAll("[data-notice]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      showToast(button.dataset.notice);
    });
  });

  // Mobile sidebar
  function openSidebar() {
    sidebar.classList.add("open");
    backdrop.classList.add("visible");
    menuButton.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  }

  function closeSidebar() {
    sidebar.classList.remove("open");
    backdrop.classList.remove("visible");
    menuButton.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  }

  menuButton?.addEventListener("click", () => {
    if (sidebar.classList.contains("open")) {
      closeSidebar();
    } else {
      openSidebar();
    }
  });

  backdrop?.addEventListener("click", closeSidebar);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeSidebar();
      closeProfileMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 850) {
      closeSidebar();
    }
  });

  // Profile dropdown
  const profileButton = document.getElementById("profileButton");
  const profileMenu = document.getElementById("profileMenu");

  function closeProfileMenu() {
    if (!profileMenu || !profileButton) return;

    profileMenu.hidden = true;
    profileButton.setAttribute("aria-expanded", "false");
  }

  profileButton?.addEventListener("click", (event) => {
    event.stopPropagation();

    const isOpening = profileMenu.hidden;
    profileMenu.hidden = !isOpening;
    profileButton.setAttribute("aria-expanded", String(isOpening));
  });

  document.addEventListener("click", (event) => {
    if (
      profileMenu &&
      !profileMenu.hidden &&
      !profileMenu.contains(event.target) &&
      !profileButton.contains(event.target)
    ) {
      closeProfileMenu();
    }
  });

  document.getElementById("profileSettings")?.addEventListener("click", () => {
    closeProfileMenu();
    showToast("Account settings are ready to be connected.");
  });

  document.getElementById("logoutButton")?.addEventListener("click", () => {
    showToast("Logout is a demo action. No account was signed out.");
  });

  // Sidebar navigation
  const pageTitle = document.getElementById("pageTitle");
  const pageSubtitle = document.getElementById("pageSubtitle");

  const pageDescriptions = {
    Dashboard: "Track, manage and accomplish your tasks and projects.",
    Tasks: "Organize your tasks and keep track of your progress.",
    Team: "Collaborate with your team and manage team members.",
    Projects: "Plan, organize and track your projects.",
    Reports: "Review your task progress and working hours.",
    Calendar: "Keep track of meetings, deadlines and upcoming tasks.",
    Settings: "Manage your workspace preferences.",
    Help: "Find help and learn how to use TaskEase."
  };

  document.querySelectorAll(".nav-item, .see-all[data-page]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const page = link.dataset.page;
      if (!page) return;

      event.preventDefault();

      document.querySelectorAll(".nav-item").forEach((item) => {
        item.classList.toggle("active", item.dataset.page === page);
      });

      pageTitle.textContent = page;
      pageSubtitle.textContent = pageDescriptions[page] || "";

      // Keep the dashboard preview available for every navigation item 

      if (page !== "Dashboard") {
        showToast(`${page} selected. This is a dashboard preview.`);
      }

      closeSidebar();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  // Search: filters project cards and summary cards
  const searchInputs = [
    document.getElementById("searchInput"),
    document.getElementById("mobileSearchInput")
  ].filter(Boolean);

  function performSearch(value) {
    const query = value.trim().toLowerCase();
    let visibleItems = 0;

    document.querySelectorAll("[data-search]").forEach((item) => {
      const text = (
        item.dataset.search + " " + item.textContent
      ).toLowerCase();

      const matches = !query || text.includes(query);
      item.hidden = !matches;

      if (matches) visibleItems++;
    });

    // Hide section headings when every card in that section is filtered out 

    document.querySelectorAll(".section-block").forEach((section) => {
      const searchableItems = section.querySelectorAll("[data-search]");

      if (!searchableItems.length) {
        section.hidden = false;
        return;
      }

      const hasVisibleItem = Array.from(searchableItems).some(
        (item) => !item.hidden
      );

      section.hidden = !hasVisibleItem;
    });

    let emptyMessage = document.getElementById("searchEmptyMessage");

    if (!emptyMessage) {
      emptyMessage = document.createElement("div");
      emptyMessage.id = "searchEmptyMessage";
      emptyMessage.className = "no-results";
      emptyMessage.textContent = "No matching tasks or projects found.";
      emptyMessage.hidden = true;

      document.querySelector(".primary-column").appendChild(emptyMessage);
    }

    emptyMessage.hidden = !query || visibleItems > 0;
  }

  searchInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const value = input.value;

      searchInputs.forEach((otherInput) => {
        if (otherInput !== input) otherInput.value = value;
      });

      performSearch(value);
    });

    input.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        input.value = "";
        searchInputs.forEach((otherInput) => {
          otherInput.value = "";
        });
        performSearch("");
      }
    });
  });

  // Task completion
  const taskList = document.getElementById("taskList");
  const taskCount = document.getElementById("taskCount");

  function updateTaskCount() {
    const tasks = Array.from(taskList.querySelectorAll(".task-item"));
    const completedTasks = tasks.filter(
      (task) => task.querySelector('input[type="checkbox"]').checked
    ).length;

    taskCount.textContent = `${completedTasks} of ${tasks.length} done`;
  }

  taskList?.addEventListener("change", (event) => {
    if (!event.target.matches('input[type="checkbox"]')) return;

    const task = event.target.closest(".task-item");
    task.classList.toggle("completed", event.target.checked);

    updateTaskCount();

    const taskName = task.querySelector(".task-name").textContent;

    showToast(
      event.target.checked
        ? `"${taskName}" marked complete.`
        : `"${taskName}" marked incomplete.`
    );
  });

  updateTaskCount();

  // Interactive calendar
  const calendarDays = document.getElementById("calendarDays");
  const monthLabel = document.getElementById("monthLabel");
  const prevMonth = document.getElementById("prevMonth");
  const nextMonth = document.getElementById("nextMonth");


  let displayedDate = new Date(2023, 9, 1);
  let selectedDate = new Date(2023, 9, 1);

  const monthFormatter = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  });

  function sameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }

  function renderCalendar() {
    const year = displayedDate.getFullYear();
    const month = displayedDate.getMonth();

    monthLabel.textContent = monthFormatter.format(displayedDate);
    calendarDays.innerHTML = "";

    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();

    // Show six weeks where necessary; otherwise use the needed rows.
    const totalCells = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

    for (let index = 0; index < totalCells; index++) {
      let day;
      let date;
      let isOutsideMonth = false;

      if (index < firstWeekday) {
        day = daysInPreviousMonth - firstWeekday + index + 1;
        date = new Date(year, month - 1, day);
        isOutsideMonth = true;
      } else if (index >= firstWeekday + daysInMonth) {
        day = index - firstWeekday - daysInMonth + 1;
        date = new Date(year, month + 1, day);
        isOutsideMonth = true;
      } else {
        day = index - firstWeekday + 1;
        date = new Date(year, month, day);
      }

      const button = document.createElement("button");
      button.type = "button";
      button.className = "calendar-day";
      button.setAttribute("aria-label", date.toDateString());

      if (isOutsideMonth) button.classList.add("muted");
      if (sameDay(date, selectedDate)) button.classList.add("selected");

      const today = new Date();

      if (sameDay(date, today)) {
        button.classList.add("today");
      }

      const dayNumber = document.createElement("span");
      dayNumber.textContent = day;
      button.appendChild(dayNumber);

      // Small event dots 

      if (!isOutsideMonth && [1, 5, 12, 18, 24].includes(day)) {
        const marker = document.createElement("small");
        marker.textContent = day === 1 ? "" : "•";
        marker.style.color = sameDay(date, selectedDate)
          ? "white"
          : "#0ca995";

        if (marker.textContent) button.appendChild(marker);
      }

      button.addEventListener("click", () => {
        selectedDate = date;
        displayedDate = new Date(date.getFullYear(), date.getMonth(), 1);
        renderCalendar();

        showToast(
          `Selected ${date.toLocaleDateString("en", {
            month: "long",
            day: "numeric",
            year: "numeric"
          })}.`
        );
      });

      calendarDays.appendChild(button);
    }
  }

  prevMonth?.addEventListener("click", () => {
    displayedDate = new Date(
      displayedDate.getFullYear(),
      displayedDate.getMonth() - 1,
      1
    );
    renderCalendar();
  });

  nextMonth?.addEventListener("click", () => {
    displayedDate = new Date(
      displayedDate.getFullYear(),
      displayedDate.getMonth() + 1,
      1
    );
    renderCalendar();
  });

  renderCalendar();

  // Keyboard shortcut: "/" focuses search 
  
  document.addEventListener("keydown", (event) => {
    const tagName = document.activeElement?.tagName;
    const isTyping =
      tagName === "INPUT" ||
      tagName === "TEXTAREA" ||
      document.activeElement?.isContentEditable;

    if (event.key === "/" && !isTyping) {
      event.preventDefault();

      const visibleSearch =
        window.innerWidth <= 560
          ? document.getElementById("mobileSearchInput")
          : document.getElementById("searchInput");

      visibleSearch?.focus();
    }
  });
});
