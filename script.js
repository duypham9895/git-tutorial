// Modern JavaScript with performance optimizations and better practices

// Constants for better maintainability
const ANIMATION_DURATION = 300;
const DEMO_STEP_DELAY = 2000;
const DEBOUNCE_DELAY = 100;
const SCROLL_DURATION = 500; // Duration for smooth scrolling animation

// Cache DOM elements for better performance
const elements = {
  modal: null,
  modalText: null,
  workflowExplanation: null,
  workflowButtons: null,
  gitDiagram: null,
  init() {
    this.modal = document.getElementById("modal");
    this.modalText = document.getElementById("modal-text");
    this.workflowExplanation = document.getElementById("workflow-explanation");
    this.workflowButtons = document.querySelectorAll(".workflow-btn");
    this.gitDiagram = document.querySelector(".git-diagram");
  },
};

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  elements.init();
  initializeAccessibility();
  initializeKeyboardNavigation();
  initializeMobileOptimizations();
});

// Mobile-specific optimizations
function initializeMobileOptimizations() {
  if (window.innerWidth <= 768) {
    // Add mobile-specific event listeners
    const workflowButtons = document.querySelectorAll(".workflow-btn");
    workflowButtons.forEach((button) => {
      button.addEventListener("touchstart", function (e) {
        this.style.transform = "scale(0.98)";
      });

      button.addEventListener("touchend", function (e) {
        this.style.transform = "";
      });
    });

    // Ensure git diagram is properly set up for mobile scrolling
    if (elements.gitDiagram) {
      elements.gitDiagram.style.overflowX = "auto";
      elements.gitDiagram.style.webkitOverflowScrolling = "touch";
    }
  }
}

// Debounce utility function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Auto-scroll functionality to ensure activated components are visible
function scrollToElement(elementId) {
  if (!elements.gitDiagram) {
    return;
  }

  const element = document.getElementById(elementId);
  if (!element) {
    return;
  }

  // Get the SVG element and its bounding box
  const svg = elements.gitDiagram.querySelector("svg");
  if (!svg) {
    return;
  }

  // Check if we're on mobile
  const isMobile = window.innerWidth <= 768;
  const containerRect = elements.gitDiagram.getBoundingClientRect();
  const containerWidth = containerRect.width;

  if (isMobile) {
    // Enhanced mobile scroll calculation for proper centering
    const svgScrollWidth = elements.gitDiagram.scrollWidth;
    const svgViewBoxWidth = 1300; // Total SVG width from viewBox

    // Component centers in SVG coordinates
    const componentCenters = {
      "working-dir": 150, // x=50 + width=200/2
      "staging-area": 450, // x=350 + width=200/2
      "local-repo": 750, // x=650 + width=200/2
      "remote-repo": 1050, // x=950 + width=200/2
    };

    const elementCenter = componentCenters[elementId];
    if (!elementCenter) {
      return;
    }

    // Calculate the scroll position to center the component
    // Scale the SVG coordinate to actual scroll coordinate
    const scaleRatio = svgScrollWidth / svgViewBoxWidth;
    const elementPositionInScroll = elementCenter * scaleRatio;

    // More conservative centering - don't scroll as far
    let targetScrollLeft = elementPositionInScroll - containerWidth / 2;

    // Reduce scrolling for better visibility of command arrows
    // Only add minimal offset for components after working directory
    if (elementId === "staging-area") {
      targetScrollLeft -= containerWidth * 0.1; // Scroll less to show "git add" arrow
    } else if (elementId === "local-repo") {
      targetScrollLeft -= containerWidth * 0.05; // Scroll less to show "git commit" arrow
    } else if (elementId === "remote-repo") {
      targetScrollLeft -= containerWidth * 0.05; // Scroll less to show "git push" arrow
    }

    // Ensure we don't scroll beyond boundaries
    const maxScrollLeft = Math.max(0, svgScrollWidth - containerWidth);
    const finalScrollLeft = Math.max(
      0,
      Math.min(targetScrollLeft, maxScrollLeft)
    );

    // Use both smooth scrolling methods for better compatibility
    if (elements.gitDiagram.scrollTo) {
      elements.gitDiagram.scrollTo({
        left: finalScrollLeft,
        behavior: "smooth",
      });
    } else {
      smoothScrollTo(elements.gitDiagram, finalScrollLeft);
    }
    return;
  }

  // Desktop calculation
  // Get element position within SVG
  const bbox = element.getBBox();

  // Calculate the center position of the element within the SVG
  const elementCenterX = bbox.x + bbox.width / 2;

  // Get SVG viewBox to calculate scaling
  const viewBox = svg.viewBox.baseVal;
  const svgWidth = viewBox.width || 1300; // Fallback width

  // Calculate the scroll position to center the element
  const scaleRatio = containerWidth / svgWidth;
  const elementPositionInContainer = elementCenterX * scaleRatio;
  let targetScrollLeft = elementPositionInContainer - containerWidth / 2;

  // Add extra padding for the rightmost component (Remote Repository)
  if (elementId === "remote-repo") {
    const extraPadding = containerWidth * 0.15;
    targetScrollLeft += extraPadding;
  }

  // Ensure we don't scroll beyond boundaries
  const maxScrollLeft = Math.max(
    0,
    elements.gitDiagram.scrollWidth - containerWidth
  );
  const finalScrollLeft = Math.max(
    0,
    Math.min(targetScrollLeft, maxScrollLeft)
  );

  // Smooth scroll to the calculated position
  smoothScrollTo(elements.gitDiagram, finalScrollLeft);
}

