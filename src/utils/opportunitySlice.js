import { createSlice } from "@reduxjs/toolkit";

/**
 * opportunity state shape:
 * {
 *   list:   [...all opportunities shown in CollabHub],
 *   myList: [...opportunities posted by the logged-in user (for Profile page)],
 * }
 */
const opportunitySlice = createSlice({
  name: "opportunity",
  initialState: {
    list:   [],
    myList: [],
  },
  reducers: {
    // Replace the full list (on fresh fetch / filter change)
    setOpportunities: (state, action) => {
      state.list = action.payload;
    },
    // Append to list (load more / pagination)
    appendOpportunities: (state, action) => {
      state.list = [...state.list, ...action.payload];
    },
    // Add a brand-new opportunity to the top of both lists
    addOpportunity: (state, action) => {
      state.list.unshift(action.payload);
      state.myList.unshift(action.payload);
    },
    // Replace the "my opportunities" list (for Profile page)
    setMyOpportunities: (state, action) => {
      state.myList = action.payload;
    },
    // In-place update after edit
    updateOpportunityInStore: (state, action) => {
      const patch = (arr) => {
        const i = arr.findIndex((o) => o._id === action.payload._id);
        if (i !== -1) arr[i] = action.payload;
      };
      patch(state.list);
      patch(state.myList);
    },
    // Remove after delete
    removeOpportunityFromStore: (state, action) => {
      state.list   = state.list.filter((o)   => o._id !== action.payload);
      state.myList = state.myList.filter((o) => o._id !== action.payload);
    },
  },
});

export const {
  setOpportunities,
  appendOpportunities,
  addOpportunity,
  setMyOpportunities,
  updateOpportunityInStore,
  removeOpportunityFromStore,
} = opportunitySlice.actions;

export default opportunitySlice.reducer;