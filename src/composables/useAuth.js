import { computed } from "vue";
import { authClient } from "../lib/auth-client.js";

export function useAuth() {
  const session = authClient.useSession();

  const isAuthenticated = computed(() => !!session.value?.data?.user);
  const user = computed(() => session.value?.data?.user || null);
  const isLoading = computed(() => session.value?.isPending ?? true);

  async function signIn(email, password) {
    try {
      const result = await authClient.signIn.email({ email, password });
      return result;
    } catch (e) {
      return { error: { message: e.message || "Sign in failed" } };
    }
  }

  async function signUp(email, password, name) {
    try {
      const result = await authClient.signUp.email({ email, password, name });
      return result;
    } catch (e) {
      return { error: { message: e.message || "Sign up failed" } };
    }
  }

  async function signOut() {
    try {
      return await authClient.signOut();
    } catch (e) {
      return { error: { message: e.message || "Sign out failed" } };
    }
  }

  return {
    session,
    isAuthenticated,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
  };
}
