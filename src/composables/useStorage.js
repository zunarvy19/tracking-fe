import { ref, computed, onMounted, onUnmounted } from "vue";
import { useQueryClient } from "@tanstack/vue-query";
import localforage from "localforage";

const LAST_SYNCED_KEY = "financetracker_last_synced";

function formatBytes(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatTimeAgo(date) {
  if (!date) return "Never";
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 10) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function useStorage() {
  const queryClient = useQueryClient();

  // ─── Storage Usage ──────────────────────────────────────────────────────────
  const storageUsage = ref({ used: 0, quota: 0, percent: 0 });
  const cacheEntries = ref(0);
  const cacheSize = ref("0 B");

  async function refreshStorageStats() {
    // Overall browser storage estimate
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const quota = estimate.quota || 0;
      storageUsage.value = {
        used,
        quota,
        percent: quota > 0 ? Math.round((used / quota) * 10000) / 100 : 0,
      };
    }

    // Count localforage entries & estimate size
    try {
      const keys = await localforage.keys();
      cacheEntries.value = keys.length;

      let totalSize = 0;
      for (const key of keys) {
        const item = await localforage.getItem(key);
        if (item !== null) {
          totalSize += new Blob([JSON.stringify(item)]).size;
        }
      }
      cacheSize.value = formatBytes(totalSize);
    } catch {
      cacheEntries.value = 0;
      cacheSize.value = "0 B";
    }
  }

  // ─── Online / Offline ───────────────────────────────────────────────────────
  const isOnline = ref(navigator.onLine);

  function handleOnline() {
    isOnline.value = true;
  }
  function handleOffline() {
    isOnline.value = false;
  }

  // ─── Sync Tracking ─────────────────────────────────────────────────────────
  const isSyncing = ref(false);

  const lastSyncedRaw = ref(null);
  // Re-compute timeAgo every render (it's cheap)
  const timeAgo = computed(() => formatTimeAgo(lastSyncedRaw.value));

  function loadLastSynced() {
    const stored = localStorage.getItem(LAST_SYNCED_KEY);
    if (stored) {
      lastSyncedRaw.value = new Date(stored);
    }
  }

  function saveLastSynced() {
    const now = new Date();
    lastSyncedRaw.value = now;
    localStorage.setItem(LAST_SYNCED_KEY, now.toISOString());
  }

  async function forceSyncAll() {
    if (isSyncing.value) return;
    isSyncing.value = true;
    try {
      await queryClient.invalidateQueries();
      // Wait a tick for refetches to kick off
      await queryClient.refetchQueries();
      saveLastSynced();
      await refreshStorageStats();
    } finally {
      isSyncing.value = false;
    }
  }

  async function clearCache() {
    try {
      await localforage.clear();
      queryClient.clear();
      localStorage.removeItem(LAST_SYNCED_KEY);
      lastSyncedRaw.value = null;
      await refreshStorageStats();
    } catch (e) {
      console.error("Failed to clear cache:", e);
    }
  }

  // ─── Lifecycle ──────────────────────────────────────────────────────────────
  let timeAgoInterval = null;

  onMounted(() => {
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    loadLastSynced();
    refreshStorageStats();

    // Tick the timeAgo display every 30s
    timeAgoInterval = setInterval(() => {
      // Force re-evaluation by touching the ref
      if (lastSyncedRaw.value) {
        lastSyncedRaw.value = new Date(lastSyncedRaw.value.getTime());
      }
    }, 30_000);
  });

  onUnmounted(() => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
    if (timeAgoInterval) clearInterval(timeAgoInterval);
  });

  return {
    // Storage
    storageUsage,
    cacheEntries,
    cacheSize,
    refreshStorageStats,

    // Connectivity
    isOnline,

    // Sync
    lastSynced: lastSyncedRaw,
    timeAgo,
    isSyncing,
    forceSyncAll,

    // Cache management
    clearCache,
  };
}
