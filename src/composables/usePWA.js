import { ref } from "vue";

const deferredPrompt = ref(null);
const isInstallable = ref(false);

// Listen to the beforeinstallprompt event globally
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt.value = e;
    // Update UI to notify the user they can install the PWA
    isInstallable.value = true;
  });

  // Listen to successful installation
  window.addEventListener("appinstalled", () => {
    deferredPrompt.value = null;
    isInstallable.value = false;
  });
}

export function usePWA() {
  const promptInstall = async () => {
    if (!deferredPrompt.value) {
      return;
    }

    // Show the install prompt
    deferredPrompt.value.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.value.userChoice;

    // Check if the user accepted the prompt
    if (outcome === "accepted") {
      deferredPrompt.value = null;
      isInstallable.value = false;
    }
  };

  return {
    isInstallable,
    promptInstall,
  };
}
