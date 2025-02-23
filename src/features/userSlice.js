import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const serverUrl = import.meta.env.VITE_SERVER_URL;

const user = {
  mobileNumber: null,
  name: "",
  emailId: "",
  addresses: [],
  wishlist: [],
  bag: [],
  orders: [],
};

const initialState = {
  user,
  loggedIn: false,
  status: "idle",
  error: null,
};

export const loginUser = createAsyncThunk(
  "user/login",
  async (mobileNumber) => {
    const response = await axios.get(
      `${serverUrl}/api/user/login/${mobileNumber}`,
    );
    return response.data;
  },
);

export const getWishlistItems = createAsyncThunk(
  "user/getWishlistItems",
  async (_, { getState }) => {
    const userId = getState().user.user._id || getState().user.user.user._id;

    const response = await axios.get(
      `${serverUrl}/api/user/wishlist/details/${userId}`,
    );
    return response.data;
  },
);

export const addToWishlist = createAsyncThunk(
  "user/addToWishlist",
  async (productObjId, { getState }) => {
    const userId = getState().user.user._id || getState().user.user.user._id;
    const response = await axios.put(`${serverUrl}/api/user/wishlist/add`, {
      userId,
      productObjId,
    });
    return response.data;
  },
);

export const removeFromWishlist = createAsyncThunk(
  "user/removeFromWishlist",
  async (productObjId, { getState }) => {
    const userId = getState().user.user._id || getState().user.user.user._id;
    const response = await axios.put(`${serverUrl}/api/user/wishlist/remove`, {
      userId,
      productObjId,
    });
    return response.data;
  },
);

export const addItemToCartThunk = createAsyncThunk(
  "user/addItemToCart",
  async (itemData, { getState }) => {
    const { productObjId, quantity } = itemData;
    const userId = getState().user.user._id || getState().user.user.user._id;
    const response = await axios.put(`${serverUrl}/api/user/cart/add`, {
      userId,
      productObjId,
      quantity,
    });
    return response.data;
  },
);

export const removeItemFromCartThunk = createAsyncThunk(
  "user/removeItemFromCart",
  async (itemData, { getState }) => {
    const { productObjId } = itemData;
    const userId = getState().user.user._id || getState().user.user.user._id;
    const response = await axios.put(`${serverUrl}/api/user/cart/remove`, {
      userId,
      productObjId,
    });
    return response.data;
  },
);

export const getCartItems = createAsyncThunk(
  "user/getCartDetails",
  async (_, { getState }) => {
    const userId = getState().user.user._id || getState().user.user.user._id;
    const response = await axios.get(
      `${serverUrl}/api/user/cart/details/${userId}`,
    );
    return response.data;
  },
);

export const updatedItemQuantityThunk = createAsyncThunk(
  "user/updatedItemQuanity",
  async ({ productObjId, quantity }, { getState }) => {
    const userId = getState().user.user._id || getState().user.user.user._id;
    const response = await axios.put(
      `${serverUrl}/api/user/cart/item/quantity`,
      {
        userId,
        productObjId,
        quantity,
      },
    );
    return response.data;
  },
);