// Smooth scrolling animation function
function smoothScrollTo(container, targetScrollLeft) {
  const startScrollLeft = container.scrollLeft;
  const distance = targetScrollLeft - startScrollLeft;
  const startTime = performance.now();

  // Use shorter duration on mobile for better performance
  const isMobile = window.innerWidth <= 768;
  const duration = isMobile ? 300 : SCROLL_DURATION; // Faster on mobile

  function animateScroll(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Use simpler easing on mobile for better performance
    const easeOut = isMobile
      ? progress // Linear easing on mobile
      : 1 - Math.pow(1 - progress, 3); // Cubic ease-out on desktop

    container.scrollLeft = startScrollLeft + distance * easeOut;

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  }

  requestAnimationFrame(animateScroll);
}

// Enhanced step information with better UX
function showStepInfo(event, step) {
  const messages = {
    1: "Step 1: This is just like working on any document on your computer. Nothing special here - just edit your files like normal!",
    2: "Step 2: Instead of saving everything, you choose which files to save. It's like deciding which papers from your desk go into your filing tray.",
    3: "Step 3: Now you officially save your chosen files with a note about what you changed. Like putting a sticky note on your filed documents.",
    4: "Step 4: Finally, you share your saved work with your team. Like putting your filed documents in the shared office filing cabinet.",
  };

  // Add visual feedback
  const target = event.target;
  target.classList.add("wiggle");

  // Remove wiggle class after animation
  setTimeout(() => {
    target.classList.remove("wiggle");
  }, 500);

  // Show modal with improved accessibility
  showModal(messages[step]);
}

