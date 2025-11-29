import { createSlice } from "@reduxjs/toolkit";

const reviewSlice = createSlice({
  name: "review",
  initialState: {
    reviewData: [],
  },
  reducers: {
    setReviewData: (state, action) => {
      state.reviewData = action.payload;
    },
  },
});
export const { setReviewData } = reviewSlice.actions;
export default reviewSlice.reducer;
