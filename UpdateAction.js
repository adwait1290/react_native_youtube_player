import { connect } from 'react-redux';

import * as Actions from './ActionTypes';
import MainComponent from './MainComponent';

const mapStateToProps = (state) => ({
     isReady: state.updateReducer.isReady,
     status: state.updateReducer.status,
     quality: state.updateReducer.quality,
     error: state.updateReducer.error,
     isPlaying: state.updateReducer.isPlaying,
     isLooping: state.updateReducer.isLooping,
     duration: state.updateReducer.duration,
     status: state.updateReducer.status,
     duration: state.updateReducer.duration,
     currentTime: state.updateReducer.currentTime,
     fullscreen: state.updateReducer.fullscreen,
     containerMounted: state.updateReducer.containerMounted,
     containerWidth: state.updateReducer.containerWidth,
     isSeeking: state.updateReducer.isSeeking,
     modestBranding: state.updateReducer.modestBranding,
});

const mapDispatchToProps = (dispatch) => ({
    update: (data) => dispatch({type: Actions.UPDATE,
                                payload: data}),
});

export default connect(mapStateToProps, mapDispatchToProps)(MainComponent);