// Enhanced command explanation with better error handling
function explainCommand(event, command) {
  const explanations = {
    add: {
      title: "📋 git add - Choose Your Files",
      content:
        "This command tells Git: 'Hey, I want to save these specific files!' It's like putting documents in your inbox tray before filing them. The '.' means 'add ALL my changed files' - super convenient!",
    },
    commit: {
      title: "💾 git commit - Save Your Work",
      content:
        "This command saves your chosen files permanently with a description. It's like putting a label on your filed documents saying what you did. The '-m' part lets you write a message right in the command!",
    },
    push: {
      title: "☁️ git push - Share with Everyone",
      content:
        "This uploads your saved work to the shared repository (like GitHub). Now your teammates can see what you've done! It's like putting your filed documents in the office shared drive.",
    },
    pull: {
      title: "⬇️ git pull - Get Updates",
      content:
        "This downloads the latest changes from your teammates. Always do this before starting work! It's like checking the shared drive for new documents before you start working.",
    },
    status: {
      title: "🔍 git status - Check What's Happening",
      content:
        "This shows you exactly what's going on in your project! It tells you which files have changed, which are ready to save, and which are already saved. It's like looking at your desk to see what papers need attention.",
    },
    log: {
      title: "📜 git log - See Your Work History",
      content:
        "This shows you a list of all the work you've saved over time, with dates and descriptions. It's like looking through your filing cabinet to see all the documents you've filed and when you filed them.",
    },
    branch: {
      title: "🌿 git branch - Create a Separate Workspace",
      content:
        "This creates a new 'branch' - think of it like having a separate desk where you can work on a new feature without messing up your main work. You can experiment safely and merge it back later!",
    },
    merge: {
      title: "🔀 git merge - Combine Different Work",
      content:
        "This combines work from different branches together. It's like taking documents from your experimental desk and carefully organizing them into your main filing cabinet. Git helps make sure nothing gets lost!",
    },
  };

  const explanation = explanations[command];
  if (!explanation) {
    return;
  }

  // Add visual feedback
  const target = event.target;
  target.classList.add("wiggle");
  setTimeout(() => target.classList.remove("wiggle"), 500);

  // Show detailed explanation
  showModal(
    `<strong>${explanation.title}</strong><br><br>${explanation.content}`
  );
}

// Enhanced workflow animation with auto-scrolling
function animateWorkflow(step) {
  // Complete reset - ensure clean state
  resetHighlights();

  // Remove active class from ALL buttons
  elements.workflowButtons.forEach((btn) => btn.classList.remove("active"));

  const explanations = {
    edit: {
      text: "📝 You're editing files on your computer - just like working on any document! The file appears in your Working Directory.",
      highlight: ["working-dir"],
      showFiles: ["file-working"],
      arrows: [],
      button: "btn-edit",
      scrollTarget: "working-dir", // Element to scroll to
    },
    add: {
      text: "📋 'git add' moves your changed files to the Staging Area - like putting documents in your inbox tray before filing them!",
      highlight: ["staging-area"], // Only highlight destination
      showFiles: ["file-staging"], // Only show destination file
      arrows: ["arrow-add"],
      button: "btn-add",
      scrollTarget: "staging-area", // Element to scroll to
    },
    commit: {
      text: "💾 'git commit' saves your staged files permanently to your Local Repository - like filing documents in your personal cabinet with a label!",
      highlight: ["local-repo"], // Only highlight destination
      showFiles: ["file-local"], // Only show destination file
      arrows: ["arrow-commit"],
      button: "btn-commit",
      scrollTarget: "local-repo", // Element to scroll to
    },
    push: {
      text: "☁️ 'git push' uploads your committed files to the Remote Repository - like putting your filed documents in the shared office drive!",
      highlight: ["remote-repo"], // Only highlight destination
      showFiles: ["file-remote"], // Only show destination file
      arrows: ["arrow-push"],
      button: "btn-push",
      scrollTarget: "remote-repo", // Element to scroll to
    },
  };

  const config = explanations[step];
  if (!config) {
    return;
  }

  // Update explanation text first
  updateExplanationText(config.text);

  // Use mobile-optimized timing
  const isMobile = window.innerWidth <= 768;
  const scrollDelay = isMobile ? 50 : 100; // Faster on mobile
  const animationDelay = isMobile ? 100 : 150; // Faster on mobile

  // Auto-scroll to ensure the activated component is visible
  if (config.scrollTarget) {
    setTimeout(() => {
      scrollToElement(config.scrollTarget);
    }, scrollDelay);
  }

  // ONLY highlight the current step's areas (isolated)
  config.highlight.forEach((id, index) => {
    setTimeout(() => {
      highlightElement(id);
    }, (index + 1) * animationDelay);
  });

  // ONLY show the current step's files (isolated)
  config.showFiles.forEach((id, index) => {
    setTimeout(() => {
      showElement(id);
    }, (index + 2) * animationDelay);
  });

  // ONLY show the current step's arrows (isolated)
  config.arrows.forEach((id, index) => {
    setTimeout(() => {
      showArrowWithAnimation(id);
    }, (index + 3) * animationDelay);
  });

  // ONLY activate the current button
  const button = document.getElementById(config.button);
  if (button) {
    button.classList.add("active");
  }
}

