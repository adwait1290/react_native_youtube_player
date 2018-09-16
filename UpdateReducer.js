import * as Actions from './ActionTypes'

const defaultState = {
  isReady: false,
  status: null,
  quality: null,
  error: null,
  isPlaying: true,
  isLooping: true,
  duration: 0,
  currentTime: 0,
  fullscreen: false,
  containerMounted: false,
  containerWidth: null,
  isSeeking: false,
  modestBranding: false
}
const UpdateReducer = (state = defaultState, action) => {
    switch (action.type) {
        case Actions.UPDATE:
            return Object.assign({}, state, action.payload);
        default:
            return state;
    }
}

export default UpdateReducer;
