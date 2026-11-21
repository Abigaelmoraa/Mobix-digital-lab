import { authApi } from "@/lib/api";

export async function claimFirstAdmin() {
  return authApi.claimAdmin();
}