// Optimized reset function
function resetHighlights() {
  // Reset all highlights
  const highlightElements = [
    "working-dir",
    "staging-area",
    "local-repo",
    "remote-repo",
  ];
  highlightElements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove("highlight");
      element.style.filter = "";
      element.style.transform = "";
    }
  });

  // Hide all files
  const fileElements = [
    "file-working",
    "file-staging",
    "file-local",
    "file-remote",
  ];
  fileElements.forEach((id) => hideElement(id));

  // Reset all arrow states and hide them
  resetArrowStates();
  const arrowElements = ["arrow-add", "arrow-commit", "arrow-push"];
  arrowElements.forEach((id) => hideElement(id));
}

// Enhanced reset workflow function
function resetWorkflow() {
  resetHighlights();

  // Remove active states from buttons
  elements.workflowButtons.forEach((btn) => btn.classList.remove("active"));

  // Reset explanation text
  updateExplanationText(
    "👆 Click the buttons above to see how your files move through Git!"
  );

  // Scroll to the first component (working directory) instead of center
  if (elements.gitDiagram) {
    // Scroll to the leftmost position to show the working directory
    smoothScrollTo(elements.gitDiagram, 0);
  }

  // Add visual feedback
  const resetBtn = document.querySelector(".reset-btn");
  if (resetBtn) {
    resetBtn.classList.add("wiggle");
    setTimeout(() => resetBtn.classList.remove("wiggle"), 500);
  }
}

// Improved demo function with better timing
let demoTimeout;
function playDemo() {
  // Clear any existing demo
  if (demoTimeout) {
    clearTimeout(demoTimeout);
  }

  resetWorkflow();

  const steps = ["edit", "add", "commit", "push"];
  let currentStep = 0;

  // Add visual feedback to demo button
  const demoBtn = document.querySelector(".demo-btn");
  if (demoBtn) {
    demoBtn.classList.add("wiggle");
    setTimeout(() => demoBtn.classList.remove("wiggle"), 500);
  }

  // Use longer delays on mobile to allow scroll animations to complete
  const isMobile = window.innerWidth <= 768;
  const stepDelay = isMobile ? 3000 : DEMO_STEP_DELAY; // 3 seconds on mobile, 2 seconds on desktop

  function runNextStep() {
    if (currentStep < steps.length) {
      animateWorkflow(steps[currentStep]);
      currentStep++;
      demoTimeout = setTimeout(runNextStep, stepDelay);
    } else {
      // Demo complete - add celebration
      updateExplanationText(
        "🎉 Demo complete! Now you understand the Git workflow. Try clicking the buttons yourself!"
      );
    }
  }

  // Start demo after a short delay
  setTimeout(runNextStep, 500);
}

// Enhanced encouragement function
function showEncouragement() {
  const encouragements = [
    "🎉 You've got this! Git is just like organizing files - you already know how to do that!",
    "🚀 Ready to become a Git master? Remember: edit → add → commit → push. That's it!",
    "💪 You're going to do great! Start small and practice these 4 commands. You'll be amazed how quickly you learn!",
    "🌟 Every expert was once a beginner. Take it one step at a time and don't be afraid to ask for help!",
    "🎯 Perfect! Remember: Git keeps everything safe, so you can't really break anything. Experiment and learn!",
  ];

  const randomEncouragement =
    encouragements[Math.floor(Math.random() * encouragements.length)];
  showModal(randomEncouragement);
}

