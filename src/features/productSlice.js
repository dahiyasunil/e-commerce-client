import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { act } from "react";

const serverUrl = import.meta.env.VITE_SERVER_URL;

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (keywords, { getState }) => {
    const { user } = getState().user;
    const userMobileNo = user.mobileNumber;
    const response = await axios.get(`${serverUrl}/api/products/`, {
      params: { search: keywords },
      headers: {
        "X-Mobile-No": userMobileNo,
      },
    });
    return response.data;
  },
);

export const filters = {
  category: [],
  price: null,
  rating: null,
  sortBy: {
    price: "",
  },
};

const isAnyFilterSet = ({ category, price, rating, sortBy }) => {
  if (
    category.length > 0 ||
    price !== null ||
    rating !== null ||
    sortBy.price !== ""
  ) {
    return true;
  }
  return false;
};

const initialState = {
  products: [],
  status: "idle",
  error: null,
  isFilter: false,
  filters,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    updateFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.isFilter = isAnyFilterSet(state.filters);
    },
    addProductToWishlist: (state, action) => {
      const productIndex = state.products.findIndex(
        (product) => product._id === action.payload,
      );
      state.products[productIndex].isWishlisted = true;
    },
    removeProductFromWishlist: (state, action) => {
      const productIndex = state.products.findIndex(
        (product) => product._id === action.payload,
      );
      state.products[productIndex].isWishlisted = false;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchProducts.pending, (state) => {
      state.status = "loading";
    });
    builder.addCase(fetchProducts.fulfilled, (state, action) => {
      state.status = "success";
      state.products = action.payload;
    });
    builder.addCase(fetchProducts.rejected, (state, action) => {
      state.status = "error";
      state.error = action.payload;
    });
  },
});

export const {
  updateFilters,
  addProductToWishlist,
  removeProductFromWishlist,
} = productSlice.actions;
export default productSlice.reducer;
