import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface UserInfo {
  email?: string;
  name?: string;
}

interface UserState {
  userInfo: UserInfo | null;
  setUserInfo: (userInfo: UserInfo | null) => void;
}

const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      userInfo: null,
      
      setUserInfo(userInfo: UserInfo | null) {
        set({ userInfo });
      },
     
    }),
    {
      name: "x-user-storage",
      version: 0,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useUserStore;