// Utility functions for better code organization
function updateExplanationText(text) {
  if (elements.workflowExplanation) {
    const paragraph = elements.workflowExplanation.querySelector("p");
    if (paragraph) {
      paragraph.innerHTML = text;
      // Announce to screen readers
      paragraph.setAttribute("aria-live", "polite");
    }
  }
}

function highlightElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  element.classList.add("highlight");

  // Use mobile-optimized effects
  const isMobile = window.innerWidth <= 768;
  const scale = isMobile ? "scale(1.02)" : "scale(1.05)";
  const shadowIntensity = isMobile ? "0.6" : "0.8";

  element.style.filter = `drop-shadow(0 0 10px rgba(255, 255, 0, ${shadowIntensity}))`;
  element.style.transform = scale;
  element.style.transition = "all 0.3s ease";
}

function showElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  element.style.opacity = "1";
  element.style.transition = "opacity 0.5s ease";
  element.classList.add("fade-in");

  // Force a repaint to ensure the animation is visible
  // element.offsetHeight;
}

function hideElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  element.style.opacity = "0";
  element.classList.remove("fade-in", "pulse");
}

// Helper function to apply arrow styles
function applyArrowStyles(pathElement, textElement, color, colorRgba) {
  if (pathElement) {
    pathElement.style.stroke = color;
    pathElement.style.strokeWidth = "2px";
    pathElement.style.filter = `drop-shadow(0 0 3px ${colorRgba})`;
  }
  if (textElement) {
    textElement.style.fill = color;
    textElement.style.fontSize = "12px";
    textElement.style.filter = `drop-shadow(0 0 2px ${colorRgba})`;
  }
}

// Helper function to get arrow colors
function getArrowColors(id) {
  const colorMap = {
    "arrow-add": {
      color: "#00e676",
      rgba: "rgba(0, 230, 118, 0.8)",
      class: "arrow-add-active",
    },
    "arrow-commit": {
      color: "#00bcd4",
      rgba: "rgba(0, 188, 212, 0.8)",
      class: "arrow-commit-active",
    },
    "arrow-push": {
      color: "#ff1744",
      rgba: "rgba(255, 23, 68, 0.8)",
      class: "arrow-push-active",
    },
  };
  return colorMap[id];
}

function showArrowWithAnimation(id) {
  const element = document.getElementById(id);
  if (!element) {
    return;
  }

  // Ensure the element is visible first
  element.style.opacity = "1";
  element.style.transition = "all 0.5s ease";
  element.classList.add("pulse", "arrow-active");

  const pathElement = element.querySelector("path");
  const textElement = element.querySelector("text");
  const arrowConfig = getArrowColors(id);

  if (!arrowConfig) {
    return;
  }

  // Apply the specific arrow class
  element.classList.add(arrowConfig.class);

  // Apply styles directly for better mobile compatibility
  applyArrowStyles(
    pathElement,
    textElement,
    arrowConfig.color,
    arrowConfig.rgba
  );

  // Force repaint for mobile compatibility
  // element.offsetHeight;
}

// Enhanced function to reset arrow states
function resetArrowStates() {
  const arrowElements = ["arrow-add", "arrow-commit", "arrow-push"];
  arrowElements.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      // Remove all arrow-related classes
      element.classList.remove(
        "pulse",
        "arrow-active",
        "arrow-add-active",
        "arrow-commit-active",
        "arrow-push-active"
      );

      // Reset any inline styles that might interfere
      element.style.filter = "";
      element.style.transform = "";

      // Reset inline styles on path and text elements
      const pathElement = element.querySelector("path");
      const textElement = element.querySelector("text");

      if (pathElement) {
        pathElement.style.stroke = "";
        pathElement.style.strokeWidth = "";
        pathElement.style.filter = "";
      }

      if (textElement) {
        textElement.style.fill = "";
        textElement.style.fontSize = "";
        textElement.style.filter = "";
      }
    }
  });
}