export const updateUserPersonalDetails = createAsyncThunk(
  "user/updatePersonalInfo",
  async (payload, { getState }) => {
    console.log("Thunk");
    const userId = getState().user.user._id || getState().user.user.user._id;
    const response = await axios.put(`${serverUrl}/api/user/update/details`, {
      userId,
      payload,
    });
    console.log(response.data);
    return response.data;
  },
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    resetStatus: (state) => {
      state.status = "idle";
    },
    addItemToCartAction: (state, action) => {
      const itemIndex = state.user.bag.findIndex(
        (item) => item.item._id === action.payload._id,
      );
      if (itemIndex != -1) {
        const quantity = state.user.bag[itemIndex].quantity + 1;
        state.user.bag[itemIndex] = { item: action.payload, quantity };
      } else {
        state.user.bag.push({ item: action.payload, quantity: 1 });
      }
    },
    removeItemFromCartAction: (state, action) => {
      state.user.bag = state.user.bag.filter(
        (item) => item.item._id != action.payload._id,
      );
    },
    updateItemQuantityAction: (state, action) => {
      const itemIndex = state.user.bag.findIndex(
        (item) => item.item._id === action.payload.productObjId,
      );
      state.user.bag[itemIndex].quantity = action.payload.quantity;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(loginUser.pending, (state) => {
      state.status = "verifyingUser";
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.status = "loginSuccessful";
      state.loggedIn = true;
      state.user = action.payload;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.status = "loginFailed";
      state.error = action.payload;
    });
    builder.addCase(addToWishlist.pending, (state) => {
      state.status = "addingToWishlist";
    });
    builder.addCase(addToWishlist.fulfilled, (state, action) => {
      state.status = "addedToWishList";
      state.user.wishlist = action.payload.wishlist;
    });
    builder.addCase(addToWishlist.rejected, (state, action) => {
      state.status = "failedToWishlist";
      state.error = action.payload;
    });
    builder.addCase(removeFromWishlist.pending, (state) => {
      state.status = "removingFromWishlist";
    });
    builder.addCase(removeFromWishlist.fulfilled, (state, action) => {
      state.status = "removedFromWishList";
      state.user.wishlist = action.payload.wishlist;
    });
    builder.addCase(removeFromWishlist.rejected, (state, action) => {
      state.status = "failedToRemoveFromWishlist";
      state.error = action.payload;
    });
    builder.addCase(getWishlistItems.pending, (state) => {
      state.status = "fetchingWishlistItems";
    });
    builder.addCase(getWishlistItems.fulfilled, (state, action) => {
      state.status = "wishlistItemsRetrived";
      state.user.wishlist = action.payload.wishlist;
    });
    builder.addCase(getWishlistItems.rejected, (state, action) => {
      state.status = "failedToFetchWishlistItems";
      state.error = action.payload;
    });
    builder.addCase(addItemToCartThunk.pending, (state) => {
      state.status = "addingItemToCart";
    });
    builder.addCase(addItemToCartThunk.fulfilled, (state, action) => {
      state.status = "addedItemToCart";
      state.user.bag = action.payload.cart;
    });
    builder.addCase(addItemToCartThunk.rejected, (state, action) => {
      state.status = "failedToAddToCart";
      state.error = action.payload;
    });
    builder.addCase(getCartItems.pending, (state) => {
      state.status = "fetchingCartItems";
    });
    builder.addCase(getCartItems.fulfilled, (state, action) => {
      state.status = "cartItemsRetrived";
      state.user.bag = action.payload.cart;
    });
    builder.addCase(getCartItems.rejected, (state, action) => {
      state.status = "failedToFetchCartItems";
      state.error = action.payload;
    });
    builder.addCase(removeItemFromCartThunk.pending, (state) => {
      state.status = "removingFromCart";
    });
    builder.addCase(removeItemFromCartThunk.fulfilled, (state, action) => {
      state.status = "removedFromCart";
      state.user.bag = action.payload.cart;
    });
    builder.addCase(removeItemFromCartThunk.rejected, (state, action) => {
      state.status = "failedToRemoveFromWCart";
      state.error = action.payload;
    });
    builder.addCase(updatedItemQuantityThunk.pending, (state) => {
      state.status = "updatingItemQuanity";
    });
    builder.addCase(updatedItemQuantityThunk.fulfilled, (state, action) => {
      state.status = "quantityUpdated";
      state.user.bag = action.payload.cart;
    });
    builder.addCase(updatedItemQuantityThunk.rejected, (state, action) => {
      state.status = "failedToUpdatedQuantity";
      state.error = action.payload;
    });
    builder.addCase(updateUserPersonalDetails.pending, (state) => {
      state.status = "updatingUserInfo";
    });
    builder.addCase(updateUserPersonalDetails.fulfilled, (state, action) => {
      state.status = "userInfoUpdated";
      console.log(action.payload.user);
      state.user = action.payload.user;
    });
    builder.addCase(updateUserPersonalDetails.rejected, (state, action) => {
      state.status = "failedToUpdateUserInfo";
      state.error = action.payload;
    });
  },
});

export const {
  resetStatus,
  addItemToCartAction,
  removeItemFromCartAction,
  updateItemQuantityAction,
} = userSlice.actions;
export default userSlice.reducer;
