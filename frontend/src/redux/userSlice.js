import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    authLoading: true,
    authChecked: false,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },
    setAuthChecked: (state, action) => {
      state.authChecked = action.payload;
    },
  },
});

export const { setUserData, setAuthLoading, setAuthChecked } = userSlice.actions;
export default userSlice.reducer;
