import { createApp } from "vue";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";
import { persistQueryClient } from "@tanstack/query-persist-client-core";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import localforage from "localforage";
import "./style.css";
import App from "./App.vue";

const app = createApp(App);

// Configure localforage to use IndexedDB
localforage.config({
  name: "FinanceTrackerDB",
  storeName: "query_cache",
  driver: localforage.INDEXEDDB,
});

// Create the persister using localforage
const asyncStoragePersister = createAsyncStoragePersister({
  storage: localforage,
});

// Create a standalone QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24 * 7, // Keep cache for 7 days (offline viewing)
      staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
      refetchOnWindowFocus: true, // Refetch when app comes back to foreground
      refetchOnReconnect: true, // Refetch on network reconnect
      retry: 1,
    },
  },
});

// Attach the persister to the QueryClient
persistQueryClient({
  queryClient,
  persister: asyncStoragePersister,
  maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
});

// Use the configured QueryClient in the Vue plugin
app.use(VueQueryPlugin, { queryClient });

app.mount("#app");
