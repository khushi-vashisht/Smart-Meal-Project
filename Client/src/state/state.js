import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setLogin: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            // Store in localStorage
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            localStorage.setItem('token', action.payload.token);
        },
        setLogout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            // Clear localStorage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        },
    }
})

export const { setLogin, setLogout } = authSlice.actions;
export default authSlice.reducer;