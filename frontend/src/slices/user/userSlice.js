import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    userInfo: localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo'))
        : null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        updateHealthPool: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                healthPool: action.payload,
            };
            // Only include if you want local storage to change otherwise will just be a visual instance
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        },
        updateAttackLvl: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                attackLvl: action.payload,
            };
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        },
        updateAttackXp: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                attackXp: action.payload,
            };
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        },
        updateStrengthLvl: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                strengthLvl: action.payload,
            };
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        },
        updateStrengthXp: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                strengthXp: action.payload,
            };
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        },
        updateDefenseLvl: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                defenseLvl: action.payload,
            };
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        },
        updateDefenseXp: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                defenseXp: action.payload,
            };
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        },
        updateHitpointsLvl: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                hitpointsLvl: action.payload,
            };
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        },
        updateHitpointsXp: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                hitpointsXp: action.payload,
            };
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        },
        updateJossPaper: (state, action) => {
            state.userInfo = {
                ...state.userInfo,
                jossPaper: action.payload,
            };
            localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
        },
    },
});

export const {
    updateHealthPool,
    updateAttackLvl,
    updateAttackXp,
    updateStrengthLvl,
    updateStrengthXp,
    updateDefenseLvl,
    updateDefenseXp,
    updateHitpointsLvl,
    updateHitpointsXp,
    updateJossPaper,
} = userSlice.actions;

export default userSlice.reducer;

// import calculateCombatLevel from '../../utils/combatLevel.js';
// import { updateHealthPool } from '../../slices/user/userSlice.js';

// Grabs user information
//const { user } = useSelector((state) => state.user);

// Calc combat level
// const combatLevel = calculateCombatLevel(
//     userInfo.attackLvl,
//     userInfo.defenseLvl,
//     userInfo.strengthLvl,
//     userInfo.hitpointsLvl
// );

// Example of incrementing to change status
// const handleAttackLvlIncrement = () => {
//     const newHealthPool = userInfo.healthPool + 1; // Increment the attackLvl
//     dispatch(updateHealthPool(newHealthPool)); // Dispatch the action to update the Redux state
// };

// visual rep
{
    /* <div>
    <h2>{userInfo.username}</h2>
    <p>Email: {userInfo.email}</p>
    <p>Combat Level: {combatLevel}</p>
    <p>Health: {userInfo.healthPool}</p>
    <button onClick={handleAttackLvlIncrement}>Increase Attack Level</button>
</div>; */
}
