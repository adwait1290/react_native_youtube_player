
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  PixelRatio,
  Dimensions,
  Platform,
  Slider
} from 'react-native';
import YouTube, { YouTubeStandaloneIOS, YouTubeStandaloneAndroid } from 'react-native-youtube';
import { createStore, combineReducers } from 'redux';
import { connect } from 'react-redux';
import { createLogger } from 'redux-logger';
// API CREDENTIALS
const YOUTUBE_API_KEY = 'AIzaSyAD89jHIxIOaoNbWRJjEjxple8_y2orWXs';
const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = Dimensions.get('window');
const VIDEO_CONTAINER_HEIGHT = DEVICE_HEIGHT * 2.0 / 5.0 - FONT_SIZE * 2;
const FONT_SIZE = 14;
const UPDATE = "UPDATE_STATE"
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

const reducer = (state = {}, action) => {
  switch(action.type){
    case UPDATE:
      return action.payload;
    default:
      return state;
    }
    // const newState = Object.assign(state, data)
    // return newState;
  };
const rootReducer = combineReducers({
  reducer
})
const store = createStore(rootReducer);
const action = state => ({
  type: UPDATE,
  payload: state
});

const mapStateToProps = state => ({
  state: state
})
const mapDispatchToProps = dispatch => ({
  action: (state) => {
    dispatch(action(state))
  },
})
store.subscribe(() => {
  console.log(store.getState());
});

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
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
    };
    this.setState = this.updateTheState.bind(this)
  }
  updateTheState(data) {
    modifyState(data);
  }
  shouldComponentUpdate() {
    return true;
  }

  componentWillMount() {
    return true;
  }
  componentDidMount() {
    return true;
  }
  _getSeekSliderPosition() {
    if (
      this.state.currentTime != null &&
      this.state.duration != null
    ) {
      return this.state.currentTime / this.state.duration;
    }
    return 0;
  }
  _onSeekSliderValueChange = value => {
    if (!this.state.isSeeking) {
      this.state.isSeeking = true;
    }
  };
  _onSeekSliderSlidingComplete = async value => {
    this.state.isSeeking = false;
    const seekPosition = value * this.state.duration;
    this._youTubeRef.seekTo(seekPosition);

  };

  render() {
    return (

      <ScrollView
        style={styles.container}
        onLayout={({ nativeEvent: { layout: { width } } }) => {
          if (!this.state.containerMounted) this.setState({ containerMounted: true });
          if (this.state.containerWidth !== width) this.setState({ containerWidth: width });
        }}
      >

        {this.state.containerMounted && (
          <YouTube
            ref={component => {
              this._youTubeRef = component;
            }}
            // You must have an API Key for the player to load in Android
            apiKey={YOUTUBE_API_KEY}
            // Un-comment one of videoId / videoIds / playlist.
            // You can also edit these props while Hot-Loading in development mode to see how
            // it affects the loaded native module
            videoId="ncw4ISEU5ik"
            // videoIds={['HcXNPI-IPPM', 'XXlZfc1TrD0', 'czcjU1w-c6k', 'uMK0prafzw0']}
            // playlistId="PLF797E961509B4EB5"
            play={this.state.isPlaying}
            loop={this.state.isLooping}
            fullscreen={this.state.fullscreen}
            modestBranding={this.state.modestBranding}
            controls={0}
            style={[
              { height: PixelRatio.roundToNearestPixel(this.state.containerWidth / (16 / 9)) },
              styles.player,
            ]}
            onError={e => this.props.action({ error: e.error })}
            onReady={e => this.setState({ isReady: true })}
            onChangeState={e => this.setState({ status: e.state })}
            onChangeQuality={e => this.setState({ quality: e.quality })}
            onChangeFullscreen={e => this.setState({ fullscreen: e.isFullscreen })}
            onProgress={e => this.setState({ duration: e.duration, currentTime: e.currentTime })}
          />
        )}

        {/* Playing / Looping */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.setState(s => ({ isPlaying: !s.isPlaying }))}
          >
            <Text style={styles.buttonText}>
              {this.state.status == 'playing' ? 'Pause' : 'Play'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this.updateObjState(s => ({ isLooping: !s.isLooping }))}
          >
            <Text style={styles.buttonText}>
              {this.state.isLooping ? 'Looping' : 'Not Looping'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Previous / Next video */}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this._youTubeRef && this._youTubeRef.previousVideo()}
          >
            <Text style={styles.buttonText}>Previous Video</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => this._youTubeRef && this._youTubeRef.nextVideo()}
          >
            <Text style={styles.buttonText}>Next Video</Text>
          </TouchableOpacity>
        </View>

        {/* Fullscreen */}
        {!this.state.fullscreen && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this.updateObjState({ fullscreen: true })}
            >
              <Text style={styles.buttonText}>Set Fullscreen</Text>
            </TouchableOpacity>
          </View>
        )}
        {/* Slider for seeking */}
        <Slider
          style={styles.playbackSlider}
          value={this._getSeekSliderPosition()}
          onValueChange={this._onSeekSliderValueChange}
          onSlidingComplete={this._onSeekSliderSlidingComplete}
          disabled={this.state.isLoading}
        />
        {/* Update Progress & Duration (Android) */}
        {Platform.OS === 'android' && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() =>
                this._youTubeRef
                  ? this._youTubeRef
                      .currentTime()
                      .then(currentTime => this.updateObjState({ currentTime }))
                      .catch(errorMessage => this.updateObjState({ error: errorMessage }))
                  : this._youTubeRef
                      .duration()
                      .then(duration => this.updateObjState({ duration }))
                      .catch(errorMessage => this.updateObjState({ error: errorMessage }))
              }
            >
              <Text style={styles.buttonText}>Update Progress & Duration (Android)</Text>
            </TouchableOpacity>
          </View>
        )}



        {/* Reload iFrame for updated props (Only needed for iOS) */}
        {Platform.OS === 'ios' && (
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => this._youTubeRef && this._youTubeRef.reloadIframe()}
            >
              <Text style={styles.buttonText}>Reload iFrame (iOS)</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.instructions}>
          {this.state.isReady ? 'Player is ready' : 'Player setting up...'}
        </Text>
        <Text style={styles.instructions}>Status: {this.state.status}</Text>
        <Text style={styles.instructions}>Quality: {this.state.quality}</Text>

        {/* Show Progress */}
        <Text style={styles.instructions}>
          Progress: ({Math.trunc(this.state.currentTime / 60)}m:{Math.trunc(this.state.currentTime % 60,
          )}s) / ({Math.trunc(this.state.duration / 60)}m:{Math.trunc(
            this.state.duration % 60,
          )}s)
          {Platform.OS !== 'ios' && <Text> (Click Update Progress & Duration)</Text>}
        </Text>

        <Text style={styles.instructions}>
          {this.state.error ? 'Error: ' + this.state.error : ''}
        </Text>
      </ScrollView>
    </Provider>
    );
  }
}
const Container = connect(mapStateToProps, mapDispatchToProps)(App);

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  button: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: 18,
    color: 'blue',
  },
  buttonTextSmall: {
    fontSize: 15,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  player: {
    alignSelf: 'stretch',
    marginVertical: 10,
  },
  playbackSlider: {
    alignSelf: 'stretch',
  },
});
