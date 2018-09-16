import { combineReducers, createStore } from 'redux';

import updateReducer from './UpdateReducer'

const AppReducers = combineReducers({
    updateReducer,
});

const rootReducer = (state, action) => {
	return AppReducers(state,action);
}

let store = createStore(rootReducer);

export default store;