// Enhanced modal functions with better accessibility
function showModal(content) {
  if (!elements.modal || !elements.modalText) {
    return;
  }

  elements.modalText.innerHTML = content;

  // Use style display instead of showModal() for better compatibility
  elements.modal.style.display = "flex";
  elements.modal.style.alignItems = "center";
  elements.modal.style.justifyContent = "center";

  // Focus management for accessibility
  const closeButton = elements.modal.querySelector(".modal-close");
  if (closeButton) {
    setTimeout(() => closeButton.focus(), 100);
  }

  // Close on escape key
  document.addEventListener("keydown", handleEscapeKey);

  // Close on backdrop click
  elements.modal.addEventListener("click", handleModalBackdropClick);
}

function closeModal() {
  if (!elements.modal) return;

  // Store current scroll position before closing modal
  const currentScrollX =
    window.pageXOffset || document.documentElement.scrollLeft;
  const currentScrollY =
    window.pageYOffset || document.documentElement.scrollTop;

  // Hide modal using style instead of close()
  elements.modal.style.display = "none";

  // Clean up event listeners
  document.removeEventListener("keydown", handleEscapeKey);
  elements.modal.removeEventListener("click", handleModalBackdropClick);

  // Return focus to the element that opened the modal WITHOUT scrolling
  const activeButton = document.querySelector(".workflow-btn.active");
  if (activeButton) {
    // Use preventScroll option to avoid jumping to the button
    activeButton.focus({ preventScroll: true });
  }

  // Restore the original scroll position
  window.scrollTo(currentScrollX, currentScrollY);
}

// Handle escape key to close modal
function handleEscapeKey(event) {
  if (event.key === "Escape") {
    closeModal();
  }
}

// Event handlers for modal
function handleModalBackdropClick(event) {
  if (event.target === elements.modal) {
    closeModal();
  }
}

// Accessibility improvements
function initializeAccessibility() {
  // Add ARIA labels to interactive elements
  const steps = document.querySelectorAll(".step");
  steps.forEach((step, index) => {
    step.setAttribute("role", "button");
    step.setAttribute("tabindex", "0");
    step.setAttribute("aria-label", `Learn about step ${index + 1}`);
  });

  const commandCards = document.querySelectorAll(".command-card");
  commandCards.forEach((card) => {
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
  });
}

// Keyboard navigation support
function initializeKeyboardNavigation() {
  // Handle Enter and Space key presses for interactive elements
  document.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      const target = event.target;

      if (target.classList.contains("step")) {
        event.preventDefault();
        const stepNumber =
          Array.from(target.parentNode.children).indexOf(target) + 1;
        showStepInfo(event, stepNumber);
      }

      if (target.classList.contains("command-card")) {
        event.preventDefault();
        const commandType = getCommandType(target);
        explainCommand(event, commandType);
      }

      if (target.classList.contains("big-button")) {
        event.preventDefault();
        showEncouragement();
      }
    }
  });
}

// Helper function to determine command type from card content
function getCommandType(commandCard) {
  const commandText = commandCard.querySelector(".command-text").textContent;

  if (commandText.includes("add")) return "add";
  if (commandText.includes("commit")) return "commit";
  if (commandText.includes("push")) return "push";
  if (commandText.includes("pull")) return "pull";
  if (commandText.includes("status")) return "status";
  if (commandText.includes("log")) return "log";
  if (commandText.includes("branch")) return "branch";
  if (commandText.includes("merge")) return "merge";

  // Fallback - return the command text itself if no match found
  return "add"; // Safe fallback
}

// Debounced resize handler for responsive adjustments
const handleResize = debounce(() => {
  const svg = document.querySelector(".git-diagram svg");
  if (svg && window.innerWidth < 768) {
    svg.style.minWidth = "800px";
  }
}, DEBOUNCE_DELAY);

window.addEventListener("resize", handleResize);

// Export functions for testing (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    showStepInfo,
    explainCommand,
    animateWorkflow,
    resetWorkflow,
    playDemo,
    showEncouragement,
  };
}
